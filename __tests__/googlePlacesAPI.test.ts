import request from "supertest";
import { app, server } from "../src/server";

afterAll(() => {
	server.close();
});

describe("Google Places API", () => {
	it("/getNearbyPlaces returns nearby places", async () => {
		await request(app)
			.get("/getNearbyPlaces?latitude=40.743462&longitude=-74.029068")
			.expect("Content-Type", /json/)
			.expect(200);
	});
	it("/searchPlaces returns places", async () => {
		await request(app)
			.get("/searchPlaces?search=paris+spa")
			.expect("Content-Type", /json/)
			.expect(200);
	});
	it("/getPlacePhoto returns an image", async () => {
		await request(app)
			.get(
				"/getPlacePhoto/Aap_uEBlESKHx9XSFwCA1Mq9vXzyDYJt746bT6avBZUtHtquMh-U8exyK2bhs8gF7kXMcQIPS0B0c0HwCDhf6Nv22EgcyikJ_XARn6fGBprMHt3c6iJNTEQu0q6avzZuSobflgrWecAB2ayJD1JyMm75nGNqe3XPtayvYkJGxDn1mqvKon-k"
			)
			.expect(200);
	});
});
