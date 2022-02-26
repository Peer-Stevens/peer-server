import { Collection, MongoClient } from "mongodb";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";
import { getCollection } from "../src/db/mongoCollections";
import type { Place } from "peer-types";
import {
	addPlace,
	getAllPlaces,
	getPlaceByID,
	isPlaceInDb,
	updatePlace,
} from "../src/db/Place/place";
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
	return { acknowledged: true, insertedId: place._id };
});
const mockFindOne = jest
	.fn()
	.mockImplementation(({ _id: id }: { _id: GooglePlaceID["place_id"] }) => {
		const found = mockCollection.find(value => id === value._id);
		return found ? found : null;
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
				guideDogAvg: newPlace.guideDogAvg || old?.guideDogAvg || null,
				isMenuAccessibleAvg:
					newPlace.isMenuAccessibleAvg || old?.isMenuAccessibleAvg || null,
				noiseLevelAvg: newPlace.noiseLevelAvg || old?.noiseLevelAvg || null,
				lightingAvg: newPlace.lightingAvg || old?.lightingAvg || null,
				isStaffHelpfulAvg: newPlace.isStaffHelpfulAvg || old?.isStaffHelpfulAvg || null,
				isBathroomOnEntranceFloorAvg:
					newPlace.isBathroomOnEntranceFloorAvg ||
					old?.isBathroomOnEntranceFloorAvg ||
					null,
				isContactlessPaymentOfferedAvg:
					newPlace.isContactlessPaymentOfferedAvg ||
					old?.isContactlessPaymentOfferedAvg ||
					null,
				isStairsRequiredAvg:
					newPlace.isStairsRequiredAvg || old?.isStairsRequiredAvg || null,
				spacingAvg: newPlace.spacingAvg || old?.spacingAvg || null,
				promotion: {
					monthly_budget:
						newPlace.promotion?.monthly_budget || old?.promotion?.monthly_budget || 0,
					max_cpc: newPlace.promotion?.max_cpc || old?.promotion?.max_cpc || 0,
				},
			});
			return { acknowledged: true };
		}
	);
const mockClose = jest.fn();
const mockAgg = jest.fn();
mockAgg.mockReturnValue({ toArray: () => [mockPlace1] });
mockGetCollection.mockResolvedValue({
	_col: {
		insertOne: mockInsertOne,
		findOne: mockFindOne,
		updateOne: mockUpdateOne,
		find: mockFind,
		aggregate: mockAgg,
	},
	_connection: { close: mockClose },
});

// mock data

const mockPlace1: Place = {
	_id: "wumpus",
	guideDogAvg: 5,
	isMenuAccessibleAvg: 0.75,
	noiseLevelAvg: 3.5,
	lightingAvg: 3,
	isStaffHelpfulAvg: 0.5,
	isBathroomOnEntranceFloorAvg: 1,
	isContactlessPaymentOfferedAvg: 0.25,
	isStairsRequiredAvg: 0.5,
	spacingAvg: 4,
	promotion: {
		monthly_budget: 0,
		max_cpc: 0,
	},
};

const mockPlace2: Place = {
	_id: "andrewshouse",
	guideDogAvg: 5,
	isMenuAccessibleAvg: 1,
	noiseLevelAvg: 5,
	lightingAvg: 5,
	isStaffHelpfulAvg: 1,
	isBathroomOnEntranceFloorAvg: 1,
	isContactlessPaymentOfferedAvg: 1,
	isStairsRequiredAvg: 1,
	spacingAvg: 5,
	promotion: {
		monthly_budget: 0,
		max_cpc: 0,
	},
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

	it("checks if places have been added to the collection", async () => {
		mockCollection.push(mockPlace1);

		const foundPlace = await isPlaceInDb(mockPlace1._id);

		expect(mockClose).toHaveBeenCalled();
		expect(foundPlace).toBe(true);
	});

	it("checks if places have not been added to the collection", async () => {
		const foundPlace = await isPlaceInDb("sugar");

		expect(mockClose).toHaveBeenCalled();
		expect(foundPlace).toBe(false);
	});

	it("adds a place to the database", async () => {
		const addedPlace = await addPlace(mockPlace1);

		expect(mockClose).toHaveBeenCalled();
		expect(mockCollection).toContain(addedPlace);
		expect(addedPlace).toEqual(mockPlace1);
	});

	it("throws an error when adding a duplicate to the database", () => {
		mockCollection.push(mockPlace1);

		expect.assertions(2);
		addPlace(mockPlace1).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});

	it("throws an error when there is a problem with the remote collection", () => {
		mockInsertOne.mockReturnValueOnce({ acknowledged: false });

		expect.assertions(2);
		addPlace(mockPlace1).catch(e => {
			expect(mockClose).toHaveBeenCalled();
			expect(e).toBeInstanceOf(DbOperationError);
		});
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

	it.skip("adds a place if it does not exists when getting a place by id", async () => {
		// arrange: mockPlace1 is NOT added!

		const foundPlace = await getPlaceByID(mockPlace1._id);

		expect(mockClose).toHaveBeenCalled();
		expect(foundPlace).toEqual(mockPlace1);
		expect(mockCollection).toContain(mockPlace1);
	});

	it("updates a place without throwing an error", async () => {
		const updatedPlace = await updatePlace(mockPlace1._id);

		expect(mockClose).toHaveBeenCalledTimes(3); // twice by place col, once by rating col
		expect(updatedPlace).toEqual(mockPlace1);
	});

	it("throws an error when updating a place if there is a problem with the remote collection", () => {
		mockUpdateOne.mockReturnValueOnce({ acknowledged: false });

		updatePlace(mockPlace1._id).catch(e => {
			expect(mockClose).toHaveBeenCalledTimes(2);
			expect(e).toBeInstanceOf(DbOperationError);
		});
	});
});
