import {
	Client,
	PlacesNearbyRanking,
	PlacesNearbyResponse,
} from "@googlemaps/google-maps-services-js";

import { Request, Response } from "express";
import StatusCode from "./status";

export const getNearbyPlaces = async (req: Request, res: Response): Promise<void> => {
	const client = new Client({});
	const placesRes = await client
		.placesNearby({
			params: {
				location: {
					latitude: Number(req.query.latitude),
					longitude: Number(req.query.longitude),
				},
				rankby: PlacesNearbyRanking.distance,
				key: process.env.PLACES_API_KEY || "", //TODO: check ESLint settings, it is disagreeing with the compiler here for some reason
			},
		})
		.catch(e => {
			console.log(e);
		});

	res.status(StatusCode.OK).json({
		places: (placesRes as PlacesNearbyResponse).data.results,
	});
};
