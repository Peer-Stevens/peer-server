import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId } from "mongodb";
import type { Rating } from "../types";
import type { Collection } from "mongodb";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";
import { updatePlace } from "../Place/place";

const ratingColPromise = getCollection<Rating>("rating");

export async function addRating(ratingToAdd: Rating): Promise<Rating> {
	const ratingCollection: Collection<Rating> = await ratingColPromise;

	const insertInfo: InsertOneResult<Rating> = await ratingCollection.insertOne(ratingToAdd);
	if (insertInfo.acknowledged === false) throw "Error adding rating";

	const newID = insertInfo.insertedId;

	// Every time an insertion is succesfful, we need to update the averages for the place in the Place collection
	const insertedRating: Rating = await getRatingById(newID);

	await updatePlace(insertedRating.placeID);

	return insertedRating;
}

export async function getRatingById(id: ObjectId): Promise<Rating> {
	const ratingCollection: Collection<Rating> = await ratingColPromise;

	const ratingReturned = await ratingCollection.findOne({ _id: id });
	if (ratingReturned === null) throw "Sorry, no rating exists with that ID";

	return ratingReturned;
}

export async function getAllRatingsForPlace(id: GooglePlaceID["place_id"]): Promise<Array<Rating>> {
	const ratingCollection: Collection<Rating> = await ratingColPromise;

	const allRatings = await ratingCollection.find({ placeID: id }).toArray();
	if (allRatings === null) throw "Sorry, no ratings exist for that place";

	return allRatings;
}

export async function getAllRatingsFromUser(userId: ObjectId): Promise<Array<Rating>> {
	const ratingCollection: Collection<Rating> = await ratingColPromise;

	const allRatings = await ratingCollection.find({ userID: userId }).toArray();
	if (allRatings === null) throw "Sorry, no ratings exist for that place";

	return allRatings;
}
