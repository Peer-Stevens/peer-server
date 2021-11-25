import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { DbOperationError } from "../../errorClasses";
import { handleError } from "../util";
import { getUserByID } from "../../db/User/user";

export const userExists = async <T>(
	userID: string,
	endPointName: string,
	req: Request<unknown, unknown, T>,
	res: Response
): Promise<boolean> => {
	try {
		await getUserByID(new ObjectId(userID));
	} catch (e) {
		if (e instanceof DbOperationError) {
			return false;
		} else {
			handleError<T>(e, endPointName, req, res);
		}
	}
	return true;
};
