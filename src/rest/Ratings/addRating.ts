import type { Request, Response } from "express";
import { addRating } from "../../db/Rating/rating";
import { ObjectId } from "mongodb";
import type { Rating } from "../../db/types";

export const addRatingToPlace = async (
	req: Request<unknown, unknown, Partial<Rating>>,
	res: Response
): Promise<void> => {
	const rating = req.body;

	// userId and placeId are mandatory fields
	if (!rating.userID) {
		res.status(400).json({ error: "You must provide a userId" });
		return;
	}

	if (!rating.placeID) {
		res.status(400).json({ error: "You must provide a placeId" });
		return;
	}

	// need to check that comment is a string otherwise the linter yells at me
	if (typeof rating.comment !== "string") {
		res.status(400).json({ error: "comment must be a string" });
		return;
	}

	if (rating.comment) {
		rating.comment = { _id: new ObjectId(), comment: rating.comment };
	}

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
		res.status(200).json(newRating);
	} catch (e) {
		res.status(500).json(e);
	}
};
