import type { Request, Response } from "express";
import { getPlaceByID } from "../../db/Place/place";
import StatusCode from "../status";

export const getPlace = async (req: Request, res: Response): Promise<void> => {
	try {
		const place = await getPlaceByID(req.params.id);
		res.status(StatusCode.OK).json(place);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};
