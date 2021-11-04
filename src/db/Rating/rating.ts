import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import type { Rating } from "../types";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";
import { updatePlace } from "../Place/place";

export async function addRating(ratingToAdd: Rating): Promise<Rating> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const insertInfo: InsertOneResult<Rating> = await _col.insertOne(ratingToAdd);
	if (insertInfo.acknowledged === false) throw "Error adding rating";

	const newID = insertInfo.insertedId;
	await _connection.close();

	// Every time an insertion is succesfful, we need to update the averages for the place in the Place collection
	const insertedRating: Rating = await getRatingById(newID);

	await updatePlace(insertedRating.placeID);

	return insertedRating;
}

export async function editRatingInDb(
	ratingId: ObjectId,
	newRatingFields: Partial<Rating>
): Promise<Rating> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const ratingToUpdate: UpdateResult = await _col.updateOne(
		{ _id: ratingId },
		{ $set: newRatingFields }
	);
	if (ratingToUpdate.acknowledged === false) throw "Could not update Rating";
	await _connection.close();

	// Every time an update is succesfful, we need to update the averages for the place in the Place collection
	const insertedRating: Rating = await getRatingById(ratingId);

	await updatePlace(insertedRating.placeID);

	return insertedRating;
}

export async function getRatingById(id: ObjectId): Promise<Rating> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const ratingReturned = await _col.findOne({ _id: id });
	if (ratingReturned === null) throw "Sorry, no rating exists with that ID";
	await _connection.close();

	return ratingReturned;
}

export async function getAllRatingsForPlace(id: GooglePlaceID["place_id"]): Promise<Array<Rating>> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const allRatings = await _col.find({ placeID: id }).toArray();
	if (allRatings === null) throw "Sorry, no ratings exist for that place";
	await _connection.close();

	return allRatings;
}

export async function getAllRatingsFromUser(userId: ObjectId): Promise<Array<Rating>> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const allRatings = await _col.find({ userID: userId }).toArray();
	if (allRatings === null) throw "Sorry, no ratings exist for that place";
	await _connection.close();

	return allRatings;
}

export async function deleteRatingFromDb(id: ObjectId): Promise<boolean> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const rating = await _col.deleteOne({ _id: id });
	if (rating.deletedCount === 1) return true;
	await _connection.close();

	return false;
}
