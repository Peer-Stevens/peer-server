import { Collection, MongoClient, ObjectId } from "mongodb";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";
import { Rating } from "../src/db/types";
import { getCollection } from "../src/db/mongoCollections";
import {
	addRating,
	deleteRatingFromDb,
	editRatingInDb,
	getAllRatingsForPlace,
	getAllRatingsFromUser,
	getRatingById,
} from "../src/db/Rating/rating";
import { updatePlace } from "../src/db/Place/place";
import { DbOperationError } from "../src/errorClasses";

// external db function mocks
jest.mock("../src/db/Place/place");
const mockUpdatePlace = updatePlace as jest.MockedFunction<typeof updatePlace>;

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
	return new Promise(resolve => {
		resolve({ acknowledged: true, insertedId: rating._id });
	});
});
const mockFindOne = jest.fn().mockImplementation(({ _id: id }: { _id: ObjectId }) => {
	return new Promise(resolve => {
		const got = mockCollection.find(value => id.equals(value._id as ObjectId));
		got ? resolve(got) : resolve(null);
	});
});
const mockFind = jest
	.fn()
	.mockImplementation(({ placeID: id }: { placeID: GooglePlaceID["place_id"] }) => {
		const got = mockCollection.filter(value => value.placeID === id);
		return {
			toArray: () => {
				return new Promise(resolve => resolve(got));
			},
		};
	});
const mockUpdateOne = jest.fn();
const mockDeleteOne = jest.fn().mockImplementation(({ _id: id }: { _id: ObjectId }) => {
	return new Promise(resolve => {
		mockCollection = mockCollection.filter(value => value._id !== id);
		resolve({ deletedCount: 1 });
	});
});
const mockClose = jest.fn();
mockGetCollection.mockResolvedValue({
	_col: {
		insertOne: mockInsertOne,
		findOne: mockFindOne,
		updateOne: mockUpdateOne,
		find: mockFind,
		deleteOne: mockDeleteOne,
	},
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

const mockRating2: Rating = {
	_id: new ObjectId("617cacca81bc431f3dcde5be"),
	userID: new ObjectId("617cacca8123431f3dcde5bd"),
	placeID: "fakeplace123",
	braille: 3.5,
	fontReadability: null,
	guideDogFriendly: 1,
	navigability: 2,
	staffHelpfulness: 2.5,
	comment: null,
	dateCreated: new Date(),
};

const mockRating3: Rating = {
	_id: new ObjectId("617cacca81bc431f3dcde5be"),
	userID: new ObjectId("617ccccc81bc431f3dcde5bd"),
	placeID: "fakeplace456",
	braille: 2,
	fontReadability: null,
	guideDogFriendly: 3,
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
	mockUpdatePlace.mockClear();
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
		expect.assertions(2);
		getRatingById(new ObjectId(mockRating1._id)).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});

	it("gets all ratings for a place", async () => {
		mockCollection = [mockRating1, mockRating2, mockRating3];

		const foundRatings = await getAllRatingsForPlace(mockRating1.placeID);

		expect(mockClose).toHaveBeenCalled();
		expect(foundRatings).toContain(mockRating1);
		expect(foundRatings).toContain(mockRating2);
		expect(foundRatings).not.toContain(mockRating3);
	});

	it("throws an error if no ratings could be found for a requested place", () => {
		// no ratings added!

		expect.assertions(2);
		getAllRatingsForPlace(mockRating1.placeID).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});

	it("gets all ratings from a user", async () => {
		mockFind.mockImplementationOnce(({ userID: id }: { userID: ObjectId }) => {
			const got = mockCollection.filter(value => value.userID.equals(id));
			return {
				toArray: () => {
					return new Promise(resolve => resolve(got));
				},
			};
		});
		mockCollection = [mockRating1, mockRating2, mockRating3];

		const foundRatings = await getAllRatingsFromUser(mockRating1.userID);

		expect(mockClose).toHaveBeenCalled();
		expect(foundRatings).toContain(mockRating1);
		expect(foundRatings).toContain(mockRating3);
		expect(foundRatings).not.toContain(mockRating2);
	});

	it("throws if cannot find any ratings from requested user", () => {
		mockFind.mockImplementationOnce(({ userID: id }: { userID: ObjectId }) => {
			const got = mockCollection.filter(value => value.userID.equals(id));
			return {
				toArray: () => {
					return new Promise(resolve => resolve(got));
				},
			};
		});
		// no ratings added!

		expect.assertions(2);
		getAllRatingsFromUser(mockRating1.userID).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});

	it("deletes a rating from the database", async () => {
		mockCollection.push(mockRating1);

		const didDelete = await deleteRatingFromDb(mockRating1._id as ObjectId);

		expect(mockClose).toHaveBeenCalled();
		expect(didDelete).toBe(true);
		expect(mockCollection).not.toContain(mockRating1);
	});

	it("returns false when attempting to delete something not in the database", async () => {
		mockDeleteOne.mockResolvedValueOnce({ deletedCount: 0 });

		const didDelete = await deleteRatingFromDb(mockRating1._id as ObjectId);

		expect(mockClose).toHaveBeenCalled();
		expect(didDelete).toBe(false);
	});

	it("edits a rating in the database", async () => {
		mockCollection.push(mockRating1);
		mockUpdateOne.mockResolvedValueOnce({ acknowledged: true });

		await editRatingInDb(mockRating1._id as ObjectId, { braille: 0 });

		expect(mockClose).toHaveBeenCalled();
		expect(mockUpdateOne).toHaveBeenCalled();
	});

	it("throws an error while editing if there is a problem with the remote database", () => {
		mockCollection.push(mockRating1);
		mockUpdateOne.mockResolvedValueOnce({ acknowledged: false });

		expect.assertions(2);
		editRatingInDb(mockRating1._id as ObjectId, { braille: 0 }).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});

	it("adds a rating into the database", async () => {
		mockFindOne.mockImplementationOnce(
			({
				userID: userID,
				placeID: placeID,
			}: {
				userID: ObjectId;
				placeID: GooglePlaceID;
			}) => {
				const got = mockCollection.find(value => {
					return value.userID === userID && value.placeID === placeID;
				});
				return new Promise(resolve => {
					got ? resolve(got) : resolve(null);
				});
			}
		);

		const addedRating = await addRating(mockRating1);

		expect(mockClose).toHaveBeenCalled();
		expect(addedRating).toEqual(mockRating1);
		expect(mockCollection).toContain(mockRating1);
	});

	it("throws an error if there is already a rating on this place by this user", () => {
		mockCollection.push(mockRating1);
		mockFindOne.mockImplementationOnce(
			({
				userID: userID,
				placeID: placeID,
			}: {
				userID: ObjectId;
				placeID: GooglePlaceID;
			}) => {
				const got = mockCollection.find(value => {
					return value.userID === userID && value.placeID === placeID;
				});
				return new Promise(resolve => {
					got ? resolve(got) : resolve(null);
				});
			}
		);

		expect.assertions(2);
		addRating(mockRating1).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});

	it("throws an error if there was an error inserting into the remote collection", () => {
		mockInsertOne.mockResolvedValueOnce({ acknowledged: false });

		expect.assertions(2);
		addRating(mockRating1).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});
});
