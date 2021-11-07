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
			const { data } = await axios.post<User>("http://localhost:3030/addUser");
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
			const { data, status } = await axios.post<Rating>("http://localhost:3030/addRating", {
				userID: userId.toString(),
				placeID: "faketestid3",
				braille: 4,
				guideDogFriendly: 3,
			});
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
			const { data, status } = await axios.patch<Rating>("http://localhost:3030/editRating", {
				_id: ratingToEdit._id?.toString(),
				navigability: 3,
			});
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
			if (ratingToEdit._id) {
				const { data, status } = await axios.get<Rating>(
					`http://localhost:3030/getRating/${ratingToEdit._id.toString()}`
				);
				rating = data;
				responseStatus = status;
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
			navigability: 3,
			guideDogFriendly: 3,
			comment: null,
		});
	});
	it("/getAllPlaceRatings/:id get all ratings for a place", async () => {
		let ratings!: Array<Rating>;
		let responseStatus!: number;
		try {
			if (ratingToEdit.placeID) {
				const { data, status } = await axios.get<Array<Rating>>(
					`http://localhost:3030/getAllPlaceRatings/${ratingToEdit.placeID}`
				);
				ratings = data;
				responseStatus = status;
			}
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
			const { data, status } = await axios.get<Array<Rating>>(
				`http://localhost:3030/getRatingsFromUser/${userId?.toString()}`
			);
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
			if (ratingToEdit._id) {
				const { data, status } = await axios.delete<boolean>(
					`http://localhost:3030/deleteRating/${ratingToEdit._id?.toString()}`
				);
				didDelete = data;
				responseStatus = status;
			}
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus).toEqual(200);
		expect(didDelete).toEqual(true);
	});
});
