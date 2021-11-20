import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import type { User } from "../types";
import { AuthenticationError, DbOperationError } from "../../types";

// should be called when user creates an account
export async function addUserToDb(userToAdd: User): Promise<User> {
	const { _col, _connection } = await getCollection<User>("user");

	const insertInfo: InsertOneResult<User> = await _col.insertOne(userToAdd);
	await _connection.close();
	if (insertInfo.acknowledged === false) throw "Error adding user";

	const newID = insertInfo.insertedId;

	return await getUserByID(newID);
}

export async function getUserByID(id: ObjectId): Promise<User> {
	const { _col, _connection } = await getCollection<User>("user");

	const userReturned = await _col.findOne({ _id: id });
	await _connection.close();
	if (userReturned === null) throw new DbOperationError("Sorry, no user exists with that ID");

	return userReturned;
}

export const getUserByEmailOnly = async (email: string): Promise<User> => {
	const { _col, _connection } = await getCollection<User>("user");
	const userReturned = await _col.findOne({ email: email });
	await _connection.close();
	if (userReturned === null)
		throw new AuthenticationError(`No user exists with the username ${email}`);
	return userReturned;
};

export const getUserByEmailAndHash = async (email: string, hash: string): Promise<User> => {
	const { _col, _connection } = await getCollection<User>("user");
	const userReturned = await _col.findOne({ email: email, hash: hash });
	await _connection.close();
	if (userReturned === null)
		throw new AuthenticationError(`No user exists with the username ${email} and hash ${hash}`);
	return userReturned;
};

export async function editUserInDb(userId: ObjectId, newUserFields: Partial<User>): Promise<User> {
	const { _col, _connection } = await getCollection<User>("user");

	const userToUpdate: UpdateResult = await _col.updateOne(
		{ _id: userId },
		{ $set: newUserFields }
	);
	await _connection.close();
	if (userToUpdate.acknowledged === false) throw "Could not update User";

	return await getUserByID(userId);
}
