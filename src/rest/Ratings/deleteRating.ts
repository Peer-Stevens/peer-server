import type { Request, Response } from "express";
import { deleteRatingFromDb } from "../../db/Rating/rating";
import { ObjectId } from "mongodb";

export const deleteRating = async (req: Request, res: Response): Promise<void> => {
	try {
		const didDelete = await deleteRatingFromDb(new ObjectId(req.params.id));
		if (didDelete === true) {
			res.status(200).json(didDelete);
			return;
		} else {
			res.status(400).json({ error: "Rating does not exist" });
		}
	} catch (e) {
		res.status(500).json(e);
	}
};
