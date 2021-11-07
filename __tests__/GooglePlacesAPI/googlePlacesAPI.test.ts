import { Place } from "@googlemaps/google-maps-services-js";
import axios from "axios";

describe("Google Places API", () => {
	it("/getNearbyPlaces returns nearby places", async () => {
		let nearbyPlaces!: Place;
		try {
			const { data } = await axios.get<Place>(
				"http://localhost:3030/getNearbyPlaces?latitude=40.743462&longitude=-74.029068"
			);
			nearbyPlaces = data;
		} catch (e) {
			console.log(e);
		}

		expect(nearbyPlaces).toBeDefined();
	});
	it("/getPlacePhoto returns an image", async () => {
		let imageStatus!: number;
		try {
			const { status } = await axios.get<Place>(
				"http://localhost:3030/getPlacePhoto/Aap_uEBlESKHx9XSFwCA1Mq9vXzyDYJt746bT6avBZUtHtquMh-U8exyK2bhs8gF7kXMcQIPS0B0c0HwCDhf6Nv22EgcyikJ_XARn6fGBprMHt3c6iJNTEQu0q6avzZuSobflgrWecAB2ayJD1JyMm75nGNqe3XPtayvYkJGxDn1mqvKon-k"
			);
			imageStatus = status;
		} catch (e) {
			console.log(e);
		}
		expect(imageStatus).toBeGreaterThanOrEqual(200);
		expect(imageStatus).toBeLessThanOrEqual(299);
	});
});
