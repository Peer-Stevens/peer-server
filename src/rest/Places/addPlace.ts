import type { Request, Response } from "express";
import { addPlace, isPlaceInDb } from "../../db/Place/place";
import type { Place } from "../../db/types";

export const addPlaceToDb = async (
	req: Request<unknown, unknown, Partial<Place>>,
	res: Response
): Promise<void> => {
	const place = req.body;

	if (!place._id) {
		res.status(400).json({ error: "You must provide a placeId" });
		return;
	}

	// Error handling; this is needed because any types can be passed in despite using TypeScript
	if (typeof place._id !== "string") {
		res.status(400).json({ error: "_id needs to be a string" });
		return;
	}

	// check to see if the place already exists
	try {
		const doesExist = await isPlaceInDb(place._id);
		if (doesExist) {
			res.status(400).json({
				error: "That place already exists in the database and cannot be added again.",
			});
			return;
		}
	} catch (e) {
		console.log("Something went wrong while trying to fetch the place");
		res.status(400);
		return;
	}

	// when a place is first added to the db, the fields will all be null because they don't have averages yet
	try {
		const newRating = await addPlace({
			_id: place._id,
			avgBraille: null,
			avgFontReadability: null,
			avgGuideDogFriendly: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
		});
		res.status(200).json(newRating);
	} catch (e) {
		res.status(500).json(e);
	}
};
