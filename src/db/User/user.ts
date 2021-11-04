import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import type { User } from "../types";

// should be called when user creates an account
export async function addUserToDb(userToAdd: User): Promise<User> {
	const { _col, _connection } = await getCollection<User>("user");

	const insertInfo: InsertOneResult<User> = await _col.insertOne(userToAdd);
	if (insertInfo.acknowledged === false) throw "Error adding user";
	await _connection.close();

	const newID = insertInfo.insertedId;

	return await getUserById(newID);
}

export async function getUserById(id: ObjectId): Promise<User> {
	const { _col, _connection } = await getCollection<User>("user");

	const userReturned = await _col.findOne({ _id: id });
	if (userReturned === null) throw "Sorry, no rating exists with that ID";
	await _connection.close();

	return userReturned;
}

export async function editUserInDb(userId: ObjectId, newUserFields: Partial<User>): Promise<User> {
	const { _col, _connection } = await getCollection<User>("user");

	const userToUpdate: UpdateResult = await _col.updateOne(
		{ _id: userId },
		{ $set: newUserFields }
	);
	if (userToUpdate.acknowledged === false) throw "Could not update User";
	await _connection.close();

	return await getUserById(userId);
}
