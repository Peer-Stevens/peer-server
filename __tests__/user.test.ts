import { Collection, MongoClient, ObjectId } from "mongodb";
import {
	addUserToDb,
	getUserByEmailAndHash,
	getUserByEmailOnly,
	getUserByID,
} from "../src/db/User/user";
import { getCollection } from "../src/db/mongoCollections";
import { User } from "../src/db/types";
import { AuthenticationError, DbOperationError } from "../src/errorClasses";
import { createToken } from "../src/rest/util";

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

// mock data
const mockUser = {
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

	it("successfully gets a user by id", async () => {
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

	it("throws an error when getting a user by id that has not been added", () => {
		const idString = "618cacca81bc431f3dcde5bd";
		// no user is added!

		getUserByID(new ObjectId(idString)).catch(e => {
			expect(e).toBeInstanceOf(DbOperationError);
			expect(mockClose).toHaveBeenCalled();
		});
	});

	it("successfully gets a user by email", async () => {
		mockCollection.push(mockUser);
		mockFindOne.mockImplementationOnce(({ email: email }: { email: string }) => {
			return mockCollection.find(value => email === value.email);
		});

		const foundUser = await getUserByEmailOnly(mockUser.email);

		expect(mockClose).toHaveBeenCalled();
		expect(foundUser).toEqual(mockUser);
	});

	it("throws an error when getting a user by email that has not been added", () => {
		mockFindOne.mockImplementationOnce(({ email: email }: { email: string }) => {
			return mockCollection.find(value => email === value.email);
		});
		// user has not been added!

		getUserByEmailOnly(mockUser.email).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(AuthenticationError);
		});
	});

	it("successfully gets a user by their email and hash", async () => {
		mockCollection.push(mockUser);
		mockFindOne.mockImplementationOnce(
			({ email: email, hash: hash }: { email: string; hash: string }) => {
				return mockCollection.find(value => email === value.email && hash === value.hash);
			}
		);

		const foundUser = await getUserByEmailAndHash(mockUser.email, mockUser.hash);

		expect(mockClose).toHaveBeenCalled();
		expect(foundUser).toEqual(mockUser);
	});

	it("throws an error when getting a user by email that has not been added", () => {
		mockFindOne.mockImplementationOnce(
			({ email: email, hash: hash }: { email: string; hash: string }) => {
				return mockCollection.find(value => email === value.email && hash === value.hash);
			}
		);
		// user has not been added!

		getUserByEmailAndHash(mockUser.email, mockUser.hash).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(AuthenticationError);
		});
	});
});
