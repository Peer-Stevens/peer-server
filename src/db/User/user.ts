import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import type { User } from "../types";
import type { Collection } from "mongodb";

const user = getCollection<User>("user");

// should be called when user creates an account
export async function addUserToDb(userToAdd: User): Promise<User> {
	const userCollection: Collection<User> = await user;

	const insertInfo: InsertOneResult<User> = await userCollection.insertOne(userToAdd);
	if (insertInfo.acknowledged === false) throw "Error adding user";

	const newID = insertInfo.insertedId;

	return await getUserById(newID);
}

export async function getUserById(id: ObjectId): Promise<User> {
	const userCollection: Collection<User> = await user;

	const userReturned = await userCollection.findOne({ _id: id });
	if (userReturned === null) throw "Sorry, no rating exists with that ID";
	return userReturned;
}

// should be called if user needs to update their info for whatever reason
// NOTE: THIS IS NOT RELEVANT IN THIS PR, I WILL NEED THIS LATER THOUGH! PLEASE IGNORE THIS FOR RIGHT NOW
export async function editUserDetails(id: ObjectId, updatedUser: User): Promise<UpdateResult> {
	const userCollection: Collection<User> = await user;

	const editedUserDetails = await userCollection.updateOne({ _id: id }, { $set: updatedUser });
	if (editedUserDetails.modifiedCount === 0) throw "Could not update User";

	return editedUserDetails;
}
