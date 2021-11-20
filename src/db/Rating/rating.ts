import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import type { Rating } from "../types";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";
import { updatePlace } from "../Place/place";
import { DbOperationError } from "../../types";

export async function addRating(ratingToAdd: Rating): Promise<Rating> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	//check that a user isn't adding a rating to a place they've already reviewed
	const ratingExists = await _col.findOne({
		userID: ratingToAdd.userID,
		placeID: ratingToAdd.placeID,
	});
	if (ratingExists) {
		await _connection.close();
		throw "User cannot add more than one rating to the same place";
	}

	// now ready to add rating
	const insertInfo: InsertOneResult<Rating> = await _col.insertOne(ratingToAdd);
	await _connection.close();
	if (insertInfo.acknowledged === false) throw "Error adding rating";

	const newID = insertInfo.insertedId;

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
	await _connection.close();
	if (ratingToUpdate.acknowledged === false) throw "Could not update Rating";

	// Every time an update is succesfful, we need to update the averages for the place in the Place collection
	const insertedRating: Rating = await getRatingById(ratingId);

	await updatePlace(insertedRating.placeID);

	return insertedRating;
}

export async function getRatingById(id: ObjectId): Promise<Rating> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const ratingReturned = await _col.findOne({ _id: id });
	await _connection.close();
	if (ratingReturned === null) throw "Sorry, no rating exists with that ID";

	return ratingReturned;
}

export async function getAllRatingsForPlace(id: GooglePlaceID["place_id"]): Promise<Array<Rating>> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const allRatings = await _col.find({ placeID: id }).toArray();
	await _connection.close();
	if (allRatings.length === 0) throw "Sorry, no ratings exist for that place";

	return allRatings;
}

export async function getAllRatingsFromUser(userId: ObjectId): Promise<Array<Rating>> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const allRatings = await _col.find({ userID: userId }).toArray();
	await _connection.close();
	if (allRatings.length === 0) throw "Sorry, no ratings have been given by that user";

	return allRatings;
}

export async function deleteRatingFromDb(id: ObjectId): Promise<boolean> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const rating = await _col.deleteOne({ _id: id });
	await _connection.close();
	if (rating.deletedCount === 1) return true;

	return false;
}

export async function getRatingForPlaceFromUser(placeID: ObjectId, userID: ObjectId) {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const rating = await _col.findOne({ placeID: placeID, userID: userID });
	await _connection.close();
	if (rating === null)
		throw new DbOperationError("No rating by this user has been given for place.");
	return rating;
}
