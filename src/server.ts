import express from "express";
import dotenv from "dotenv";

import { getNearbyPlaces } from "./rest/getNearbyPlaces";
import { getAllPlaceRatings, getRating, getRatingsFromUser } from "./rest/Ratings/getRatings";
import { getPlace } from "./rest/Places/getPlaces";

const app = express();
const port = process.env.PORT || 3030;

dotenv.config();

app.get("/getNearbyPlaces", getNearbyPlaces);

// get all ratings for certain place
app.get("/getAllPlaceRatings/:id", getAllPlaceRatings);

// get rating from database
app.get("/getRating/:id", getRating);

// get all the ratings that a user has given
app.get("/getRatingsFromUser/:id", getRatingsFromUser);

// get Place, will responsd with avgs per metric that we are collecting since that's how we defined the type
app.get("/getPlace/:id", getPlace);

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
