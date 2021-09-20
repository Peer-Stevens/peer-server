/* This is just a dummy file to test that the db connection works 
The content of this file should be changed later when we start writing database functions
*/

import { getCollectionFn } from "../mongoCollections";
const places = getCollectionFn("places");
import { ObjectId } from "mongodb";

export async function getAllPlaces() {
	const placesCollection = await places();

	return await placesCollection.find({}).toArray();
}

export async function getPlaceByID(id: ObjectId) {
	const placesCollection = await places();

	const place = await placesCollection.findOne({ _id: id });
	if (place === null) throw "Sorry, no place exists with that ID";
	return place;
}

export async function addPlace(name: string, establishmentType: string) {
	const placesCollection = await places();

	const newPlace = {
		name: name,
		establishmentType: establishmentType,
	};

	const insertInfo = await placesCollection.insertOne(newPlace);
	if (insertInfo.insertedCount === 0) throw "Error adding place";

	const newID = insertInfo.insertedId;

	return await getPlaceByID(newID);
}
