import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId } from "mongodb";
import { Place, Rating } from "../types";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";
import { addRating } from "../Rating/rating";

// generate a new rating object with the given id and random ratings from 0 to 5 in increments of 0.5
export const generateNewRating = (placeId: string, userId: ObjectId): Rating => {
	return {
		userID: userId,
		placeID: placeId,
		braille: Math.floor(Math.random() * 12) / 2,
		fontReadability: Math.floor(Math.random() * 12) / 2,
		staffHelpfulness: Math.floor(Math.random() * 12) / 2,
		navigability: Math.floor(Math.random() * 12) / 2,
		guideDogFriendly: Math.floor(Math.random() * 12) / 2,
		dateCreated: new Date(),
		comment: null,
	};
};

// idk if we need this, but here it is in case we do
// did not create an api endpoinot for this because it might be a lot since returning ALL the places is...a lot
export async function getAllPlaces(): Promise<Place[]> {
	const { _col, _connection } = await getCollection<Place>("place");

	const getPlaces: Place[] = await _col.find({}).toArray();
	await _connection.close();

	return getPlaces;
}

export async function getPlaceByID(id: GooglePlaceID["place_id"]): Promise<Place> {
	if (!id) throw new Error("No place id provided");

	const { _col, _connection } = await getCollection<Place>("place");

	const placeReturned = await _col.findOne({ _id: id });
	if (placeReturned === null) {
		await addPlace({
			_id: id,
			avgBraille: null,
			avgFontReadability: null,
			avgStaffHelpfulness: null,
			avgNavigability: null,
			avgGuideDogFriendly: null,
		});

		// this is a dirty typecast, but it's only for a temporary feature
		const newRating = generateNewRating(id, "6194532e0b57a3c1141982de" as unknown as ObjectId);

		await addRating(newRating);

		const newPlaceWithRatings = (await _col.findOne({ _id: id })) as Place; // this is now guaranteed to return a place

		await _connection.close();

		return newPlaceWithRatings;
	} else {
		await _connection.close();
		return placeReturned;
	}
}

export async function isPlaceInDb(id: GooglePlaceID["place_id"]): Promise<boolean> {
	const { _col, _connection } = await getCollection<Place>("place");

	const placeReturned = await _col.findOne({ _id: id });
	await _connection.close();
	if (placeReturned === null) return false;

	return true;
}

export async function addPlace(placeToAdd: Place): Promise<Place> {
	const { _col, _connection } = await getCollection<Place>("place");

	// check to see if the place already exists
	const doesExist = await isPlaceInDb(placeToAdd._id);
	if (doesExist) {
		await _connection.close();
		throw "That place already exists in the database and cannot be added again.";
	}

	// now its safe to add place to db
	const insertInfo: InsertOneResult<Place> = await _col.insertOne(placeToAdd);
	await _connection.close();
	if (insertInfo.acknowledged === false) throw "Error adding place";

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
	await placeConn.close();
	if (placeToUpdate.acknowledged === false) throw "Could not update Place.";

	return await getPlaceByID(id);
}
