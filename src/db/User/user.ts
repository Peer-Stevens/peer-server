import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId } from "mongodb";
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
