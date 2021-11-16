import { Place } from "../src/db/types";
import { dbConnection } from "../src/db/mongoConnection";
import { getPlaceByID, addPlace } from "../src/db/Place/place";
import { MongoServerError } from "mongodb";

beforeAll(async () => {
	const { _db, _connection } = await dbConnection();
	await _db.dropDatabase();
	await _connection.close();

	try {
		await addPlace({
			_id: "faketestid1",
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

	try {
		await addPlace({
			_id: "faketestid4",
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
});

describe("Place REST endpoints", () => {
	it("throws error when it tries to get place that doesn't exist in db", async () => {
		expect.assertions(1);
		return await getPlaceByID("faketestid2").catch(e => {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				expect(e).toEqual("Sorry, no place exists with the ID faketestid2");
			}
		});
	});
	it("gets place", async () => {
		let place!: Place;
		try {
			place = await getPlaceByID("faketestid1");
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
			_id: "faketestid1",
			avgBraille: null,
			avgFontReadability: null,
			avgGuideDogFriendly: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
		});
	});
	it("adds place to database", async () => {
		let place!: Place;

		try {
			place = await addPlace({
				_id: "faketestid3",
				avgBraille: null,
				avgFontReadability: null,
				avgGuideDogFriendly: null,
				avgNavigability: null,
				avgStaffHelpfulness: null,
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

		expect(place).toMatchObject<Place>({
			_id: "faketestid3",
			avgBraille: null,
			avgFontReadability: null,
			avgGuideDogFriendly: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
		});
	});
	it("throws error when duplicate place is added", async () => {
		expect.assertions(1);
		return await addPlace({
			_id: "faketestid4",
			avgBraille: null,
			avgFontReadability: null,
			avgGuideDogFriendly: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
		}).catch(e => {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				expect(e).toEqual(
					"That place already exists in the database and cannot be added again."
				);
			}
		});
	});
});
