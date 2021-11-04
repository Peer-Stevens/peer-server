import { dbConnection } from "../db/mongoConnection";
import { addPlace, getAllPlaces } from "../db/Place/place";
import { addUserToDb } from "../db/User/user";
import dotenv from "dotenv";
import { addRating } from "../db/Rating/rating";
import { User } from "../db/types";

dotenv.config();

async function main() {
	if (process.env.DB_NAME === "production") {
		console.log("You should not be running this command on the production database.");
		console.log("Please change your DB_NAME enviornment variable.");
		process.exit();
	}

	const { _db: db, _connection } = await dbConnection();

	// wipes the db so that we can test that things actually work later on in this script
	console.log("Wiping the database clean...");

	await db.dropDatabase();
	await _connection.close();

	console.log("Now attempting to seed the database...");

	console.log();

	console.log("Adding users to database...");

	let user1: User;
	try {
		user1 = await addUserToDb({
			username: "julioisfred",
			isBlindMode: false,
			readsBraille: false,
			doesNotPreferHelp: true,
		});
	} catch (e) {
		console.log(e);
	}

	let user2: User;
	try {
		user2 = await addUserToDb({
			username: "davidscookies",
			isBlindMode: false,
			readsBraille: true,
			doesNotPreferHelp: false,
		});
	} catch (e) {
		console.log(e);
	}

	let user3: User;
	try {
		user3 = await addUserToDb({
			username: "andrewsteashop",
			isBlindMode: false,
			readsBraille: false,
			doesNotPreferHelp: false,
		});
	} catch (e) {
		console.log(e);
	}

	// when a place is first added, the averages should default to zero since there are no ratings yet
	try {
		await addPlace({
			_id: "fakeid1",
			avgBraille: null,
			avgFontReadability: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
			avgGuideDogFriendly: null,
		});
	} catch (e) {
		console.log(e);
	}

	try {
		await addPlace({
			_id: "fakeid2",
			avgBraille: null,
			avgFontReadability: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
			avgGuideDogFriendly: null,
		});
	} catch (e) {
		console.log(e);
	}

	try {
		await addPlace({
			_id: "fakeid3",
			avgBraille: null,
			avgFontReadability: null,
			avgNavigability: null,
			avgStaffHelpfulness: null,
			avgGuideDogFriendly: null,
		});
	} catch (e) {
		console.log(e);
	}

	try {
		await addRating({
			// @ts-ignore
			userID: user1._id,
			placeID: "fakeid1",
			braille: 3,
			fontReadability: 5,
			staffHelpfulness: 5,
			navigability: 2,
			guideDogFriendly: null,
			comment: "Not too shabby",
			dateCreated: new Date(),
		});
	} catch (e) {
		console.log(e);
	}

	try {
		await addRating({
			// @ts-ignore
			userID: user2._id,
			placeID: "fakeid2",
			braille: 5,
			fontReadability: 1,
			staffHelpfulness: 3,
			navigability: 4,
			guideDogFriendly: 3,
			comment: "Great",
			dateCreated: new Date(),
		});
	} catch (e) {
		console.log(e);
	}

	try {
		await addRating({
			// @ts-ignore
			userID: user3._id,
			placeID: "fakeid3",
			braille: 5,
			fontReadability: 5,
			staffHelpfulness: 5,
			navigability: 5,
			guideDogFriendly: 5,
			comment: "Best place I've ever been too wow",
			dateCreated: new Date(),
		});
	} catch (e) {
		console.log(e);
	}

	try {
		await addRating({
			// @ts-ignore
			userID: user1._id,
			placeID: "fakeid2",
			braille: 1,
			fontReadability: 1,
			staffHelpfulness: 1,
			navigability: 1,
			guideDogFriendly: null,
			comment: "Idk dude, kinda sketch",
			dateCreated: new Date(),
		});
	} catch (e) {
		console.log(e);
	}

	try {
		await addRating({
			// @ts-ignore
			userID: user2._id,
			placeID: "fakeid3",
			braille: 1,
			fontReadability: 3,
			staffHelpfulness: 1,
			navigability: 3,
			guideDogFriendly: null,
			comment: "eh, its okay",
			dateCreated: new Date(),
		});
	} catch (e) {
		console.log(e);
	}

	console.log();
	console.log("Retrieving all places from the database...");

	let allPlaces;
	try {
		allPlaces = await getAllPlaces();
		console.log("All the places that exist in the database are:");
		console.log(allPlaces);
	} catch (e) {
		console.log(e);
	}

	console.log();
	console.log("Done seeding the database!");
}

void main();
export {};
