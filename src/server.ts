import express, { Request, Response } from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { Passport } from "passport";

import { getNearbyPlaces } from "./rest/getNearbyPlaces";
import { searchPlaces } from "./rest/searchPlaces";
import { getPlacePhoto } from "./rest/getPlacePhoto";
import { getPlaceDetails } from "./rest/getPlaceDetails";
import { getAllPlaceRatings, getRating, getRatingsFromUser } from "./rest/Ratings/getRatings";
import { getPlace } from "./rest/Places/getPlaces";
import { addRatingToPlace } from "./rest/Ratings/addRatingToPlace";
import { addUser } from "./rest/Users/addUser";
import { addPlaceToDb } from "./rest/Places/addPlace";
import { editRating } from "./rest/Ratings/editRating";
import { editUser } from "./rest/Users/editUser";
import { deleteRating } from "./rest/Ratings/deleteRating";
import { handleError, strategy } from "./rest/util";
import StatusCode from "./rest/status";
import { promotePlace } from "./rest/Places/promotePlace";
import { clickPromo } from "./rest/Places/clickPromo";

dotenv.config();

export const app = express();
const port = Number(process.env.PORT) || 3030;
const limiter = {
	windowMs: 15 * 60 * 1000, // 15 min in ms
	max: 1000,
	message:
		"The API is rate limited to a maximum of 1000 requests per 15 minutes, please lower your request rate",
};

const auth = new Passport();
auth.use(strategy);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit(limiter));
app.use(auth.initialize());

app.post("/addRatingToPlace", addRatingToPlace);
app.get("/getAllPlaceRatings/:id", getAllPlaceRatings); // get all ratings for certain place
app.get("/getRating/:id", getRating); // get rating from database
app.get("/getRatingsFromUser/:id", getRatingsFromUser); // get all the ratings that a user has given
app.patch("/editRating", editRating);
app.delete("/deleteRating/:id", deleteRating);

// get Place, will responsd with avgs per metric that we are collecting since that's how we defined the type
app.get("/getPlace/:id", getPlace);
app.get("/getPlaceDetails/:id", getPlaceDetails);
app.get("/getNearbyPlaces", getNearbyPlaces);
app.post("/addPlace", addPlaceToDb);
app.get("/searchPlaces", searchPlaces);
app.get("/getPlacePhoto/:ref", getPlacePhoto);
app.post("/promotePlace", promotePlace);
app.post("/clickPromo", clickPromo);

app.post("/addUser", addUser);
app.patch("/editUser", editUser);

app.post(
	"/login",
	auth.authenticate(strategy, { session: false }),
	(req: Request, res: Response): void => {
		const token = req.user;
		res.status(StatusCode.OK).send(token);
	}
);

// error handler
app.use(handleError);

export const server = app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
