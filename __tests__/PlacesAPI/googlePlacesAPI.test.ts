import axios from "axios";

describe("Places API", () => {
	it("returns nearby places", async () => {
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
			return;
		}

		// eslint-disable-next-line
		expect(nearbyPlaces.places).toHaveLength(20);
	});
	it("returns an image", async () => {
		let image;
		try {
			// eslint-disable-next-line
			const { data } = await axios.get(
				"http://localhost:3030/getPlacePhoto/Aap_uEBlESKHx9XSFwCA1Mq9vXzyDYJt746bT6avBZUtHtquMh-U8exyK2bhs8gF7kXMcQIPS0B0c0HwCDhf6Nv22EgcyikJ_XARn6fGBprMHt3c6iJNTEQu0q6avzZuSobflgrWecAB2ayJD1JyMm75nGNqe3XPtayvYkJGxDn1mqvKon-k"
			);
			// eslint-disable-next-line
			image = data;
		} catch (e) {
			console.log(e);
			return;
		}
		expect(image).toBeDefined();
	});
});