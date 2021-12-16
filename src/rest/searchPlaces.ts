import {
	Client,
	PlaceInputType,
	FindPlaceFromTextResponse,
} from "@googlemaps/google-maps-services-js";
import { getPlaceByID } from "../db/Place/place";

import { Request, Response } from "express";
import StatusCode from "./status";

export const searchPlaces = async (req: Request, res: Response): Promise<void> => {
	const client = new Client({});
	if (!req.query.search || req.query.search.length === 0) {
		res.status(StatusCode.OK).json({
			places: [],
		});
	}
	const placesRes = await client
		.findPlaceFromText({
			params: {
				input: req.query.search ? String(req.query.search) : "",
				inputtype: PlaceInputType.textQuery,
				key: process.env.PLACES_API_KEY || "",
				fields: ["formatted_address", "geometry", "name", "place_id"],
			},
		})
		.catch(e => {
			console.log(e);
		});

	if (!placesRes?.data?.candidates?.length) {
		res.status(StatusCode.OK).json({
			places: [],
		});
	}
	// The response is either an object or void if there is an error, but we catch it anyway, so we can cast to PlacesNearbyResponse safely
	let resultPlaces = (placesRes as FindPlaceFromTextResponse).data.candidates;

	// Here we fire parallel requests to get the details of each place by their ids
	if (req.query.includeRatings) {
		resultPlaces = await Promise.all(
			resultPlaces.map(place =>
				getPlaceByID(place.place_id)
					.then(placeDetails => ({
						...place,
						accessibilityData: placeDetails,
					}))
					.catch(e => {
						console.log(e);
						return place;
					})
			)
		);
	}

	res.status(StatusCode.OK).json({
		places: resultPlaces,
	});
};
