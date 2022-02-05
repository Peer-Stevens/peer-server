import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { addRating } from "../../db/Rating/rating";
import type { Rating } from "../../db/types";
import StatusCode from "../status";
import {
	AccountNotFoundErrorJSON,
	isAuthenticated,
	MissingParametersErrorJSON,
	PlaceDoesNotExistErrorJSON,
	RatingAlreadyExistsErrorJSON,
	RatingCreatedJSON,
	UnauthorizedErrorJSON,
	WrongParametersErrorJSON,
	convertToBinNum,
} from "../util";
import { DbOperationError } from "../../errorClasses";
import { getPlaceByID } from "../../db/Place/place";
import { getUserByID } from "../../db/User/user";

/**
 * Checks if the passed user exists. Calls `getUserByID`.
 * @param userID the user's bson ID as a string
 * @returns true if the user exists in the database
 */
const userExists = async (userID: string): Promise<boolean> => {
	try {
		await getUserByID(new ObjectId(userID));
	} catch (e) {
		if (e instanceof DbOperationError) {
			return false;
		} else {
			throw e;
		}
	}
	return true;
};

/**
 * Checks if the passed place exists. Calls `getPlaceByID`.
 * @param placeID the place's Google Places ID as a string
 * @returns true if the place exists
 */
const placeExists = async (placeID: string): Promise<boolean> => {
	try {
		await getPlaceByID(placeID);
	} catch (e) {
		if (e instanceof DbOperationError) {
			return false;
		}
		throw e;
	}
	return true;
};

type AddRatingRequestBody = Partial<
	Omit<
		Rating,
		| "userID"
		| "isMenuAccessible"
		| "noiseLevel"
		| "isStaffHelpful"
		| "lighting"
		| "guideDogFriendly"
		| "isBathroomOnEntranceFloor"
		| "isContactlessPaymentOffered"
		| "isStairsRequired"
		| "spacing"
	> & {
		token: string;
		userID: string;
		guideDogFriendly: string;
		isMenuAccessible: string;
		noiseLevel: string;
		isStaffHelpful: string;
		lighting: string;
		isBathroomOnEntranceFloor: string;
		isContactlessPaymentOffered: string;
		isStairsRequired: string;
		spacing: string;
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
		guideDogFriendly,
		isMenuAccessible,
		noiseLevel,
		lighting,
		isStaffHelpful,
		isBathroomOnEntranceFloor,
		isContactlessPaymentOffered,
		isStairsRequired,
		spacing,
		comment,
	} = req.body;

	// userId and placeId are mandatory fields
	if (!userID || !placeID) {
		console.warn("addRatingToPlace: request made without user id or place id");
		res.status(StatusCode.BAD_REQUEST).json(MissingParametersErrorJSON);
		return;
	}

	// check that user exists
	if (!(await userExists(userID))) {
		console.warn(
			"addRatingToPlace: request made where user ID provided does not match an existing user"
		);
		res.status(StatusCode.BAD_REQUEST).json(AccountNotFoundErrorJSON);
		return;
	}

	// check that place exists
	if (!(await placeExists(placeID))) {
		console.warn(
			"addRatingToPlace: request made where place ID provided does not match a place in the database"
		);
		res.status(StatusCode.BAD_REQUEST).json(PlaceDoesNotExistErrorJSON);
		return;
	}

	// request body starts as strings, convert to float if present
	const guideDogFriendlyAsNum: number | null = guideDogFriendly
		? parseFloat(guideDogFriendly)
		: null;
	const isMenuAccessibleAsNum: 0 | 1 | null = isMenuAccessible
		? convertToBinNum(isMenuAccessible)
		: null;
	const noiseLevelAsNum: number | null = noiseLevel ? parseFloat(noiseLevel) : null;
	const lightingAsNum: number | null = lighting ? parseFloat(lighting) : null;
	const isStaffHelpfulAsNum: 0 | 1 | null = isStaffHelpful
		? convertToBinNum(isStaffHelpful)
		: null;
	const isBathroomOnEntranceFloorAsNum: 0 | 1 | null = isBathroomOnEntranceFloor
		? convertToBinNum(isBathroomOnEntranceFloor)
		: null;
	const isContactlessPaymentOfferedAsNum: 0 | 1 | null = isContactlessPaymentOffered
		? convertToBinNum(isContactlessPaymentOffered)
		: null;
	const isStairsRequiredAsNum: 0 | 1 | null = isStairsRequired
		? convertToBinNum(isStairsRequired)
		: null;
	const spacingAsNum: number | null = spacing ? parseFloat(spacing) : null;

	// if can't convert to float, there is a problem
	for (const field of [guideDogFriendlyAsNum, noiseLevelAsNum, lightingAsNum, spacingAsNum]) {
		if (field === NaN) {
			console.warn("addRatingToPlace: request made with non-numeric field");
			res.status(StatusCode.BAD_REQUEST).json(WrongParametersErrorJSON);
			return;
		}
	}

	try {
		if (!(await isAuthenticated(userID, token))) {
			console.warn(
				`addRatingToPlace: logged-in user did not match provided token when trying to add rating`
			);
			res.status(StatusCode.UNAUTHORIZED).json(UnauthorizedErrorJSON);
			return;
		}

		// ready to add to database now
		await addRating({
			userID: new ObjectId(userID),
			placeID: placeID,
			isMenuAccessible: isMenuAccessibleAsNum,
			noiseLevel: noiseLevelAsNum,
			lighting: lightingAsNum,
			isStaffHelpful: isStaffHelpfulAsNum,
			isBathroomOnEntranceFloor: isBathroomOnEntranceFloorAsNum,
			isContactlessPaymentOffered: isContactlessPaymentOfferedAsNum,
			isStairsRequired: isStairsRequiredAsNum,
			spacing: spacingAsNum,
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
		throw e;
	}
};
