import axios from "axios";
import { Place, Rating } from "../../src/db/types";
import { dbConnection } from "../../src/db/mongoConnection";

describe("Place REST endpoints", () => {
	it("/addPlace adds place to database", async () => {
		const { _db, _connection } = await dbConnection();
		await _db.dropDatabase();
		await _connection.close();

		let place!: Place;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.post("http://localhost:3030/addPlace", {
				_id: "faketestid1",
			});
			// eslint-disable-next-line
			place = data;
			responseStatus = status;
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus).toEqual(200);
		expect(place).toMatchObject<Place>({
			_id: "faketestid1",
			avgBraille: null,
			avgFontReadability: null,
			avgGuideDogFriendly: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
		});
	});
	it("/addPlace add several places", async () => {
		const { _db, _connection } = await dbConnection();
		await _db.dropDatabase();
		await _connection.close();

		let place!: Place;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.post("http://localhost:3030/addPlace", {
				_id: "faketestid2",
			});
			// eslint-disable-next-line
			place = data;
			responseStatus = status;
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus).toEqual(200);
		expect(place).toMatchObject<Place>({
			_id: "faketestid2",
			avgBraille: null,
			avgFontReadability: null,
			avgGuideDogFriendly: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
		});

		let place2!: Place;
		let responseStatus2!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.post("http://localhost:3030/addPlace", {
				_id: "faketestid3",
			});
			// eslint-disable-next-line
			place2 = data;
			responseStatus2 = status;
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus2).toEqual(200);
		expect(place2).toMatchObject<Place>({
			_id: "faketestid3",
			avgBraille: null,
			avgFontReadability: null,
			avgGuideDogFriendly: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
		});
	});
	it("/addPlace throws error when duplicate place is added", async () => {
		let place!: Place;
		try {
			// eslint-disable-next-line
			const { data } = await axios.post("http://localhost:3030/addPlace", {
				_id: "faketestid3",
			});
			// eslint-disable-next-line
			place = data;
		} catch (e) {
			expect(place).toBeUndefined();
		}
	});
	it("/getAllPlaceRatings/:id get place rating", async () => {
		let placeRatings!: Array<Rating>;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.get(
				"http://localhost:3030/getAllPlaceRatings/faketestid2"
			);
			// eslint-disable-next-line
			placeRatings = data;
			responseStatus = status;
		} catch (e) {
			console.log(e);
		}
		expect(responseStatus).toEqual(200);
		expect(placeRatings).toHaveLength(0);
	});
});
