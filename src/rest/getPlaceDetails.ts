import { Client, PlaceDetailsResponse } from "@googlemaps/google-maps-services-js";
import { getPlaceByID } from "../db/Place/place";
import { Request, Response } from "express";
import StatusCode from "./status";

export const getPlaceDetails = async (req: Request, res: Response): Promise<void> => {
	const client = new Client({});
	const detailRes = await client
		.placeDetails({
			params: {
				place_id: req.params.id,
				key: process.env.PLACES_API_KEY || "",
			},
		})
		.catch(e => {
			console.log(e);
		});

	if (req.query.includeRatings && detailRes?.data?.result) {
		getPlaceByID(req.params.id)
			.then(placeRatingData => {
				res.status(StatusCode.OK).json({
					placeDetails: {
						...detailRes.data.result,
						accessibilityData: placeRatingData,
					},
				});
			})
			.catch(e => {
				console.log(e);
			});
	} else {
		res.status(200).json({ placeDetails: (detailRes as PlaceDetailsResponse).data });
	}
};
