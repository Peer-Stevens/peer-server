import type { Request, Response } from "express";
import { addRating } from "../../db/Rating/rating";
import { ObjectId } from "mongodb";
import type { Rating } from "../../db/types";
import StatusCode from "../status";
import {
	MalformedRequestErrorJSON,
	RatingCreatedJSON,
	ServerErrorJSON,
	UnauthorizedErrorJSON,
} from "../../types";
import { getUserById } from "../../db/User/user";

type AddRatingRequestBody = Partial<Omit<Rating, "userID"> & { token: string; userID: string }>;

/**
 * REST endpoint to add a rating to an existing place.
 * Checks that the user has a valid token.
 * @param req HTTP request with rating info in the body.
 * @param res HTTP response to be sent back.
 */
export const addRatingToPlace = async (
	req: Request<unknown, unknown, AddRatingRequestBody>,
	res: Response
): Promise<void> => {
	const {
		userID,
		token,
		placeID,
		braille,
		fontReadability,
		staffHelpfulness,
		navigability,
		guideDogFriendly,
		comment,
	} = req.body;

	// userId and placeId are mandatory fields
	if (!userID || !placeID) {
		console.warn("addRatingToPlace: request made without user id or place id");
		res.status(StatusCode.BAD_REQUEST).json(MalformedRequestErrorJSON);
		return;
	}

	try {
		const userIDBson = new ObjectId(userID);

		// check if user has a valid token
		const user = await getUserById(userIDBson);
		if (token !== user.token) {
			console.warn(
				`addRatingToPlace: user with token ${
					user.token as string
				} did not match provided token of ${token as string} when trying to add rating`
			);
			res.status(StatusCode.UNAUTHORIZED).json(UnauthorizedErrorJSON);
			return;
		}

		// ready to add to database now
		await addRating({
			userID: userIDBson,
			placeID: placeID,
			braille: braille ?? null,
			fontReadability: fontReadability ?? null,
			staffHelpfulness: staffHelpfulness ?? null,
			navigability: navigability ?? null,
			guideDogFriendly: guideDogFriendly ?? null,
			comment: comment ?? null,
			dateCreated: new Date(),
		});
		res.status(StatusCode.OK).json(RatingCreatedJSON);
	} catch (e) {
		console.error(
			//eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			`addRatingtoPlace: Got the following error with the provided request body ${req.body}:`
		);
		console.error(e);
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(ServerErrorJSON);
	}
};
