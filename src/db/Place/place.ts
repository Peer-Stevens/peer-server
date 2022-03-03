import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId } from "mongodb";
import { PlaceA11yData, Rating } from "peer-types";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";
import { addRating } from "../Rating/rating";
import { DbOperationError } from "../../errorClasses";
import { randomYesNoRating, randomNumericRating } from "../util";

// generate a new rating object with the given id and random ratings from 0 to 5 in increments of 0.5
// as well as random boolean responses for yes/no questions
// internal function, no need to export
const generateNewRating = (placeId: string, userId: ObjectId): Rating => {
	//TODO: update design to not use user data

	return {
		userID: userId,
		placeID: placeId,
		guideDogFriendly: randomNumericRating(),
		isMenuAccessible: randomYesNoRating(),
		noiseLevel: randomNumericRating(),
		lighting: randomNumericRating(),
		isStaffHelpful: randomYesNoRating(),
		isBathroomOnEntranceFloor: randomYesNoRating(),
		isContactlessPaymentOffered: randomYesNoRating(),
		isStairsRequired: randomYesNoRating(),
		spacing: randomNumericRating(),
		dateCreated: new Date(),
		comment: null,
	};
};

// idk if we need this, but here it is in case we do
// did not create an api endpoint for this because it might be a lot since returning ALL the places is...a lot

/**
 * Returns all of the places in the remote collection.
 * @returns All of the places
 */
export async function getAllPlaces(): Promise<PlaceA11yData[]> {
	const { _col, _connection } = await getCollection<PlaceA11yData>("place");

	const getPlaces: PlaceA11yData[] = await _col.find({}).toArray();
	await _connection.close();

	return getPlaces;
}

/**
 * Finds a single place in the remote collection by its
 * Google Place ID. If the place is not in the remote collection,
 * adds it.
 * @param id a Google Place API id
 * @throws if id is undefined
 * @returns the place
 */
export async function getPlaceByID(id: GooglePlaceID["place_id"]): Promise<PlaceA11yData> {
	if (!id) throw new DbOperationError("No place id provided");

	const { _col, _connection } = await getCollection<PlaceA11yData>("place");

	const placeReturned = await _col.findOne({ _id: id });
	// add the place if not in the remote collection
	if (placeReturned === null) {
		await addPlace({
			_id: id,
			guideDogAvg: null,
			isMenuAccessibleAvg: null,
			noiseLevelAvg: null,
			lightingAvg: null,
			isStaffHelpfulAvg: null,
			isBathroomOnEntranceFloorAvg: null,
			isContactlessPaymentOfferedAvg: null,
			isStairsRequiredAvg: null,
			spacingAvg: null,
			promotion: {
				monthly_budget: 0,
				max_cpc: 0,
			},
		});

		// this is a dirty typecast, but it's only for a temporary feature
		const newRating = generateNewRating(id, "6194532e0b57a3c1141982de" as unknown as ObjectId);

		await addRating(newRating);

		const newPlaceWithRatings = (await _col.findOne({ _id: id })) as PlaceA11yData; // this is now guaranteed to return a place

		await _connection.close();

		return newPlaceWithRatings;
	} else {
		await _connection.close();
		return placeReturned;
	}
}

/**
 * Checks if the place is currently in the remote collection.
 * @param id a Google Place API id
 * @returns true if the place is in the remote collection, false otherwise
 */
export async function isPlaceInDb(id: GooglePlaceID["place_id"]): Promise<boolean> {
	const { _col, _connection } = await getCollection<PlaceA11yData>("place");

	const placeReturned = await _col.findOne({ _id: id });
	await _connection.close();
	if (placeReturned === null) return false;

	return true;
}

/**
 * Adds a place to the remote collection.
 * @param placeToAdd place data
 * @throws when adding a place to the remote collection that already exists
 * @throws when there is a problem with the remote collection adding a place
 * @returns the place that has been added
 */
