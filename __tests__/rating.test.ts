import { Collection, MongoClient, ObjectId } from "mongodb";
import { Rating } from "../src/db/types";
import { getCollection } from "../src/db/mongoCollections";
import { getRatingById } from "../src/db/Rating/rating";
import { DbOperationError } from "../src/errorClasses";

// getCollection mock
jest.mock("../src/db/mongoCollections");
type mockGetCollectionSignature = <T>(
	collection: "user" | "rating" | "place"
) => Promise<{ _col: Partial<Collection<T>>; _connection: Partial<MongoClient> }>;
const mockGetCollection = getCollection as jest.MockedFunction<mockGetCollectionSignature>;

// mock adding to a collection
let mockCollection: Rating[];
const mockInsertOne = jest.fn().mockImplementation((rating: Rating) => {
	mockCollection.push(rating);
	return { acknowledged: true };
});
const mockFindOne = jest.fn().mockImplementation(({ _id: id }: { _id: ObjectId }) => {
	return new Promise(resolve => {
		const got = mockCollection.find(value => id.equals(value._id as ObjectId));
		got ? resolve(got) : resolve(null);
	});
});
const mockUpdateOne = jest
	.fn()
	.mockImplementation(
		({ _id: id }: { _id: ObjectId }, { $set: newRating }: { $set: Partial<Rating> }) => {
			const old = mockCollection.find(value => id.equals(value._id as ObjectId));
			mockCollection.pop();
			mockCollection.push({
				_id: id,
				userID: old?.userID as ObjectId,
				placeID: old?.placeID as string,
				braille: newRating.braille ? newRating.braille : old?.braille || null,
				fontReadability: newRating.fontReadability
					? newRating.fontReadability
					: old?.fontReadability || null,
				staffHelpfulness: newRating.staffHelpfulness
					? newRating.staffHelpfulness
					: old?.staffHelpfulness || null,
				navigability: newRating.navigability
					? newRating.navigability
					: old?.navigability || null,
				guideDogFriendly: newRating.guideDogFriendly
					? newRating.guideDogFriendly
					: old?.guideDogFriendly || null,
				comment: newRating.comment ? newRating.comment : (old?.comment as string),
				dateCreated: old?.dateCreated as Date,
			});
			return { acknowledged: true };
		}
	);
const mockClose = jest.fn();
mockGetCollection.mockResolvedValue({
	_col: { insertOne: mockInsertOne, findOne: mockFindOne, updateOne: mockUpdateOne },
	_connection: { close: mockClose },
});

// mock data

const mockRating1: Rating = {
	_id: new ObjectId("617cacca81bc431f3dcde5be"),
	userID: new ObjectId("617ccccc81bc431f3dcde5bd"),
	placeID: "fakeplace123",
	braille: 4,
	fontReadability: null,
	guideDogFriendly: 5,
	navigability: 2,
	staffHelpfulness: 1,
	comment: null,
	dateCreated: new Date(),
};

beforeEach(() => {
	mockCollection = [];
	mockClose.mockClear();
	mockFindOne.mockClear();
	mockInsertOne.mockClear();
	mockUpdateOne.mockClear();
});

describe("Rating-related database function tests", () => {
	it("gets a rating by its ID successfully", async () => {
		const idString = "617cacca81bc431f3ccde5be";
		const mockRating2 = {
			_id: new ObjectId(idString),
			userID: new ObjectId("617ccccc81bc431f3dcde5bd"),
			placeID: "fakeplace456",
			braille: null,
			fontReadability: 3,
			guideDogFriendly: 1,
			navigability: 3,
			staffHelpfulness: 1,
			comment: null,
			dateCreated: new Date(),
		};
		mockCollection.push(mockRating2);

		const foundRating = await getRatingById(new ObjectId(idString));

		expect(mockClose).toHaveBeenCalled();
		expect(foundRating).toEqual(mockRating2);
	});

	it("throws an error when trying to get a rating by its ID and there is a remote problem", () => {
		mockFindOne.mockResolvedValueOnce(null);

		expect.assertions(2);
		getRatingById(new ObjectId(mockRating1._id)).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});
});
