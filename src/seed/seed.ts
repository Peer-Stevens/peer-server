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
		await addPlace({ name: "Chipotle", establishmentType: "Restaurant" });
	} catch (e) {
		console.log(e);
	}

	try {
		await addPlace({ name: "Wash n Dry", establishmentType: "Laundrymat" });
	} catch (e) {
		console.log(e);
	}

	try {
		await addPlace({ name: "Stevens", establishmentType: "School" });
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