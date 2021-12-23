import { MongoClient, Collection } from "mongodb";
import { createToken } from "../src/rest/util";
import { getCollection } from "../src/db/mongoCollections";

jest.useFakeTimers();

// getCollection mock
jest.mock("../src/db/mongoCollections");
type mockGetCollectionSignature = <T>(
	collection: "user" | "rating" | "place"
) => Promise<{ _col: Partial<Collection<T>>; _connection: Partial<MongoClient> }>;
const mockGetCollection = getCollection as jest.MockedFunction<mockGetCollectionSignature>;
const mockFindOne = jest.fn();
const mockClose = jest.fn();

mockGetCollection.mockResolvedValue({
	_col: { findOne: mockFindOne },
	_connection: { close: mockClose },
});

beforeEach(() => {
	mockFindOne.mockClear();
	mockClose.mockClear();
});

describe("Utility function tests", () => {
	describe("Create token tests", () => {
		it("should connect to the server and close the connection", async () => {
			mockFindOne.mockResolvedValueOnce(null);

			await createToken();

			expect(mockFindOne).toHaveBeenCalled();
			expect(mockClose).toHaveBeenCalled();
		});

		it("should only look in the database once if the token generated was unique", async () => {
			mockFindOne.mockResolvedValueOnce(null);

			await createToken();

			expect(mockFindOne).toHaveBeenCalledTimes(1);
		});

		it("should continue looking in the database if the token generated was not unique", async () => {
			const mockTokens: string[] = [];
			mockFindOne.mockImplementation((token: string) => {
				return new Promise(resolve => {
					if (mockTokens.includes(token)) resolve(token);
					else resolve(null);
				});
			});
			mockTokens.push(await createToken());

			const token = await createToken();

			expect(mockTokens).not.toContain(token);
			expect(mockFindOne.mock.calls.length).toBeGreaterThan(1);
		});
	});
});
