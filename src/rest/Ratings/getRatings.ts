import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import {
	getRatingById,
	getAllRatingsForPlace,
	getAllRatingsFromUser,
	accessPotentialRating,
} from "../../db/Rating/rating";
import StatusCode from "../status";

export const getAllPlaceRatings = async (req: Request, res: Response): Promise<void> => {
	try {
		const ratings = await getAllRatingsForPlace(req.params.id);
		res.status(StatusCode.OK).json(ratings);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};

export const getRating = async (req: Request, res: Response): Promise<void> => {
	try {
		const rating = await getRatingById(new ObjectId(req.params.id));
		res.status(StatusCode.OK).json(rating);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};

export const getRatingsFromUser = async (req: Request, res: Response): Promise<void> => {
	try {
		const ratings = await getAllRatingsFromUser(new ObjectId(req.params.id));
		res.status(StatusCode.OK).json(ratings);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};

export const getPotentialRating = async (req: Request, res: Response): Promise<void> => {
	try {
		const ratingExists = await accessPotentialRating(req.params.email, req.params.placeID);
		res.status(StatusCode.OK).json(ratingExists);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};
