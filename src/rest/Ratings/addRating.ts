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

	// Error handling; this is needed because any types can be passed in despite using TypeScript
	// userID needs to be a string in order to be converted to type ObjectId
	if (typeof rating.userID !== "string" || typeof rating.placeID !== "string") {
		res.status(400).json({ error: "userID and placeID must be strings" });
		return;
	}

	if (
		(rating.braille && typeof rating.braille !== "number") ||
		(rating.fontReadability && typeof rating.fontReadability !== "number") ||
		(rating.staffHelpfulness && typeof rating.staffHelpfulness !== "number") ||
		(rating.navigability && typeof rating.navigability !== "number") ||
		(rating.guideDogFriendly && typeof rating.guideDogFriendly !== "number")
	) {
		res.status(400).json({
			error: "braille, fontReadability, staffHelpfullness, navigability, and guideDogFriendly must be strings",
		});
		return;
	}

	if (typeof rating.comment !== "string") {
		res.status(400).json({ error: "comment must be a string" });
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
		res.status(200).json(newRating);
	} catch (e) {
		res.status(500).json(e);
	}
};
