import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { deleteRatingFromDb } from "../../db/Rating/rating";
import StatusCode from "../status";
import {
	handleError,
	isAuthenticated,
	RatingDeletedJSON,
	RatingDoesNotExistErrorJSON,
	ServerErrorJSON,
	UnauthorizedErrorJSON,
} from "../util";

type DeleteRatingRequestBody = { userID: string; token: string; _id: string };

export const deleteRating = async (
	req: Request<unknown, unknown, DeleteRatingRequestBody>,
	res: Response
): Promise<void> => {
	const { userID, _id, token } = req.body;

	try {
		if (!(await isAuthenticated(userID, token))) {
			console.warn(
				`deleteRating: logged-in user did not match provided token when trying to add rating`
			);
			res.status(StatusCode.UNAUTHORIZED).json(UnauthorizedErrorJSON);
			return;
		}
		const didDelete = await deleteRatingFromDb(new ObjectId(_id));
		if (didDelete === true) {
			res.status(StatusCode.OK).json(RatingDeletedJSON);
			return;
		} else {
			res.status(StatusCode.BAD_REQUEST).json(RatingDoesNotExistErrorJSON);
		}
	} catch (e) {
		handleError<DeleteRatingRequestBody>(e, "deleteRating", req, res);
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(ServerErrorJSON);
	}
};
