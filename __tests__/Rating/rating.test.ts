import { ObjectId } from "bson";
import {
	addRating,
	deleteRatingFromDb,
	editRatingInDb,
	getAllRatingsForPlace,
	getAllRatingsFromUser,
	getRatingById,
} from "../../src/db/Rating/rating";
import { getPlaceByID } from "../../src/db/Place/place";
import { dbConnection } from "../../src/db/mongoConnection";
import { Rating, Place } from "../../src/db/types";
import { addPlace } from "../../src/db/Place/place";
import { addUserToDb } from "../../src/db/User/user";
import { MongoServerError } from "mongodb";

beforeAll(async () => {
	const { _db, _connection } = await dbConnection();
	await _db.dropDatabase();
	await _connection.close();

	// add place to db
	try {
		await addPlace({
			_id: "fakeplace123",
			avgBraille: null,
			avgFontReadability: null,
			avgGuideDogFriendly: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
		});
	} catch (e) {
		if (e instanceof MongoServerError) {
			console.log("MONGOSERVERERROR: Something went wrong while trying to connect to Mongo");
		} else {
			throw e;
		}
	}

	// add another place to db
	try {
		await addPlace({
			_id: "fakeplace456",
			avgBraille: null,
			avgFontReadability: null,
			avgGuideDogFriendly: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
		});
	} catch (e) {
		if (e instanceof MongoServerError) {
			console.log("MONGOSERVERERROR: Something went wrong while trying to connect to Mongo");
		} else {
			throw e;
		}
	}

	// add user to db
	try {
		await addUserToDb({
			_id: new ObjectId("617ccccc81bc431f3dcde5bd"),
			username: "ausername",
			readsBraille: true,
			isBlindMode: true,
			doesNotPreferHelp: false,
		});
	} catch (e) {
		if (e instanceof MongoServerError) {
			console.log("MONGOSERVERERROR: Something went wrong while trying to connect to Mongo");
		} else {
			throw e;
		}
	}

	// add another user to db
	try {
		await addUserToDb({
			_id: new ObjectId("617ccccd81bc431f3dcde5bd"),
			username: "anotherusername",
			readsBraille: false,
			isBlindMode: false,
			doesNotPreferHelp: false,
		});
	} catch (e) {
		if (e instanceof MongoServerError) {
			console.log("MONGOSERVERERROR: Something went wrong while trying to connect to Mongo");
		} else {
			throw e;
		}
	}

	// add rating to db
	try {
		await addRating({
			_id: new ObjectId("617cacca81bc431f3dcde5be"),
			userID: new ObjectId("617ccccc81bc431f3dcde5bd"),
			placeID: "fakeplace123",
			braille: 4,
			fontReadability: null,
			guideDogFriendly: 5,
			navigability: 2,
			staffHelpfulness: 1,
			comment: null,
			dateCreated: new Date(),
		});
	} catch (e) {
		if (e instanceof MongoServerError) {
			console.log("MONGOSERVERERROR: Something went wrong while trying to connect to Mongo");
		} else {
			throw e;
		}
	}

	// add another rating to db
	try {
		await addRating({
			_id: new ObjectId("617cacca81bc431f3ccde5be"),
			userID: new ObjectId("617ccccc81bc431f3dcde5bd"),
			placeID: "fakeplace456",
			braille: null,
			fontReadability: 3,
			guideDogFriendly: 1,
			navigability: 3,
			staffHelpfulness: 1,
			comment: null,
			dateCreated: new Date(),
		});
	} catch (e) {
		if (e instanceof MongoServerError) {
			console.log("MONGOSERVERERROR: Something went wrong while trying to connect to Mongo");
		} else {
			throw e;
		}
	}
});

