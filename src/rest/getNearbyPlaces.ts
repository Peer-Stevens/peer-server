import {
	Client,
	PlacesNearbyResponse,
	Place as GooglePlace,
	PlaceType1,
} from "@googlemaps/google-maps-services-js";
import { getPlaceByID } from "../db/Place/place";

import { Request, Response } from "express";
import StatusCode from "./status";
import { getPromoMonth } from "../db/PromoMonth/promoMonth";

import type { Place as DbPlace, PlaceWithA11yAndPromo } from "../db/types";

import { placesNearbyByType } from "./util";

export const getNearbyPlaces = async (req: Request, res: Response): Promise<void> => {
	const client = new Client({});
	const placesRes = await placesNearbyByType(client, req.query, PlaceType1.restaurant).catch(e =>
		console.log(e)
	);

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

		const expandedPlaces = placesNearby as Array<GooglePlace & { accessibilityData: DbPlace }>;

		if (!req.query.omitPromos) {
			const date = new Date();
			const placesListWithPromos = (await Promise.all(
				expandedPlaces.map(place => {
					if (
						place.accessibilityData.promotion?.max_cpc > 0 &&
						place.accessibilityData.promotion?.monthly_budget > 0
					) {
						// if the place has a budget and CPC, we can get or create a promoMonth
						return getPromoMonth({
							placeID: place.place_id,
							month: date.getMonth() + 1,
							year: date.getFullYear(),
						}).then(promoMonth => ({
							...place,
							isValidPromo:
								promoMonth.totalSpent + place.accessibilityData.promotion.max_cpc <=
								place.accessibilityData.promotion.monthly_budget,
						}));
					} else {
						return place;
					}
				})
			)) as Array<PlaceWithA11yAndPromo>;

			// sort placesListWithPromos by isValidPromo and max_cpc
			const sortedPlaces = placesListWithPromos
				.map(el => el) // copy the array so that we can find the top promoted place without mutating the original array
				.sort((a, b) => {
					if (a.isValidPromo && !b.isValidPromo) {
						return -1;
					} else if (!a.isValidPromo && b.isValidPromo) {
						return 1;
					} else {
						return (
							b.accessibilityData.promotion?.max_cpc -
							a.accessibilityData.promotion?.max_cpc
						);
					}
				});

			// if the first element has a valid promo, we set the spend amount to the CPC of the second element plus 0.01
			// if the second element has no valid promo, we set the spend amount to 0.01
			if (sortedPlaces[0].isValidPromo) {
				const spend_amount = sortedPlaces[1]?.isValidPromo
					? sortedPlaces[1].accessibilityData.promotion.max_cpc + 0.01
					: 0.01;
				const originalPlaceIdx = placesListWithPromos.findIndex(
					place => place.place_id === sortedPlaces[0].place_id
				);
				if (originalPlaceIdx !== undefined) {
					placesListWithPromos[originalPlaceIdx].isPromoted = true;
					placesListWithPromos[originalPlaceIdx].spend_amount = spend_amount;
				}
			}
			res.status(StatusCode.OK).json({
				places: placesListWithPromos,
			});
			return;
		}
	}

	res.status(StatusCode.OK).json({
		places: placesNearby,
	});
};
