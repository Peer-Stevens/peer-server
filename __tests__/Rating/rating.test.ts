import axios from "axios";
import { ObjectId } from "bson";
import { Rating, User } from "../../src/db/types";

describe("Rating REST endpoints", () => {
	let userId!: ObjectId;
	let user!: User;
	let ratingToEdit!: Rating;

	it("/addRating adds Rating to a place", async () => {
		// need the userId in order to add rating, so I'm just adding a user to the db so that I know what the id is
		try {
			// eslint-disable-next-line
			const { data } = await axios.post("http://localhost:3030/addUser");
			// eslint-disable-next-line
			user = data;
			if (user._id) {
				userId = user._id;
			}
		} catch (e) {
			console.log(e);
		}

		expect(userId).toBeDefined();

		// now we can post a rating since we have a userId we can reference
		let rating!: Rating;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.post("http://localhost:3030/addRating", {
				userID: userId.toString(),
				placeID: "faketestid3",
				braille: 4,
				guideDogFriendly: 3,
			});
			// eslint-disable-next-line
			rating = data;
			responseStatus = status;
			if (rating) {
				ratingToEdit = rating;
			}
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus).toEqual(200);
		expect(rating).toMatchObject<Partial<Rating>>({
			_id: rating._id,
			userID: userId,
			placeID: "faketestid3",
			braille: 4,
			fontReadability: null,
			staffHelpfulness: null,
			navigability: null,
			guideDogFriendly: 3,
			comment: null,
		});
	});
	it("/editRating edit the rating that was just added", async () => {
		let rating!: Rating;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.patch("http://localhost:3030/editRating", {
				_id: ratingToEdit._id?.toString(),
				navigability: 3,
			});
			// eslint-disable-next-line
			rating = data;
			responseStatus = status;
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus).toEqual(200);
		expect(rating).toMatchObject<Partial<Rating>>({
			_id: rating._id,
			userID: userId,
			placeID: "faketestid3",
			braille: 4,
			fontReadability: null,
			staffHelpfulness: null,
			navigability: 3,
			guideDogFriendly: 3,
			comment: null,
		});
	});
	it("/getRating/:id get rating that was just edited", async () => {
		let rating!: Rating;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.get(
				// eslint-disable-next-line
				`http://localhost:3030/getRating/${ratingToEdit._id?.toString()}`
			);
			// eslint-disable-next-line
			rating = data;
			responseStatus = status;
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus).toEqual(200);
		expect(rating).toMatchObject<Partial<Rating>>({
			_id: rating._id,
			userID: userId,
			placeID: "faketestid3",
			braille: 4,
			fontReadability: null,
			staffHelpfulness: null,
			navigability: 3,
			guideDogFriendly: 3,
			comment: null,
		});
	});
	it("/getAllPlaceRatings/:id get all ratings for a place", async () => {
		let ratings!: Array<Rating>;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.get(
				// eslint-disable-next-line
				`http://localhost:3030/getAllPlaceRatings/${ratingToEdit.placeID}`
			);
			// eslint-disable-next-line
			ratings = data;
			responseStatus = status;
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus).toEqual(200);
		expect(ratings).toMatchObject<Array<Partial<Rating>>>([
			{
				_id: ratings[0]._id,
				userID: userId,
				placeID: "faketestid3",
				braille: 4,
				fontReadability: null,
				staffHelpfulness: null,
				navigability: 3,
				guideDogFriendly: 3,
				comment: null,
			},
		]);
	});
	it("/getRatingsFromUser/:id get all ratings given by a user", async () => {
		let ratings!: Array<Rating>;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.get(
				// eslint-disable-next-line
				`http://localhost:3030/getRatingsFromUser/${userId?.toString()}`
			);
			// eslint-disable-next-line
			ratings = data;
			responseStatus = status;
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus).toEqual(200);
		expect(ratings).toMatchObject<Array<Partial<Rating>>>([
			{
				_id: ratings[0]._id,
				userID: userId,
				placeID: "faketestid3",
				braille: 4,
				fontReadability: null,
				staffHelpfulness: null,
				navigability: 3,
				guideDogFriendly: 3,
				comment: null,
			},
		]);
	});
	it("/deleteRating/:id deletes a rating", async () => {
		let didDelete!: boolean;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.delete(
				// eslint-disable-next-line
				`http://localhost:3030/deleteRating/${ratingToEdit._id?.toString()}`
			);
			// eslint-disable-next-line
			didDelete = data;
			responseStatus = status;
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus).toEqual(200);
		expect(didDelete).toEqual(true);
	});
});
