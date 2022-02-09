import type { Request, Response } from "express";
import { addPlace, isPlaceInDb } from "../../db/Place/place";
import type { Place } from "../../db/types";
import StatusCode from "../status";

export const addPlaceToDb = async (
	req: Request<unknown, unknown, Partial<Place>>,
	res: Response
): Promise<void> => {
	const place = req.body;

	if (!place._id) {
		res.status(StatusCode.BAD_REQUEST).json({ error: "You must provide a placeId" });
		return;
	}

	// Error handling; this is needed because any types can be passed in despite using TypeScript
	if (typeof place._id !== "string") {
		res.status(StatusCode.BAD_REQUEST).json({ error: "_id needs to be a string" });
		return;
	}

	// check to see if the place already exists
	try {
		const doesExist = await isPlaceInDb(place._id);
		if (doesExist) {
			res.status(StatusCode.BAD_REQUEST).json({
				error: "That place already exists in the database and cannot be added again.",
			});
			return;
		}
	} catch (e) {
		console.log("Something went wrong while trying to fetch the place");
		res.status(StatusCode.BAD_REQUEST);
		return;
	}

	// when a place is first added to the db, the fields will all be null because they don't have averages yet
	try {
		const newRating = await addPlace({
			_id: place._id,
			guideDogAvg: null,
			isMenuAccessibleAvg: null,
			noiseLevelAvg: null,
			lightingAvg: null,
			isStaffHelpfulAvg: null,
			isBathroomOnEntranceFloorAvg: null,
			isContactlessPaymentOfferedAvg: null,
			isStairsRequiredAvg: null,
			spacingAvg: null,
			promotion: {
				monthly_budget: 0,
				max_cpc: 0,
			},
		});
		res.status(StatusCode.OK).json(newRating);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};
