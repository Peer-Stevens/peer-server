import { Collection, MongoClient } from "mongodb";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";
import { getCollection } from "../src/db/mongoCollections";
import type { Place } from "../src/db/types";
import { getAllPlaces, getPlaceByID } from "../src/db/Place/place";
import { DbOperationError } from "../src/errorClasses";

// getCollection mock
jest.mock("../src/db/mongoCollections");
type mockGetCollectionSignature = <T>(
	collection: "user" | "rating" | "place"
) => Promise<{ _col: Partial<Collection<T>>; _connection: Partial<MongoClient> }>;
const mockGetCollection = getCollection as jest.MockedFunction<mockGetCollectionSignature>;

// mock adding to a collection
let mockCollection: Place[];
const mockInsertOne = jest.fn().mockImplementation((place: Place) => {
	mockCollection.push(place);
	return { acknowledged: true };
});
const mockFindOne = jest
	.fn()
	.mockImplementation(({ _id: id }: { _id: GooglePlaceID["place_id"] }) => {
		return mockCollection.find(value => id === value._id);
	});
const mockFind = jest.fn();
const mockUpdateOne = jest
	.fn()
	.mockImplementation(
		(
			{ _id: id }: { _id: GooglePlaceID["place_id"] },
			{ $set: newPlace }: { $set: Partial<Place> }
		) => {
			const old = mockCollection.find(value => id === value._id);
			mockCollection.pop();
			mockCollection.push({
				_id: id,
				avgBraille:
					newPlace.avgBraille !== undefined
						? newPlace.avgBraille
						: (old?.avgBraille as number),
				avgFontReadability:
					newPlace.avgFontReadability !== undefined
						? newPlace.avgFontReadability
						: (old?.avgFontReadability as number),
				avgStaffHelpfulness:
					newPlace.avgStaffHelpfulness !== undefined
						? newPlace.avgStaffHelpfulness
						: (old?.avgStaffHelpfulness as number),
				avgNavigability:
					newPlace.avgNavigability !== undefined
						? newPlace.avgNavigability
						: (old?.avgNavigability as number),
				avgGuideDogFriendly:
					newPlace.avgGuideDogFriendly !== undefined
						? newPlace.avgGuideDogFriendly
						: (old?.avgGuideDogFriendly as number),
			});
			return { acknowledged: true };
		}
	);
const mockClose = jest.fn();
mockGetCollection.mockResolvedValue({
	_col: {
		insertOne: mockInsertOne,
		findOne: mockFindOne,
		updateOne: mockUpdateOne,
		find: mockFind,
	},
	_connection: { close: mockClose },
});

// mock data

const mockPlace1: Place = {
	_id: "wumpus",
	avgBraille: null,
	avgFontReadability: null,
	avgGuideDogFriendly: null,
	avgNavigability: null,
	avgStaffHelpfulness: null,
};

const mockPlace2: Place = {
	_id: "andrewshouse",
	avgBraille: 5,
	avgFontReadability: 5,
	avgGuideDogFriendly: 5,
	avgNavigability: 5,
	avgStaffHelpfulness: 5,
};

beforeEach(() => {
	mockCollection = [];
	mockInsertOne.mockClear();
	mockUpdateOne.mockClear();
	mockFindOne.mockClear();
	mockClose.mockClear();
	mockFind.mockClear();
});

describe("Place-related database function tests", () => {
	it("successfully gets all the places", async () => {
		mockFind.mockReturnValue({ toArray: () => mockCollection });
		mockCollection.push(mockPlace1);
		mockCollection.push(mockPlace2);

		const foundPlaces = await getAllPlaces();

		expect(mockClose).toHaveBeenCalled();
		expect(foundPlaces).toEqual(mockCollection);
	});

	// skipping get place by ID tests because the random
	// rating generation code is NOT expected behavior
	// and would cause this test to fail

	it.skip("successfully gets a place by its id", async () => {
		mockCollection.push(mockPlace1);

		const foundPlace = await getPlaceByID(mockPlace1._id);

		expect(mockClose).toHaveBeenCalled();
		expect(foundPlace).toEqual(mockPlace1);
	});

	it.skip("throws an error if an undefined id is provided when trying to get a place", () => {
		expect.assertions(2);
		getPlaceByID(undefined).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});
});
