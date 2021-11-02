import type { Request, Response } from "express";
import { editRatingInDb, getRatingById } from "../../db/Rating/rating";
import { ObjectId } from "mongodb";
import type { Rating } from "../../db/types";
import StatusCode from "../status";

export const editRating = async (
	req: Request<unknown, unknown, Partial<Rating>>,
	res: Response
): Promise<void> => {
	const editedRating = req.body;

	// Error handling; this is needed because any types can be passed in despite using TypeScript
	// _id needs to be a string in order to be converted to type ObjectId

	if (!editedRating._id) {
		res.status(StatusCode.BAD_REQUEST).json({ error: "There must be an _id" });
		return;
	}

	if (editedRating._id && typeof editedRating._id !== "string") {
		res.status(StatusCode.BAD_REQUEST).json({ error: "_id must be a string" });
		return;
	}

	if (
		(editedRating.braille && typeof editedRating.braille !== "number") ||
		(editedRating.fontReadability && typeof editedRating.fontReadability !== "number") ||
		(editedRating.staffHelpfulness && typeof editedRating.staffHelpfulness !== "number") ||
		(editedRating.navigability && typeof editedRating.navigability !== "number") ||
		(editedRating.guideDogFriendly && typeof editedRating.guideDogFriendly !== "number")
	) {
		res.status(StatusCode.BAD_REQUEST).json({
			error: "braille, fontReadability, staffHelpfullness, navigability, and guideDogFriendly must be strings",
		});
		return;
	}

	if (editedRating.comment && typeof editedRating.comment !== "string") {
		res.status(StatusCode.BAD_REQUEST).json({ error: "comment must be a string" });
		return;
	}

	// get old Rating
	let oldRatingObj: Rating;
	try {
		oldRatingObj = await getRatingById(new ObjectId(editedRating._id));
	} catch (e) {
		console.log(e);
		return;
	}

	// new Rating object; compare with oldRatingObj
	const newRatingObj: Partial<Rating> = {};

	if (editedRating.braille && editedRating.braille !== oldRatingObj.braille) {
		newRatingObj.braille = editedRating.braille;
	}
	if (
		editedRating.fontReadability &&
		editedRating.fontReadability !== oldRatingObj.fontReadability
	) {
		newRatingObj.fontReadability = editedRating.fontReadability;
	}
	if (
		editedRating.staffHelpfulness &&
		editedRating.staffHelpfulness !== oldRatingObj.staffHelpfulness
	) {
		newRatingObj.staffHelpfulness = editedRating.staffHelpfulness;
	}
	if (editedRating.navigability && editedRating.navigability !== oldRatingObj.navigability) {
		newRatingObj.navigability = editedRating.navigability;
	}
	if (
		editedRating.guideDogFriendly &&
		editedRating.guideDogFriendly !== oldRatingObj.guideDogFriendly
	) {
		newRatingObj.guideDogFriendly = editedRating.guideDogFriendly;
	}
	if (editedRating.comment && editedRating.comment !== oldRatingObj.comment) {
		newRatingObj.comment = editedRating.comment;
	}

	if (Object.keys(newRatingObj).length === 0) {
		res.status(StatusCode.BAD_REQUEST).json({
			error: "Cannot edit Rating since there is no change",
		});
		return;
	}

	newRatingObj.dateEdited = new Date();

	// ready to edit rating
	try {
		const rating = await editRatingInDb(new ObjectId(editedRating._id), newRatingObj);
		res.status(StatusCode.OK).json(rating);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};
