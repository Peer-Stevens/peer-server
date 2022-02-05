import type { Request, Response } from "express";
import { editRatingInDb, getRatingById } from "../../db/Rating/rating";
import { ObjectId } from "mongodb";
import type { Rating } from "../../db/types";
import StatusCode from "../status";
import {
	isAuthenticated,
	MissingParametersErrorJSON,
	RatingUpdatedJSON,
	UnauthorizedErrorJSON,
	WrongParametersErrorJSON,
	convertToBinNum,
} from "../util";

type EditRatingRequestBody = Partial<
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

export const editRating = async (
	req: Request<unknown, unknown, EditRatingRequestBody>,
	res: Response
): Promise<void> => {
	const {
		_id,
		token,
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

	if (!_id) {
		res.status(StatusCode.BAD_REQUEST).json(MissingParametersErrorJSON);
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
			console.warn("editRating: request made with non-numeric field");
			res.status(StatusCode.BAD_REQUEST).json(WrongParametersErrorJSON);
			return;
		}
	}

	// get old Rating
	const oldRatingObj = await getRatingById(new ObjectId(_id));

	// ensure request made by user associated with rating
	if (!(await isAuthenticated(oldRatingObj.userID.toString(), token))) {
		console.warn(
			`editRating: logged-in user did not match provided token when trying to add rating`
		);
		res.status(StatusCode.UNAUTHORIZED).json(UnauthorizedErrorJSON);
		return;
	}

	const newRatingObj: Partial<Rating> = {
		isMenuAccessible: isMenuAccessibleAsNum,
		noiseLevel: noiseLevelAsNum,
		lighting: lightingAsNum,
		isStaffHelpful: isStaffHelpfulAsNum,
		isBathroomOnEntranceFloor: isBathroomOnEntranceFloorAsNum,
		isContactlessPaymentOffered: isContactlessPaymentOfferedAsNum,
		isStairsRequired: isStairsRequiredAsNum,
		spacing: spacingAsNum,
		comment: comment,
		dateEdited: new Date(),
	};

	// ready to edit rating
	await editRatingInDb(new ObjectId(_id), newRatingObj);
	res.status(StatusCode.OK).json(RatingUpdatedJSON);
};
