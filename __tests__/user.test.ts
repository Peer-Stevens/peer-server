import { ObjectId } from "bson";
import { User } from "../src/db/types";
import { dbConnection } from "../src/db/mongoConnection";
import { addUserToDb, getUserByID, editUserInDb, getUserByEmailAndHash } from "../src/db/User/user";
import { MongoServerError } from "mongodb";
import { AuthenticationError } from "../src/errorClasses";

let mockUser: User;

beforeEach(async () => {
	const { _db, _connection } = await dbConnection();
	await _db.dropDatabase();
	await _connection.close();

	mockUser = {
		_id: new ObjectId("617cacca81bc431f3dcde5bd"),
		email: "ilovecheese@hotmail.com",
		hash: "2eb80383e8247580e4397273309c24e0003329427012d5048dcb203e4b280823",
		isBlindMode: true,
		doesNotPreferHelp: false,
		readsBraille: true,
	};

	try {
		await addUserToDb(mockUser);
	} catch (e) {
		if (e instanceof MongoServerError) {
			console.log("MONGOSERVERERROR: Something went wrong while trying to connect to Mongo");
		} else {
			throw e;
		}
	}
});

describe("User database functions", () => {
	it("throws error when it tries to get nonexistent user", async () => {
		expect.assertions(1);
		await getUserByID(new ObjectId("618cacca81bc431f3dcde5bd")).catch(e => {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				expect(e).toEqual("Sorry, no user exists with that ID");
			}
		});
	});
	it("gets user", async () => {
		let user!: User;
		try {
			user = await getUserByID(new ObjectId("617cacca81bc431f3dcde5bd"));
		} catch (e) {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				throw e;
			}
		}

		expect(user).toMatchObject<User>({
			email: "ilovecheese@hotmail.com",
			hash: "2eb80383e8247580e4397273309c24e0003329427012d5048dcb203e4b280823",
			isBlindMode: true,
			doesNotPreferHelp: false,
			readsBraille: true,
		});
	});
	it("throws error when it tries to edit nonexistent user", async () => {
		expect.assertions(1);
		return await editUserInDb(new ObjectId("618cacca81bc431f3dcde5bd"), {
			email: "totallyfake",
		}).catch(e => {
			if (e instanceof MongoServerError) {
				console.log(
					"MONGOSERVERERROR: Something went wrong while trying to connect to Mongo"
				);
			} else {
				expect(e).toEqual("Sorry, no user exists with that ID");
			}
		});
	});
	it("edits user", async () => {
		let user!: User;
		try {
			user = await editUserInDb(new ObjectId("617cacca81bc431f3dcde5bd"), {
				email: "ilovedairy@hotmail.com",
				readsBraille: false,
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

		expect(user).toMatchObject<User>({
			email: "ilovedairy@hotmail.com",
			hash: "2eb80383e8247580e4397273309c24e0003329427012d5048dcb203e4b280823",
			isBlindMode: true,
			doesNotPreferHelp: false,
			readsBraille: false,
		});
	});
});

describe("getByUsernameAndHash tests", () => {
	it("gets a user by username and hash", async () => {
		const user = await getUserByEmailAndHash(
			"ilovecheese@hotmail.com",
			"2eb80383e8247580e4397273309c24e0003329427012d5048dcb203e4b280823"
		);
		expect(user).toMatchObject<User>(mockUser);
	});
	it("throws an authentication error if the username is not in the database", async () => {
		expect.assertions(1);
		await getUserByEmailAndHash(
			"ilovespaghetti@hotmail.com",
			"2eb80383e8247580e4397273309c24e0003329427012d5048dcb203e4b280823"
		).catch(e => {
			expect(e).toBeInstanceOf(AuthenticationError);
		});
	});
	it("throws an authentication error if the hash is not in the database", async () => {
		expect.assertions(1);
		await getUserByEmailAndHash(
			"ilovecheese@hotmail.com",
			"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" // totally a valid hash btw
		).catch(e => {
			expect(e).toBeInstanceOf(AuthenticationError);
		});
	});
});
