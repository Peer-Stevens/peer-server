import axios from "axios";
import { ObjectId } from "bson";
import { User } from "../../src/db/types";

describe("User REST endpoints", () => {
	let userId: ObjectId;

	it("/addUser adds user to database", async () => {
		let user!: User;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.post("http://localhost:3030/addUser");
			// eslint-disable-next-line
			user = data;
			responseStatus = status;
			if (user._id) {
				userId = user._id;
			}
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus).toEqual(200);
		expect(user).toMatchObject<User>({
			_id: user._id,
			username: "bro123",
			isBlindMode: false,
			readsBraille: true,
			doesNotPreferHelp: true,
		});
	});
	it("/getUser gets user from database", async () => {
		let user!: User;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.get(`http://localhost:3030/getUser/${userId}`);
			// eslint-disable-next-line
			user = data;
			responseStatus = status;
		} catch (e) {
			console.log(e);
		}

		expect(responseStatus).toEqual(200);
		expect(user).toMatchObject<User>({
			_id: userId,
			username: "bro123",
			isBlindMode: false,
			readsBraille: true,
			doesNotPreferHelp: true,
		});
	});
	it.skip("/editUser", async () => {
		// does not work right now
		//TODO fix this
		let user!: User;
		let responseStatus!: number;
		try {
			// eslint-disable-next-line
			const { data, status } = await axios.patch("/editUser", {
				_id: userId,
				readsBraille: false,
			});
			// eslint-disable-next-line
			user = data;
			responseStatus = status;
		} catch (e) {
			console.log(e);
		}
		expect(responseStatus).toEqual(200);
		expect(user).toMatchObject<User>({
			_id: userId,
			username: "bro123",
			isBlindMode: false,
			readsBraille: false,
			doesNotPreferHelp: true,
		});
	});
});
