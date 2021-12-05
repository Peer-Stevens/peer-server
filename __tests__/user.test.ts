import { Collection, MongoClient } from "mongodb";
import { addUserToDb } from "../src/db/User/user";
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
const mockClose = jest.fn();
mockGetCollection.mockResolvedValue({
	_col: { insertOne: mockInsertOne },
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
});

describe("User-related database function tests", () => {
	it("successfully adds a user", async () => {
		const insertedUser = await addUserToDb(mockUser);
		expect(insertedUser).toEqual(mockUser);
		expect(mockCollection).toContain(mockUser);
	});

	it("throws an error when it fails to add a user", () => {
		const mockInsertOne = jest.fn().mockImplementation((user: User) => {
			mockCollection.push(user);
			return { acknowledged: false };
		});
		const mockClose = jest.fn();
		mockGetCollection.mockResolvedValue({
			_col: { insertOne: mockInsertOne },
			_connection: { close: mockClose },
		});

		addUserToDb(mockUser).catch(e => {
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});
});
