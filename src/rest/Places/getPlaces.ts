import type { Request, Response } from "express";
import { getPlaceByID } from "../../db/Place/place";

export const getPlace = async (req: Request, res: Response): Promise<void> => {
	try {
		const place = await getPlaceByID(req.params.id);
		res.status(200).json(place);
	} catch (e) {
		res.status(500).json(e);
	}
};
