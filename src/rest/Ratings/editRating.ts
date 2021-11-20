import type { Request, Response } from "express";
import { editRatingInDb, getRatingById } from "../../db/Rating/rating";
import { ObjectId } from "mongodb";
import type { Rating } from "../../db/types";
import StatusCode from "../status";
import {
	handleError,
	isAuthenticated,
	MissingParametersErrorJSON,
	RatingUpdatedJSON,
	ServerErrorJSON,
	UnauthorizedErrorJSON,
	WrongParamatersErrorJSON,
} from "../../util";

type EditRatingRequestBody = Partial<
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
		braille: string;
		fontReadability: string;
		staffHelpfulness: string;
		navigability: string;
		guideDogFriendly: string;
	}
>;

export const editRating = async (
	req: Request<unknown, unknown, EditRatingRequestBody>,
	res: Response
): Promise<void> => {
	const {
		_id,
		token,
		braille,
		fontReadability,
		staffHelpfulness,
		navigability,
		guideDogFriendly,
		comment,
	} = req.body;

	if (!_id) {
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
			console.warn("editRating: request made with non-numeric field");
			res.status(StatusCode.BAD_REQUEST).json(WrongParamatersErrorJSON);
			return;
		}
	}

	// get old Rating
	let oldRatingObj: Rating;
	try {
		oldRatingObj = await getRatingById(new ObjectId(_id));
	} catch (e) {
		handleError<EditRatingRequestBody>(e, "editRating", req, res);
		return;
	}

	// ensure request made by user associated with rating
	if (!(await isAuthenticated(oldRatingObj.userID.toString(), token))) {
		console.warn(
			`editRating: logged-in user did not match provided token when trying to add rating`
		);
		res.status(StatusCode.UNAUTHORIZED).json(UnauthorizedErrorJSON);
		return;
	}

	const newRatingObj: Partial<Rating> = {
		braille: brailleAsNum,
		fontReadability: fontReadabilityAsNum,
		staffHelpfulness: staffHelpfulnessAsNum,
		navigability: navigabilityAsNum,
		guideDogFriendly: guideDogFriendlyAsNum,
		comment: comment,
		dateEdited: new Date(),
	};

	// ready to edit rating
	try {
		await editRatingInDb(new ObjectId(_id), newRatingObj);
		res.status(StatusCode.OK).json(RatingUpdatedJSON);
	} catch (e) {
		handleError<EditRatingRequestBody>(e, "editRating", req, res);
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(ServerErrorJSON);
	}
};
