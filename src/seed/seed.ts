import { dbConnection } from "../db/mongoConnection";
import { addPlace, getAllPlaces } from "../db/Places/places";
import dotenv from "dotenv";
dotenv.config();

async function main() {
	if (process.env.DB_NAME === "production") {
		console.log("You should not be running this command on the production database.");
		console.log("Please change your DB_NAME enviornment variable.");
		process.exit();
	}

	const db = await dbConnection();

	// wipes the db so that we can test that things actually work later on in this script
	console.log("Wiping the database clean...");

	await db.dropDatabase();

	console.log("Now attempting to seed the database...");

	try {
		await addPlace({
			avgBrailleRating: 4,
			avgFontSizeRating: 5,
			avgOpenessOfSpaceRating: 2,
			avgStaffHelpfulnessRating: 1,
			comments: [
				"wow this place sucks",
				"the people are not very nice",
				"the menu had large font which was so nice!",
			],
		});
	} catch (e) {
		console.log(e);
	}

	try {
		await addPlace({
			avgBrailleRating: 5,
			avgFontSizeRating: 5,
			avgOpenessOfSpaceRating: 5,
			avgStaffHelpfulnessRating: 4,
			comments: ["very good", "love this place", "def go here"],
		});
	} catch (e) {
		console.log(e);
	}

	try {
		await addPlace({
			avgBrailleRating: 3,
			avgFontSizeRating: 4.5,
			avgOpenessOfSpaceRating: 5,
			avgStaffHelpfulnessRating: 5,
			comments: ["Not bad", "I come here every saturday", "nice"],
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

	process.exit();
}

void main();
export {};
