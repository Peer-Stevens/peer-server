import express from "express";
import dotenv from "dotenv";

import { getNearbyPlaces } from "./rest/getNearbyPlaces";
import { getPlacePhoto } from "./rest/getPlacePhoto";

const app = express();
const port = process.env.PORT || 3030;

dotenv.config();

app.get("/getNearbyPlaces", getNearbyPlaces);
app.get("/getPlacePhoto/:ref", getPlacePhoto);

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
