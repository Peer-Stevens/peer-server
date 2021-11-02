import type { Request, Response } from "express";
import { deleteRatingFromDb } from "../../db/Rating/rating";
import { ObjectId } from "mongodb";
import StatusCode from "../status";

export const deleteRating = async (req: Request, res: Response): Promise<void> => {
	try {
		const didDelete = await deleteRatingFromDb(new ObjectId(req.params.id));
		if (didDelete === true) {
			res.status(StatusCode.OK).json(didDelete);
			return;
		} else {
			res.status(StatusCode.BAD_REQUEST).json({ error: "Rating does not exist" });
		}
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};
