import { Collection, MongoClient, ObjectId } from "mongodb";
import { Rating } from "../src/db/types";
import { getCollection } from "../src/db/mongoCollections";

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
	const got = mockCollection.find(value => id.equals(value._id as ObjectId));
	return got ? got : null;
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
