import { Collection, MongoClient, ObjectId } from "mongodb";
import { addUserToDb, getUserByID } from "../src/db/User/user";
import { getCollection } from "../src/db/mongoCollections";
import { User } from "../src/db/types";
import { DbOperationError } from "../src/errorClasses";
import { createToken } from "rest/util";

// getCollection mock
jest.mock("../src/db/mongoCollections");
type mockGetCollectionSignature = <T>(
	collection: "user" | "rating" | "place"
) => Promise<{ _col: Partial<Collection<T>>; _connection: Partial<MongoClient> }>;
const mockGetCollection = getCollection as jest.MockedFunction<mockGetCollectionSignature>;

// mock adding to a collection
let mockCollection: User[];
const mockInsertOne = jest.fn().mockImplementation((user: User) => {
	mockCollection.push(user);
	return { acknowledged: true };
});
const mockFindOne = jest.fn().mockImplementation(({ _id: id }: { _id: ObjectId }) => {
	return mockCollection.find(value => id.equals(value._id as ObjectId));
});
const mockClose = jest.fn();
mockGetCollection.mockResolvedValue({
	_col: { insertOne: mockInsertOne, findOne: mockFindOne },
	_connection: { close: mockClose },
});

const mockUser: User = {
	email: "ilovecheese@hotmail.com",
	hash: "2eb80383e8247580e4397273309c24e0003329427012d5048dcb203e4b280823",
	isBlindMode: true,
	doesNotPreferHelp: false,
	readsBraille: true,
	token: createToken(),
	dateTokenCreated: new Date(),
};

beforeEach(() => {
	mockCollection = [];
	mockInsertOne.mockClear();
	mockFindOne.mockClear();
	mockClose.mockClear();
});

describe("User-related database function tests", () => {
	it("successfully adds a user", async () => {
		const insertedUser = await addUserToDb(mockUser);

		expect(insertedUser).toEqual(mockUser);
		expect(mockCollection).toContain(mockUser);
		expect(mockClose).toHaveBeenCalled();
	});

	it("throws an error when it fails to add a user", () => {
		mockInsertOne.mockImplementationOnce((user: User) => {
			mockCollection.push(user);
			return { acknowledged: false };
		});

		addUserToDb(mockUser).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});

	it("successfully gets a user", async () => {
		const idString = "618cacca81bc431f3dcde5bd";
		const mockUser2 = {
			_id: new ObjectId(idString),
			email: "ilovecheese@hotmail.com",
			hash: "2eb80383e8247580e4397273309c24e0003329427012d5048dcb203e4b280823",
			isBlindMode: true,
			doesNotPreferHelp: false,
			readsBraille: true,
		};
		mockCollection.push(mockUser2);

		const foundUser = await getUserByID(new ObjectId(idString));

		expect(mockClose).toHaveBeenCalled();
		expect(foundUser).toEqual(mockUser2);
	});

	it("throws an error when getting a user that has not been added", () => {
		const idString = "618cacca81bc431f3dcde5bd";
		// no user is added!

		getUserByID(new ObjectId(idString)).catch(e => {
			expect(e).toBeInstanceOf(DbOperationError);
			expect(mockClose).toHaveBeenCalled();
		});
	});
});
