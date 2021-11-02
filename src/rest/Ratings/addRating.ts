import type { Request, Response } from "express";
import { addRating } from "../../db/Rating/rating";
import { ObjectId } from "mongodb";
import type { Rating } from "../../db/types";
import StatusCode from "../status";

export const addRatingToPlace = async (
	req: Request<unknown, unknown, Partial<Rating>>,
	res: Response
): Promise<void> => {
	const rating = req.body;

	// userId and placeId are mandatory fields
	if (!rating.userID) {
		res.status(StatusCode.BAD_REQUEST).json({ error: "You must provide a userId" });
		return;
	}

	if (!rating.placeID) {
		res.status(StatusCode.BAD_REQUEST).json({ error: "You must provide a placeId" });
		return;
	}

	// Error handling; this is needed because any types can be passed in despite using TypeScript
	// userID needs to be a string in order to be converted to type ObjectId
	if (typeof rating.userID !== "string" || typeof rating.placeID !== "string") {
		res.status(StatusCode.BAD_REQUEST).json({ error: "userID and placeID must be strings" });
		return;
	}

	if (
		(rating.braille && typeof rating.braille !== "number") ||
		(rating.fontReadability && typeof rating.fontReadability !== "number") ||
		(rating.staffHelpfulness && typeof rating.staffHelpfulness !== "number") ||
		(rating.navigability && typeof rating.navigability !== "number") ||
		(rating.guideDogFriendly && typeof rating.guideDogFriendly !== "number")
	) {
		res.status(StatusCode.BAD_REQUEST).json({
			error: "braille, fontReadability, staffHelpfullness, navigability, and guideDogFriendly must be strings",
		});
		return;
	}

	if (rating.comment && typeof rating.comment !== "string") {
		res.status(StatusCode.BAD_REQUEST).json({ error: "comment must be a string" });
		return;
	}

	// ready to add to database now
	try {
		const newRating = await addRating({
			userID: new ObjectId(rating.userID),
			placeID: rating.placeID,
			braille: rating.braille ? rating.braille : null,
			fontReadability: rating.fontReadability ? rating.fontReadability : null,
			staffHelpfulness: rating.staffHelpfulness ? rating.staffHelpfulness : null,
			navigability: rating.navigability ? rating.navigability : null,
			guideDogFriendly: rating.guideDogFriendly ? rating.guideDogFriendly : null,
			comment: rating.comment ? rating.comment : null,
			dateCreated: new Date(),
		});
		res.status(StatusCode.OK).json(newRating);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};
