import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId, UpdateResult, WithId } from "mongodb";
import type { Rating } from "../types";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";
import { updatePlace } from "../Place/place";
import { DbOperationError } from "../../errorClasses";
import { getUserByEmailOnly } from "../User/user";

/**
 * Adds a rating to a place. Checks that the user has not already added
 * a review to this place (the correct function to use in that case would
 * be editRatingInDb). Updates the ratings of the place the rating has been
 * added to reflect that aggregate scores of all ratings.
 * @param ratingToAdd a rating
 * @returns the rating that was successfully inserted
 * @throws if the user has already added a rating to this place
 * @throws if there was a problem with the remote collection adding the rating
 */
export async function addRating(ratingToAdd: Rating): Promise<Rating> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	//check that a user isn't adding a rating to a place they've already reviewed
	const ratingExists = await _col.findOne({
		userID: ratingToAdd.userID,
		placeID: ratingToAdd.placeID,
	});
	if (ratingExists) {
		await _connection.close();
		throw new DbOperationError("User cannot add more than one rating to the same place");
	}

	// now ready to add rating
	const insertInfo: InsertOneResult<Rating> = await _col.insertOne(ratingToAdd);
	await _connection.close();
	if (insertInfo.acknowledged === false) throw new DbOperationError("Error adding rating");

	const newID = insertInfo.insertedId;

	// Every time an insertion is successful, we need to update the averages for the place
	// in the Place collection
	const insertedRating: Rating = await getRatingById(newID);

	await updatePlace(insertedRating.placeID);

	return insertedRating;
}

/**
 * Updates a rating with the new provided data.
 * @param ratingId the id of the rating to update
 * @param newRatingFields the new fields of the rating
 * @returns the rating as it now appears in the remote collection
 * @throws if there was a problem with the remote collection updating the rating
 */
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
	if (ratingToUpdate.acknowledged === false)
		throw new DbOperationError("Could not update Rating");

	// Every time an update is succesfful, we need to update the averages for the place in the Place collection
	const insertedRating: Rating = await getRatingById(ratingId);

	await updatePlace(insertedRating.placeID);

	return insertedRating;
}

/**
 * Finds a rating in the remote collection by its ID.
 * @param id the id of the rating to find
 * @returns the rating
 * @throws if there is no rating the remote collection with the passed ID
 */
export async function getRatingById(id: ObjectId): Promise<Rating> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const ratingReturned = await _col.findOne({ _id: id });
	await _connection.close();
	if (ratingReturned === null) throw new DbOperationError("Sorry, no rating exists with that ID");

	return ratingReturned;
}

/**
 * Determines whether or not a user has already rated a place.
 * @param email the email address associated with the user (obtained via local storage)
 * @param placeID the id of the place user wants to rate
 * @returns true if rating exists, false if rating does not
 */
export async function accessPotentialRating(
	email: string,
	placeID: GooglePlaceID["place_id"]
): Promise<WithId<Rating> | null> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	// needed to get user's id
	const user = await getUserByEmailOnly(email);

	const ratingReturned = await _col.findOne({ userID: user._id, placeID: placeID });
	await _connection.close();
	return ratingReturned;
}

/**
 * Gets all of the ratings for a particular place.
 * @param id a Google Place API id
 * @returns an array of all of the ratings for this place
 * @throws if there are no ratings added for this place
 */
export async function getAllRatingsForPlace(id: GooglePlaceID["place_id"]): Promise<Array<Rating>> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const allRatings = await _col.find({ placeID: id }).toArray();
	await _connection.close();
	if (allRatings.length === 0)
		throw new DbOperationError("Sorry, no ratings exist for that place");

	return allRatings;
}

/**
 * Gets all of the ratings for a particular user.
 * @param userId the ID of the user
 * @returns an array of all of the ratings made by this user
 * @throws if the user has not submitted any ratings
 */
export async function getAllRatingsFromUser(userId: ObjectId): Promise<Array<Rating>> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const allRatings = await _col.find({ userID: userId }).toArray();
	await _connection.close();
	if (allRatings.length === 0)
		throw new DbOperationError("Sorry, no ratings have been given by that user");

	return allRatings;
}

/**
 * Removes a rating from the remote collection.
 * @param id the id of the rating to remove
 * @returns true if the rating was successfully removed, else false
 */
export async function deleteRatingFromDb(id: ObjectId): Promise<boolean> {
	const { _col, _connection } = await getCollection<Rating>("rating");

	const rating = await _col.deleteOne({ _id: id });
	await _connection.close();
	if (rating.deletedCount === 1) return true;

	return false;
}
