import express from "express";
import dotenv from "dotenv";

import { getNearbyPlaces } from "./rest/getNearbyPlaces";

const app = express();
const port = 3030;

dotenv.config();

app.get("/getNearbyPlaces", getNearbyPlaces);

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