describe("Rating REST endpoints", () => {
	it("throws error when it tries to get nonexistent rating", async () => {
		expect.assertions(1);
		return await getRatingById(new ObjectId("617cacca81bc431f3dcde5bd")).catch(e =>
			expect(e).toEqual("Sorry, no rating exists with that ID")
		);
	});
	it("gets rating", async () => {
		let rating!: Rating;
		try {
			rating = await getRatingById(new ObjectId("617cacca81bc431f3dcde5be"));
		} catch (e) {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				throw e;
			}
		}

		expect(rating).toMatchObject<Partial<Rating>>({
			_id: new ObjectId("617cacca81bc431f3dcde5be"),
			userID: new ObjectId("617ccccc81bc431f3dcde5bd"),
			placeID: "fakeplace123",
			braille: 4,
			fontReadability: null,
			guideDogFriendly: 5,
			navigability: 2,
			staffHelpfulness: 1,
			comment: null,
		});
	});
	it("throws error when user tries to add a rating to a place they've already reviewed", async () => {
		expect.assertions(1);
		return await addRating({
			_id: new ObjectId("617caaca81bc431f3dcde5be"),
			userID: new ObjectId("617ccccc81bc431f3dcde5bd"),
			placeID: "fakeplace123",
			braille: 2,
			fontReadability: 1,
			guideDogFriendly: 5,
			navigability: 2,
			staffHelpfulness: 1,
			comment: "Ok",
			dateCreated: new Date(),
		}).catch(e => expect(e).toEqual("User cannot add more than one rating to the same place"));
	});
	it("adds rating", async () => {
		let rating!: Rating;
		try {
			rating = await addRating({
				userID: new ObjectId("617ccccd81bc431f3dcde5bd"),
				placeID: "fakeplace456",
				braille: 1,
				fontReadability: 4,
				guideDogFriendly: 3,
				navigability: 2,
				staffHelpfulness: null,
				comment: "Great",
				dateCreated: new Date(),
			});
		} catch (e) {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				throw e;
			}
		}

		expect(rating).toMatchObject<Partial<Rating>>({
			userID: new ObjectId("617ccccd81bc431f3dcde5bd"),
			placeID: "fakeplace456",
			braille: 1,
			fontReadability: 4,
			guideDogFriendly: 3,
			navigability: 2,
			staffHelpfulness: null,
			comment: "Great",
		});
	});
	it("throws error when it tries to edit nonexistent rating", async () => {
		expect.assertions(1);
		return await editRatingInDb(new ObjectId("617cacca81bc431f3dcde5bd"), { braille: 5 }).catch(
			e => expect(e).toEqual("Sorry, no rating exists with that ID")
		);
	});
	it("edits rating", async () => {
		let rating!: Rating;
		try {
			rating = await editRatingInDb(new ObjectId("617cacca81bc431f3dcde5be"), {
				navigability: 5,
				comment: "Fantastic, just fantastic.",
			});
		} catch (e) {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				throw e;
			}
		}
		expect(rating).toMatchObject<Partial<Rating>>({
			_id: new ObjectId("617cacca81bc431f3dcde5be"),
			userID: new ObjectId("617ccccc81bc431f3dcde5bd"),
			placeID: "fakeplace123",
			braille: 4,
			fontReadability: null,
			guideDogFriendly: 5,
			navigability: 5,
			staffHelpfulness: 1,
			comment: "Fantastic, just fantastic.",
		});
	});
	it("throws error when it tries to get all ratings from a nonexistent user", async () => {
		expect.assertions(1);
		return await getAllRatingsFromUser(new ObjectId("617cacca81bc431f3dcde5bd")).catch(e =>
			expect(e).toEqual("Sorry, no ratings have been given by that user")
		);
	});
	it("gets all ratings added by user", async () => {
		let ratings!: Array<Rating>;
		try {
			ratings = await getAllRatingsFromUser(new ObjectId("617ccccc81bc431f3dcde5bd"));
		} catch (e) {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				throw e;
			}
		}

		expect(ratings).toHaveLength(2);
	});
	it("throws error when it tries to get all ratings for a place that is not in the database", async () => {
		expect.assertions(1);
		return await getAllRatingsForPlace("placeThatIsNotInDb").catch(e =>
			expect(e).toEqual("Sorry, no ratings exist for that place")
		);
	});
	it("gets all ratings added for a place", async () => {
		let ratings!: Array<Rating>;
		try {
			ratings = await getAllRatingsForPlace("fakeplace456");
		} catch (e) {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				throw e;
			}
		}

		expect(ratings).toHaveLength(2);
	});
	it("throws error when it tries to delete a nonexistent rating", async () => {
		let didDelete!: boolean;
		try {
			didDelete = await deleteRatingFromDb(new ObjectId("617cacca81bc431f3dcde5bd"));
		} catch (e) {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				throw e;
			}
		}

		expect(didDelete).toEqual(false);
	});
	it("deletes a rating", async () => {
		let didDelete!: boolean;
		try {
			didDelete = await deleteRatingFromDb(new ObjectId("617cacca81bc431f3dcde5be"));
		} catch (e) {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				throw e;
			}
		}

		expect(didDelete).toEqual(true);
	});
	it("place averages are updating correctly", async () => {
		let place!: Place;
		try {
			place = await getPlaceByID("fakeplace456");
		} catch (e) {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				throw e;
			}
		}

		expect(place).toMatchObject<Place>({
			_id: "fakeplace456",
			avgBraille: 1,
			avgFontReadability: 3.5,
			avgGuideDogFriendly: 2,
			avgNavigability: 2.5,
			avgStaffHelpfulness: 1,
		});
	});
});
