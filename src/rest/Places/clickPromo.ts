import type { Request, Response } from "express";
import { isPlaceInDb } from "../../db/Place/place";
import { Place, PromotionMonth } from "peer-types";
import { getCollection } from "../../db/mongoCollections";
import StatusCode from "../status";
import { InvalidPlaceIDErrorJSON, PlaceDoesNotExistErrorJSON } from "../../rest/util";

export const clickPromo = async (
	req: Request<unknown, unknown, Partial<Place>>,
	res: Response
): Promise<void> => {
	// getPlaces will determine the spend_amount as one cent above
	// the second-highest CPC in a user's place list, or 1 cent if there are no competing promoted places,
	// so we don't penalize the highest-CPC business for picking a higher CPC.
	// In other words, we want to encourage higher CPCs, but not overcharge the highest-CPC business.
	const { place_id, spend_amount } = req.body as {
		place_id: string;
		spend_amount: number;
	};

	if (!place_id || typeof place_id !== "string") {
		res.status(StatusCode.BAD_REQUEST).json(InvalidPlaceIDErrorJSON);
		return;
	}

	// get the place from the db
	try {
		const { _col: _monthsCol, _connection: _monthsConnection } =
			await getCollection<PromotionMonth>("promotionMonth");

		const placeExists = await isPlaceInDb(place_id);

		if (!placeExists) {
			res.status(StatusCode.BAD_REQUEST).json(PlaceDoesNotExistErrorJSON);
			return;
		}

		// We don't need to check if the place is above its monthly budget *here* because
		// we will check that when we *send* the place to the frontend b/c we need that check there
		// anyway to determine if a place should be displayed as promoted.
		//
		// There is a small chance that places could exceed their monthly budget if two
		// users fetch place lists at the same time, but that's fine because we'll still only
		// charge the maximum monthly budget for the place.
		await _monthsCol.updateOne(
			{
				placeID: place_id,
				year: new Date().getFullYear(),
				month: new Date().getMonth() + 1,
			},
			{
				$inc: {
					totalSpent: Number(spend_amount) || 0.01, //charge at least 1 cent per click
				},
			},
			{
				upsert: true,
			}
		);

		await _monthsConnection.close();

		res.status(StatusCode.OK).json({ message: "Added click successfully" });
	} catch (e) {
		console.log("Something went wrong while trying to fetch the place");
		res.status(StatusCode.BAD_REQUEST);
		return;
	}
};