export async function addPlace(placeToAdd: PlaceA11yData): Promise<PlaceA11yData> {
	const { _col, _connection } = await getCollection<PlaceA11yData>("place");

	// check to see if the place already exists
	const doesExist = await isPlaceInDb(placeToAdd._id);
	if (doesExist) {
		await _connection.close();
		throw new DbOperationError(
			"That place already exists in the database and cannot be added again."
		);
	}

	// now its safe to add place to db
	const insertInfo: InsertOneResult<PlaceA11yData> = await _col.insertOne(placeToAdd);
	await _connection.close();
	if (insertInfo.acknowledged === false) throw new DbOperationError("Error adding place");

	const newID = insertInfo.insertedId;

	return getPlaceByID(newID);
}

/**
 * Updates a place's scores based on all of the ratings stored
 * in the remote collection. Calculates the average ratings per metric.
 * More efficient then performing the calculations manually.
 *
 * This is an aggregate function that utilizes the Mongo aggregate framework.
 * @param id a Google Place API id
 * @throws when there is a problem with the remote collection updating the place
 * @returns the place after its been updated in the database with the averages
 * */
export async function updatePlace(id: GooglePlaceID["place_id"]): Promise<PlaceA11yData> {
	const { _col: placeCol, _connection: placeConn } = await getCollection<PlaceA11yData>("place");
	const { _col: ratingCol, _connection: ratingConn } = await getCollection<Rating>("rating");

	const pipeline = [
		{
			$group: {
				_id: id,
				guideDogAvg: {
					$avg: "$guideDogFriendly",
				},
				isMenuAccessibleAvg: {
					$avg: "$isMenuAccessible",
				},
				noiseLevelAvg: {
					$avg: "$noiseLevel",
				},
				lightingAvg: {
					$avg: "$lighting",
				},
				isStaffHelpfulAvg: {
					$avg: "$isStaffHelpful",
				},
				isBathroomOnEntranceFloorAvg: {
					$avg: "$isBathroomOnEntranceFloor",
				},
				isContactlessPaymentOfferedAvg: { $avg: "$isContactlessPaymentOffered" },
				isStairsRequiredAvg: { $avg: "$isStairsRequired" },
				spacingAvg: { $avg: "$spacing" },
			},
		},
	];

	const aggCursor = ratingCol.aggregate<Omit<PlaceA11yData, "_id" | "promotion">>(pipeline);

	const avgs: Partial<PlaceA11yData> = {
		_id: id,
		guideDogAvg: null,
		isMenuAccessibleAvg: null,
		noiseLevelAvg: null,
		lightingAvg: null,
		isStaffHelpfulAvg: null,
		isBathroomOnEntranceFloorAvg: null,
		isContactlessPaymentOfferedAvg: null,
		isStairsRequiredAvg: null,
		spacingAvg: null,
	};

	(await aggCursor.toArray()).forEach(cursorAvgs => {
		avgs.guideDogAvg = cursorAvgs.guideDogAvg;
		avgs.isMenuAccessibleAvg = cursorAvgs.isMenuAccessibleAvg;
		avgs.noiseLevelAvg = cursorAvgs.noiseLevelAvg;
		avgs.lightingAvg = cursorAvgs.lightingAvg;
		avgs.isStaffHelpfulAvg = cursorAvgs.isStaffHelpfulAvg;
		avgs.isBathroomOnEntranceFloorAvg = cursorAvgs.isBathroomOnEntranceFloorAvg;
		avgs.isContactlessPaymentOfferedAvg = cursorAvgs.isContactlessPaymentOfferedAvg;
		avgs.isStairsRequiredAvg = cursorAvgs.isStairsRequiredAvg;
		avgs.spacingAvg = cursorAvgs.spacingAvg;
	});
	await ratingConn.close();

	const placeToUpdate = await placeCol.updateOne({ _id: id }, { $set: avgs });
	await placeConn.close();
	if (placeToUpdate.acknowledged === false) throw new DbOperationError("Could not update Place.");

	return getPlaceByID(id);
}
