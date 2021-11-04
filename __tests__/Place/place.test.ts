import axios from "axios";
import { Place } from "../../src/db/types";
import { dbConnection } from "../../src/db/mongoConnection";

describe("Place database functions", () => {
	it("/addPlace adds place", async () => {
		const { _db, _connection } = await dbConnection();
		await _db.dropDatabase();
		await _connection.close();

		let place: Place;
		try {
			// eslint-disable-next-line
			const { data } = await axios.post("http://localhost:3030/addPlace", {
				_id: "faketestid1",
			});
			// eslint-disable-next-line
			place = data;
		} catch (e) {
			console.log(e);
			return;
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
});
