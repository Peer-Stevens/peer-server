import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import type { User } from "../types";
import type { Collection } from "mongodb";

const userColPromise = getCollection<User>("user");

// should be called when user creates an account
export async function addUserToDb(userToAdd: User): Promise<User> {
	const userCollection: Collection<User> = await userColPromise;

	const insertInfo: InsertOneResult<User> = await userCollection.insertOne(userToAdd);
	if (insertInfo.acknowledged === false) throw "Error adding user";

	const newID = insertInfo.insertedId;

	return await getUserById(newID);
}

export async function getUserById(id: ObjectId): Promise<User> {
	const userCollection: Collection<User> = await userColPromise;

	const userReturned = await userCollection.findOne({ _id: id });
	if (userReturned === null) throw "Sorry, no rating exists with that ID";
	return userReturned;
}

export async function editUser(userId: ObjectId, newUserObj: Partial<User>): Promise<User> {
	const userCollection: Collection<User> = await userColPromise;

	// need to retain values if there isn't an update to supply
	const userBeforeUpdate: User = await getUserById(userId);

	const userToUpdate: UpdateResult = await userCollection.updateOne(
		{ _id: userId },
		{
			$set: {
				username: newUserObj.username ? newUserObj.username : userBeforeUpdate.username,
				isBlindMode: newUserObj.isBlindMode
					? newUserObj.isBlindMode
					: userBeforeUpdate.isBlindMode,
				readsBraille: newUserObj.readsBraille
					? newUserObj.readsBraille
					: userBeforeUpdate.readsBraille,
				doesNotPreferHelp: newUserObj.doesNotPreferHelp
					? newUserObj.doesNotPreferHelp
					: userBeforeUpdate.doesNotPreferHelp,
				dateEdited: new Date(),
			},
		}
	);
	if (userToUpdate.acknowledged === false) throw "Could not update User";

	return await getUserById(userId);
}
