import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import {
	getRatingById,
	getAllRatingsForPlace,
	getAllRatingsFromUser,
} from "../../db/Rating/rating";

export const getAllPlaceRatings = async (req: Request, res: Response): Promise<void> => {
	try {
		const ratings = await getAllRatingsForPlace(req.params.id);
		res.status(200).json(ratings);
	} catch (e) {
		res.status(500).json(e);
	}
};

export const getRating = async (req: Request, res: Response): Promise<void> => {
	try {
		const rating = await getRatingById(new ObjectId(req.params.id));
		res.status(200).json(rating);
	} catch (e) {
		res.status(500).json(e);
	}
};

export const getRatingsFromUser = async (req: Request, res: Response): Promise<void> => {
	try {
		const ratings = await getAllRatingsFromUser(new ObjectId(req.params.id));
		res.status(200).json(ratings);
	} catch (e) {
		res.status(500).json(e);
	}
};
