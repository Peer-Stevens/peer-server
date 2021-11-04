import { getCollection } from "../mongoCollections";
import { InsertOneResult } from "mongodb";
import { Place, Rating } from "../types";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";

// idk if we need this, but here it is in case we do
// did not create an api endpoinot for this because it might be a lot since returning ALL the places is...a lot
export async function getAllPlaces(): Promise<Place[]> {
	const { _col, _connection } = await getCollection<Place>("place");

	const getPlaces: Place[] = await _col.find({}).toArray();
	await _connection.close();

	return getPlaces;
}

export async function getPlaceByID(id: GooglePlaceID["place_id"]): Promise<Place> {
	const { _col, _connection } = await getCollection<Place>("place");

	const placeReturned = await _col.findOne({ _id: id });
	if (placeReturned === null) throw "Sorry, no place exists with that ID";
	await _connection.close();

	return placeReturned;
}

export async function isPlaceInDb(id: GooglePlaceID["place_id"]): Promise<boolean> {
	const { _col, _connection } = await getCollection<Place>("place");

	const placeReturned = await _col.findOne({ _id: id });
	if (placeReturned === null) return false;
	await _connection.close();

	return true;
}

export async function addPlace(placeToAdd: Place): Promise<Place> {
	const { _col, _connection } = await getCollection<Place>("place");

	const insertInfo: InsertOneResult<Place> = await _col.insertOne(placeToAdd);
	if (insertInfo.acknowledged === false) throw "Error adding place";
	await _connection.close();

	const newID = insertInfo.insertedId;

	return await getPlaceByID(newID);
}

/**
 * An aggregate function that utilizes the Mongo aggregate framework
 * This function's purpose is to calculate the average ratings per metric that we want to collect.
 * This is more efficient that doing the calculations ourselves.
 * Returns the place after its been updated in the database with the averages
 * */

export async function updatePlace(id: GooglePlaceID["place_id"]): Promise<Place> {
	const { _col: placeCol, _connection: placeConn } = await getCollection<Place>("place");

	const { _col: ratingCol, _connection: ratingConn } = await getCollection<Rating>("rating");

	const pipeline = [
		{
			$match: {
				placeID: id,
				braille: {
					$exists: 1,
				},
				fontReadability: {
					$exists: 1,
				},
				staffHelpfulness: {
					$exists: 1,
				},
				guideDogFriendly: {
					$exists: 1,
				},
				navigability: {
					$exists: 1,
				},
			},
		},
		{
			$group: {
				_id: id,
				brailleAvg: {
					$avg: "$braille",
				},
				navigAvg: {
					$avg: "$navigability",
				},
				fontAvg: {
					$avg: "$fontReadability",
				},
				staffAvg: {
					$avg: "$staffHelpfulness",
				},
				guideDogAvg: {
					$avg: "$guideDogFriendly",
				},
			},
		},
	];

	const aggCursor = ratingCol.aggregate<
		Rating & {
			brailleAvg: number;
			navigAvg: number;
			fontAvg: number;
			staffAvg: number;
			guideDogAvg: number;
		}
	>(pipeline);

	const avgsObj: Place = {
		_id: id,
		avgBraille: null,
		avgFontReadability: null,
		avgStaffHelpfulness: null,
		avgNavigability: null,
		avgGuideDogFriendly: null,
	};

	(await aggCursor.toArray()).forEach(elem => {
		avgsObj["avgBraille"] = elem.brailleAvg;
		avgsObj["avgNavigability"] = elem.navigAvg;
		avgsObj["avgFontReadability"] = elem.fontAvg;
		avgsObj["avgStaffHelpfulness"] = elem.staffAvg;
		avgsObj["avgGuideDogFriendly"] = elem.guideDogAvg;
	});
	await ratingConn.close();

	const placeToUpdate = await placeCol.updateOne({ _id: id }, { $set: avgsObj });
	if (placeToUpdate.acknowledged === false) throw "Could not update Place.";
	await placeConn.close();

	return await getPlaceByID(id);
}
