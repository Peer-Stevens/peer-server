import { Client, PlaceDetailsResponse } from "@googlemaps/google-maps-services-js";

import { Request, Response } from "express";

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

	res.status(200).json({ placeDetails: (detailRes as PlaceDetailsResponse).data });
};
