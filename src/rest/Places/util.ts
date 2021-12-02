import type { Request, Response } from "express";
import { getPlaceByID } from "../../db/Place/place";
import { DbOperationError } from "../../errorClasses";
import { handleError } from "../util";

/**
 * Checks if the passed place exists. For use in a REST endpoint function;
 * this function requires the request and response objects for the endpoint.
 *
 * Calls `getPlaceByID`. Calls `handleError` if something goes wrong.
 * @param placeID the place's Google Places ID as a string
 * @param endPointName the name of the REST endpoint this is called from
 * @param req the request object for this endpoint
 * @param res the response object for this endpoint
 * @returns true if the place exists
 */
export const placeExists = async <T>(
	placeID: string,
	endPointName: string,
	req: Request<unknown, unknown, T>,
	res: Response
): Promise<boolean> => {
	try {
		await getPlaceByID(placeID);
	} catch (e) {
		if (e instanceof DbOperationError) {
			return false;
		} else {
			handleError<T>(e, endPointName, req, res);
		}
	}
	return true;
};
