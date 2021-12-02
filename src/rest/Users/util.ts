import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { DbOperationError } from "../../errorClasses";
import { handleError } from "../util";
import { getUserByID } from "../../db/User/user";

/**
 * Checks if the passed user exists. For use in a REST endpoint function;
 * this function requires the request and response objects for the endpoint.
 *
 * Calls `getUserByID`. Calls `handleError` if something goes wrong.
 * @param userID the user's bson ID as a string
 * @param endPointName the name of the endpoint this is being called in
 * @param req the endpoint's request object
 * @param res the endpoint's response object
 * @returns true if the user exists in the database
 */
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
