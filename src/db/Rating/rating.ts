import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId } from "mongodb";
import type { DbData, Rating } from "../types";
import type { Collection } from "mongodb";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";

const rating = getCollection("rating");

export async function addRating(ratingToAdd: Rating): Promise<DbData> {
	const ratingCollection: Collection<DbData> = await rating;

	const insertInfo: InsertOneResult<Rating> = await ratingCollection.insertOne(ratingToAdd);
	if (insertInfo.acknowledged === false) throw "Error adding rating";

	const newID = insertInfo.insertedId;

	return await getRatingById(newID);
}

export async function getRatingById(id: ObjectId): Promise<DbData> {
	const ratingCollection: Collection<DbData> = await rating;

	const ratingReturned = await ratingCollection.findOne({ _id: id });
	if (ratingReturned === null) throw "Sorry, no rating exists with that ID";

	return ratingReturned;
}

export async function getAllRatingsForPlace(id: GooglePlaceID["place_id"]): Promise<Array<DbData>> {
	const ratingCollection: Collection<DbData> = await rating;

	const allRatings = await ratingCollection.find({ placeID: id }).toArray();
	if (allRatings === null) throw "Sorry, no ratings exist for that place";

	return allRatings;
}

export async function getAllRatingsFromUser(userId: ObjectId): Promise<Array<DbData>> {
	const ratingCollection: Collection<DbData> = await rating;

	const allRatings = await ratingCollection.find({ userID: userId }).toArray();
	if (allRatings === null) throw "Sorry, no ratings exist for that place";

	return allRatings;
}