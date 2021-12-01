import type { Request, Response } from "express";
import { getPlaceByID } from "../../db/Place/place";
import { DbOperationError } from "../../errorClasses";
import { handleError } from "../util";

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
