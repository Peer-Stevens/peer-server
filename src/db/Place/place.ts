import { getCollection } from "../mongoCollections";
import { InsertOneResult } from "mongodb";
import { DbData, Place } from "../types";
import type { Collection } from "mongodb";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";

const place = getCollection("place");
const rating = getCollection("rating");

// idk if we need this, but here it is in case we do
export async function getAllPlaces(): Promise<Array<DbData>> {
	const placesCollection: Collection<DbData> = await place;

	return await placesCollection.find({}).toArray();
}

export async function getPlaceByID(id: GooglePlaceID["place_id"]): Promise<DbData> {
	const placesCollection: Collection<DbData> = await place;

	const placeReturned = await placesCollection.findOne({ _id: id });
	if (placeReturned === null) throw "Sorry, no place exists with that ID";

	return placeReturned;
}

// should be called when the api displays a place that has never been accessed before by any user
//Note to self: might not be necessary?? I'll fix this later
export async function addPlace(placeToAdd: Place): Promise<DbData> {
	const placesCollection: Collection<DbData> = await place;

	const insertInfo: InsertOneResult<Place> = await placesCollection.insertOne(placeToAdd);
	if (insertInfo.acknowledged === false) throw "Error adding place";

	const newID = insertInfo.insertedId;

	return await getPlaceByID(newID);
}

/**
 * An aggregate function that utilizes the Mongo aggregate framework
 * This function's purpose is to calculate the average ratings per metric that we
 * want to collect and display data on.
 * This is more efficient that doing the calculations ourselves.
 * Returns the place after its been updated
 *
 * TODO currently doesn't work with guideDogFriendly because this field is a boolean;
 * I need to figure out how to calculate the 'average' or majority of 'True' values with mongo aggregation
 * */

export async function updatePlace(id: GooglePlaceID["place_id"]): Promise<DbData> {
	//this is type any because I can't figure out how to get it to work without it, SOS
	const ratingCollection: Collection<any> = await rating;
	const placesCollection: Collection<DbData> = await place;

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
					$avg: "clear$guideDogFriendly",
				},
			},
		},
	];

	const aggCursor = ratingCollection.aggregate(pipeline);

	let avgsObj: Place = {
		_id: id,
		avgBraille: null,
		avgFontReadability: null,
		avgStaffHelpfulness: null,
		avgNavigability: null,
		avgGuideDogFriendly: null,
	};

	await aggCursor.forEach(elem => {
		avgsObj["avgBraille"] = elem.brailleAvg;
		avgsObj["avgNavigability"] = elem.navigAvg;
		avgsObj["avgFontReadability"] = elem.fontAvg;
		avgsObj["avgStaffHelpfulness"] = elem.staffAvg;
		avgsObj["avgGuideDogFriendly"] = elem.guideDogAvg;
	});

	const placeToUpdate = await placesCollection.updateOne({ _id: id }, { $set: avgsObj });
	if (placeToUpdate.modifiedCount === 0) throw "Could not update Place.";

	return await getPlaceByID(id);
}
