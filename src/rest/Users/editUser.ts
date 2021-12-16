import type { Request, Response } from "express";
import { editUserInDb, getUserByID } from "../../db/User/user";
import { ObjectId } from "mongodb";
import type { User } from "../../db/types";
import StatusCode from "../status";

export const editUser = async (
	req: Request<unknown, unknown, Partial<User>>,
	res: Response
): Promise<void> => {
	const editedUser = req.body;

	// Error handling; this is needed because any types can be passed in despite using TypeScript
	// _id needs to be a string in order to be converted to type ObjectId

	if (!editedUser._id) {
		res.status(StatusCode.BAD_REQUEST).json({ error: "There must be an _id" });
		return;
	}
	if (editedUser._id && typeof editedUser._id !== "string") {
		res.status(StatusCode.BAD_REQUEST).json({ error: "_id must be a string" });
		return;
	}

	// get old User object
	let oldUserObj: User;
	try {
		oldUserObj = await getUserByID(new ObjectId(editedUser._id));
	} catch (e) {
		console.log(e);
		return;
	}

	// new User object; compare with oldUserObj
	const newUserObj: Partial<User> = {};

	if (editedUser.email && editedUser.email !== oldUserObj.email) {
		newUserObj.email = editedUser.email;
	}

	if (Object.keys(newUserObj).length === 0) {
		res.status(StatusCode.BAD_REQUEST).json({
			error: "Cannot edit User since there is no change",
		});
		return;
	}

	newUserObj.dateEdited = new Date();

	// ready to edit user
	try {
		const user = await editUserInDb(new ObjectId(editedUser._id), newUserObj);
		res.status(StatusCode.OK).json(user);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};
