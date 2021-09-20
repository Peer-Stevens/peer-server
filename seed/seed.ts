import { dbConnection } from "../mongoConnection";
import { addPlace, getAllPlaces } from "../db/places";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
	const db = await dbConnection();

	// wipes the db so that we can test that things actually work later on in this script
	console.log("Wiping the database clean...");
	await db.dropDatabase();

	console.log("Now attempting to seed the database...");

	try {
		await addPlace("Chipotle", "Restaurant");
	} catch (e) {
		console.log(e);
	}

	try {
		await addPlace("Wash n Dry", "Laundrymat");
	} catch (e) {
		console.log(e);
	}

	try {
		await addPlace("Stevens", "School");
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

main();
export {};
