import express from "express";
import dotenv from "dotenv";

import { getNearbyPlaces } from "./rest/getNearbyPlaces";
import { getPlacePhoto } from "./rest/getPlacePhoto";
import { getAllPlaceRatings, getRating, getRatingsFromUser } from "./rest/Ratings/getRatings";
import { getPlace } from "./rest/Places/getPlaces";
import { getUser } from "./rest/Users/getUsers";
import { addRatingToPlace } from "./rest/Ratings/addRating";

const app = express();
const port = process.env.PORT || 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dotenv.config();

app.get("/getNearbyPlaces", getNearbyPlaces);
app.get("/getPlacePhoto/:ref", getPlacePhoto);

// get all ratings for certain place
app.get("/getAllPlaceRatings/:id", getAllPlaceRatings);

// get rating from database
app.get("/getRating/:id", getRating);

// get all the ratings that a user has given
app.get("/getRatingsFromUser/:id", getRatingsFromUser);

// get Place, will responsd with avgs per metric that we are collecting since that's how we defined the type
app.get("/getPlace/:id", getPlace);

// get information on the User
// we might want to think this one over in a later refactor of this for security purposes
app.get("/getUser/:id", getUser);

// add rating
app.post("/addRating", addRatingToPlace);

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
