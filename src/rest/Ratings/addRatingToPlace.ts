import type { Request, Response } from "express";
import { addRating } from "../../db/Rating/rating";
import { ObjectId } from "mongodb";
import type { Rating } from "../../db/types";
import StatusCode from "../status";
import {
	MissingParametersErrorJSON,
	RatingCreatedJSON,
	ServerErrorJSON,
	UnauthorizedErrorJSON,
	WrongParamatersErrorJSON,
} from "../../types";
import { getUserById } from "../../db/User/user";

type AddRatingRequestBody = Partial<
	Omit<
		Rating,
		| "userID"
		| "braille"
		| "fontReadability"
		| "staffHelpfulness"
		| "navigability"
		| "guideDogFriendly"
	> & {
		token: string;
		userID: string;
		braille: string;
		fontReadability: string;
		staffHelpfulness: string;
		navigability: string;
		guideDogFriendly: string;
	}
>;

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
		res.status(StatusCode.BAD_REQUEST).json(MissingParametersErrorJSON);
		return;
	}

	// request body starts as strings, convert to float if present
	const brailleAsNum = braille ? parseFloat(braille) : null;
	const fontReadabilityAsNum = fontReadability ? parseFloat(fontReadability) : null;
	const staffHelpfulnessAsNum = staffHelpfulness ? parseFloat(staffHelpfulness) : null;
	const navigabilityAsNum = navigability ? parseFloat(navigability) : null;
	const guideDogFriendlyAsNum = guideDogFriendly ? parseFloat(guideDogFriendly) : null;

	// if can't convert to float, there is a problem
	for (const field of [
		brailleAsNum,
		fontReadabilityAsNum,
		staffHelpfulnessAsNum,
		navigabilityAsNum,
		guideDogFriendlyAsNum,
	]) {
		if (field === NaN) {
			console.warn("addRatingToPlace: request made with non-numeric field");
			res.status(StatusCode.BAD_REQUEST).json(WrongParamatersErrorJSON);
			return;
		}
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
			braille: brailleAsNum,
			fontReadability: fontReadabilityAsNum,
			staffHelpfulness: staffHelpfulnessAsNum,
			navigability: navigabilityAsNum,
			guideDogFriendly: guideDogFriendlyAsNum,
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
