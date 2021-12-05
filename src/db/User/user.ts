import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import type { User } from "../types";
import { AuthenticationError, DbOperationError } from "../../errorClasses";

/**
 * Adds a user to the remote collection. Intended to be called when
 * a user creates an account.
 * @param userToAdd the new user to add
 * @throws if there is a problem adding the user to remote collection
 * @returns the user that has just been added
 */
export async function addUserToDb(userToAdd: User): Promise<User> {
	const { _col, _connection } = await getCollection<User>("user");

	const insertInfo: InsertOneResult<User> = await _col.insertOne(userToAdd);
	await _connection.close();
	if (insertInfo.acknowledged === false) throw new DbOperationError("Error adding user");

	return userToAdd;
}

/**
 * Finds a user from the remote collection.
 * @param id the id of the user to find
 * @throws if there is no user with the passsed id
 * @returns the user
 */
export async function getUserByID(id: ObjectId): Promise<User> {
	const { _col, _connection } = await getCollection<User>("user");

	const userReturned = await _col.findOne({ _id: id });
	await _connection.close();
	if (userReturned === null) throw new DbOperationError("Sorry, no user exists with that ID");

	return userReturned;
}

/**
 * Finds a user from the remote collection by their email.
 * @param email the email of the user to find
 * @throws if there no user with the passed email address
 * @returns the user
 */
export const getUserByEmailOnly = async (email: string): Promise<User> => {
	const { _col, _connection } = await getCollection<User>("user");
	const userReturned = await _col.findOne({ email: email });
	await _connection.close();
	if (userReturned === null)
		throw new AuthenticationError(`No user exists with the email address ${email}`);
	return userReturned;
};

/**
 * Finds a user from the remote collection by both their email and hash.
 * A user with both a matching email and hash must be in the collection
 * for this to return.
 * @param email the email of the user to find
 * @param hash the hash of the user to find
 * @throws if there is no user with the passed combination of email and hash
 * @returns the user
 */
export const getUserByEmailAndHash = async (email: string, hash: string): Promise<User> => {
	const { _col, _connection } = await getCollection<User>("user");
	const userReturned = await _col.findOne({ email: email, hash: hash });
	await _connection.close();
	if (userReturned === null)
		throw new AuthenticationError(
			`No user exists with the email address ${email} and hash ${hash}`
		);
	return userReturned;
};

/**
 * Updates the fields of a user in the remote collection.
 * @param userId the id of ther user to edit
 * @param newUserFields the new fields for the user
 * @throws if there was a problem editing the user in the remote collection
 * @returns the user as it now appears in the collection
 */
export async function editUserInDb(userId: ObjectId, newUserFields: Partial<User>): Promise<User> {
	const { _col, _connection } = await getCollection<User>("user");

	const userToUpdate: UpdateResult = await _col.updateOne(
		{ _id: userId },
		{ $set: newUserFields }
	);
	await _connection.close();
	if (userToUpdate.acknowledged === false) throw new DbOperationError("Could not update User");

	return await getUserByID(userId);
}
