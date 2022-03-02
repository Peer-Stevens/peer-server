import type { Request, Response } from "express";
import { isPlaceInDb } from "../../db/Place/place";
import { PlaceA11yData, PromotionMonth } from "peer-types";
import { getCollection } from "../../db/mongoCollections";
import StatusCode from "../status";
import { InvalidPlaceIDErrorJSON, PlaceDoesNotExistErrorJSON } from "../../rest/util";

export const promotePlace = async (
	req: Request<unknown, unknown, Partial<PlaceA11yData>>,
	res: Response
): Promise<void> => {
	const { place_id, monthly_budget, max_cpc } = req.body as {
		place_id: string;
		monthly_budget: number;
		max_cpc: number;
	};

	if (!place_id || typeof place_id !== "string") {
		res.status(StatusCode.BAD_REQUEST).json(InvalidPlaceIDErrorJSON);
		return;
	}

	// get the place from the db
	try {
		const { _col, _connection } = await getCollection<PlaceA11yData>("place");
		const { _col: _monthsCol, _connection: _monthsConnection } =
			await getCollection<PromotionMonth>("promotionMonth");

		const placeExists = await isPlaceInDb(place_id);

		if (!placeExists) {
			res.status(StatusCode.BAD_REQUEST).json(PlaceDoesNotExistErrorJSON);
			return;
		}

		// We are using the Place to hold the monthly budget and max_cpc
		// because it can carry over from month to month and can be changed
		// at any time for a specific place. We will compare the promotionMonth
		// to the place to see if the place has reached its monthly budget.
		await Promise.all([
			_col.updateOne(
				{ _id: place_id },
				{
					$set: {
						"promotion.monthly_budget": monthly_budget,
						"promotion.max_cpc": max_cpc,
					},
				}
			),

			// TODO: don't insert if it exists - use findOneAndUpdate instead

			_monthsCol.updateOne(
				{
					placeID: place_id,
					month: new Date().getMonth() + 1, // 0 indexed but UIs are 1 indexed (ie. Jan = 1)
					year: new Date().getFullYear(),
					totalSpent: 0,
				},
				{
					$setOnInsert: {
						placeID: place_id,
						month: new Date().getMonth() + 1, // 0 indexed but UIs are 1 indexed (ie. Jan = 1)
						year: new Date().getFullYear(),
						totalSpent: 0,
					},
				},
				{ upsert: true }
			),
		]);

		await Promise.all([_connection.close(), _monthsConnection.close()]);

		res.status(StatusCode.OK).json({ message: "Place promotion successfully added" });
	} catch (e) {
		console.log("Something went wrong while trying to fetch the place");
		res.status(StatusCode.BAD_REQUEST);
		return;
	}
};
