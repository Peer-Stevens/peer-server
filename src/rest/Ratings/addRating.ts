import type { Request, Response } from "express";
import { addRating } from "../../db/Rating/rating";
import { ObjectId } from "mongodb";

export const addRatingToPlace = async (req: Request, res: Response): Promise<void> => {
	const rating = req.body;

	if (!rating.userId) {
		res.status(400).json({ error: "You must provide a userId" });
		return;
	}

	if (!rating.placeId) {
		res.status(400).json({ error: "You must provide a placeId" });
		return;
	}

	if (rating.comment) {
		rating.comment = { _id: new ObjectId(), comment: rating.comment };
	}

	try {
		const newRating = await addRating({
			userID: new ObjectId(rating.userId),
			placeID: rating.placeId,
			braille: rating.braille ? rating.braille : null,
			fontReadability: rating.fontRead ? rating.fontRead : null,
			staffHelpfulness: rating.staffHelpful ? rating.staffHelpful : null,
			navigability: rating.navig ? rating.navig : null,
			guideDogFriendly: rating.guideDog ? rating.guideDog : null,
			comment: rating.comment ? rating.comment : null,
			dateCreated: new Date(),
		});
		res.status(200).json(newRating);
	} catch (e) {
		res.status(500).json(e);
	}
};
