import type { Request, Response } from "express";
import { addRating } from "../../db/Rating/rating";
import { ObjectId } from "mongodb";
import type { Rating } from "../../db/types";
import StatusCode from "../status";
import {
	AccountNotFoundErrorJSON,
	MissingParametersErrorJSON,
	PlaceDoesNotExistErrorJSON,
	RatingAlreadyExistsErrorJSON,
	RatingCreatedJSON,
	UnauthorizedErrorJSON,
	WrongParamatersErrorJSON,
} from "../../util";
import { DbOperationError } from "../../types";
import { getUserByID } from "../../db/User/user";
import { getPlaceByID } from "../../db/Place/place";
import { handleError } from "../../util";

const endPointName = "addRatingToPlace";

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

// following three functions are kinda moist, feel free to DRY it out
const userExists = async (
	userID: string,
	req: Request<unknown, unknown, AddRatingRequestBody>,
	res: Response
): Promise<boolean> => {
	try {
		await getUserByID(new ObjectId(userID));
	} catch (e) {
		if (e instanceof DbOperationError) {
			return false;
		} else {
			handleError<AddRatingRequestBody>(e, endPointName, req, res);
		}
	}
	return true;
};

const placeExists = async (
	placeID: string,
	req: Request<unknown, unknown, AddRatingRequestBody>,
	res: Response
): Promise<boolean> => {
	try {
		await getPlaceByID(placeID);
	} catch (e) {
		if (e instanceof DbOperationError) {
			return false;
		} else {
			handleError<AddRatingRequestBody>(e, endPointName, req, res);
		}
	}
	return true;
};

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

	// check that user exists
	if (!(await userExists(userID, req, res))) {
		console.warn(
			"addRatingToPlace: request made where user ID provided does not match an existing user"
		);
		res.status(StatusCode.BAD_REQUEST).json(AccountNotFoundErrorJSON);
		return;
	}

	// check that place exists
	if (!(await placeExists(placeID, req, res))) {
		console.warn(
			"addRatingToPlace: request made where place ID provided does not match a place in the database"
		);
		res.status(StatusCode.BAD_REQUEST).json(PlaceDoesNotExistErrorJSON);
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
		const user = await getUserByID(userIDBson);
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
		if (e instanceof DbOperationError) {
			console.warn("addRatingToPlace: user attempted to rate place they have already rated");
			res.status(StatusCode.BAD_REQUEST).json(RatingAlreadyExistsErrorJSON);
			return;
		}
		handleError<AddRatingRequestBody>(e, endPointName, req, res);
	}
};
