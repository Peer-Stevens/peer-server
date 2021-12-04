import {
	Client,
	PlacesNearbyRanking,
	PlacesNearbyResponse,
} from "@googlemaps/google-maps-services-js";
import { getPlaceByID } from "../db/Place/place";

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
				key: process.env.PLACES_API_KEY || "",
				type: req.query.type ? String(req.query.type) : "",
				keyword: req.query.keyword ? String(req.query.keyword) : "",
			},
		})
		.catch(e => {
			console.log(e);
		});

	// The response is either an object or void if there is an error, but we catch it anyway, so we can cast to PlacesNearbyResponse safely
	let placesNearby = (placesRes as PlacesNearbyResponse).data.results;

	// Here we fire parallel requests to get the details of each place by their ids
	if (req.query.includeRatings) {
		placesNearby = await Promise.all(
			placesNearby.map(place =>
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
		places: placesNearby,
	});
};
