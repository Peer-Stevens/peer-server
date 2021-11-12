import { ObjectId } from "bson";
import { User } from "../../src/db/types";
import { dbConnection } from "../../src/db/mongoConnection";
import { addUserToDb, getUserById, editUserInDb } from "../../src/db/User/User";

jest.setTimeout(15000);

beforeEach(async () => {
	const { _db, _connection } = await dbConnection();
	await _db.dropDatabase();
	await _connection.close();

	try {
		const user: User = {
			_id: new ObjectId("617cacca81bc431f3dcde5bd"),
			username: "ilovecheese",
			isBlindMode: true,
			doesNotPreferHelp: false,
			readsBraille: true,
		};
		await addUserToDb(user);
	} catch (e) {
		console.log(e);
	}
});

describe("User REST endpoints", () => {
	it("throws error when it tries to get nonexistent user", async () => {
		expect.assertions(1);
		return await getUserById(new ObjectId("618cacca81bc431f3dcde5bd")).catch(e =>
			expect(e).toEqual("Sorry, no user exists with that ID")
		);
	});
	it("gets user", async () => {
		let user!: User;
		try {
			user = await getUserById(new ObjectId("617cacca81bc431f3dcde5bd"));
		} catch (e) {
			console.log(e);
		}

		expect(user).toMatchObject<User>({
			username: "ilovecheese",
			isBlindMode: true,
			doesNotPreferHelp: false,
			readsBraille: true,
		});
	});
	it("throws error when it tries to edit nonexistent user", async () => {
		expect.assertions(1);
		return await editUserInDb(new ObjectId("618cacca81bc431f3dcde5bd"), {
			username: "totallyfake",
		}).catch(e => expect(e).toEqual("Sorry, no user exists with that ID"));
	});
	it("edits user", async () => {
		let user!: User;
		try {
			user = await editUserInDb(new ObjectId("617cacca81bc431f3dcde5bd"), {
				username: "ilovedairy",
				readsBraille: false,
			});
		} catch (e) {
			console.log(e);
		}

		expect(user).toMatchObject<User>({
			username: "ilovedairy",
			isBlindMode: true,
			doesNotPreferHelp: false,
			readsBraille: false,
		});
	});
});
