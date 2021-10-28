import type { Request, Response } from "express";
import { addPlace } from "../../db/Place/place";
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
