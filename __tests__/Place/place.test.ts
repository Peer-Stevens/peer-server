import { Place } from "../../src/db/types";
import { dbConnection } from "../../src/db/mongoConnection";
import { getPlaceByID, addPlace } from "../../src/db/Place/place";

beforeEach(async () => {
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
		console.log(e);
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
		console.log(e);
	}
});

describe("Place REST endpoints", () => {
	it("get place that doesn't exist", async () => {
		expect.assertions(1);
		return await getPlaceByID("faketestid2").catch(e =>
			expect(e).toEqual("Sorry, no place exists with that ID")
		);
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
			console.log(e);
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
		}).catch(e =>
			expect(e).toEqual(
				"That place already exists in the database and cannot be added again."
			)
		);
	});
});
