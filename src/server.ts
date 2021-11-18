import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import { getNearbyPlaces } from "./rest/getNearbyPlaces";
import { getPlacePhoto } from "./rest/getPlacePhoto";
import { getPlaceDetails } from "./rest/getPlaceDetails";
import { getAllPlaceRatings, getRating, getRatingsFromUser } from "./rest/Ratings/getRatings";
import { getPlace } from "./rest/Places/getPlaces";
import { getUser } from "./rest/Users/getUsers";
import { addRatingToPlace } from "./rest/Ratings/addRating";
import { addUser } from "./rest/Users/addUser";
import { addPlaceToDb } from "./rest/Places/addPlace";
import { editRating } from "./rest/Ratings/editRating";
import { editUser } from "./rest/Users/editUser";
import { deleteRating } from "./rest/Ratings/deleteRating";
import { login } from "./rest/login";

export const app = express();
const port = Number(process.env.PORT) || 3030;
const limiter = {
	windowMs: 15 * 60 * 1000, // 15 min in ms
	max: 1000,
	message:
		"The API is rate limited to a maximum of 1000 requests per 15 minutes, please lower your request rate",
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit(limiter));

dotenv.config();

app.get("/getNearbyPlaces", getNearbyPlaces);
app.get("/getPlacePhoto/:ref", getPlacePhoto);

app.get("/getPlaceDetails/:id", getPlaceDetails);

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

// add user
app.post("/addUser", addUser);

// add place
app.post("/addPlace", addPlaceToDb);

// edit rating
app.patch("/editRating", editRating);

// edit user
app.patch("/editUser", editUser);

// delete rating
app.delete("/deleteRating/:id", deleteRating);

app.post("/login", login);

export const server = app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
