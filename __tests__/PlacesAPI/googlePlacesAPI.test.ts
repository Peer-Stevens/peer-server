import axios from "axios";

describe("Google Places API", () => {
	it("/getNearbyPlaces returns nearby places", async () => {
		let nearbyPlaces;
		try {
			// eslint-disable-next-line
			const { data } = await axios.get(
				"http://localhost:3030/getNearbyPlaces?latitude=40.743462&longitude=-74.029068"
			);
			// eslint-disable-next-line
			nearbyPlaces = data;
		} catch (e) {
			console.log(e);
		}

		// eslint-disable-next-line
		expect(nearbyPlaces.places).toHaveLength(20);
	});
	it("/getPlacePhoto returns an image", async () => {
		let imageStatus!: number;
		try {
			// eslint-disable-next-line
			const { status } = await axios.get(
				"http://localhost:3030/getPlacePhoto/Aap_uEBlESKHx9XSFwCA1Mq9vXzyDYJt746bT6avBZUtHtquMh-U8exyK2bhs8gF7kXMcQIPS0B0c0HwCDhf6Nv22EgcyikJ_XARn6fGBprMHt3c6iJNTEQu0q6avzZuSobflgrWecAB2ayJD1JyMm75nGNqe3XPtayvYkJGxDn1mqvKon-k"
			);
			// eslint-disable-next-line
			imageStatus = status;
		} catch (e) {
			console.log(e);
		}
		expect(imageStatus).toBeGreaterThanOrEqual(200);
		expect(imageStatus).toBeLessThanOrEqual(299);
	});
});
