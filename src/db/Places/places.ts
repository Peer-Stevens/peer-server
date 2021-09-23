/* This is just a dummy file to test that the db connection works 
The content of this file should be changed later when we start writing database functions
*/

import { getCollection } from "../mongoCollections";
import { InsertOneResult, ObjectId } from "mongodb";
import { Place } from "../types";
import type { Collection } from "mongodb";

const places = getCollection("places");

export async function getAllPlaces(): Promise<Array<Place>> {
	const placesCollection: Collection<Place> = await places;

	return await placesCollection.find({}).toArray();
}

export async function getPlaceByID(id: ObjectId): Promise<Place> {
	const placesCollection: Collection<Place> = await places;

	const place = await placesCollection.findOne({ _id: id });
	if (place === null) throw "Sorry, no place exists with that ID";
	return place;
}

export async function addPlace(place: Place): Promise<Place> {
	const placesCollection: Collection<Place> = await places;

	const insertInfo: InsertOneResult<Place> = await placesCollection.insertOne(place);
	if (insertInfo.acknowledged === false) throw "Error adding place";

	const newID = insertInfo.insertedId;

	return await getPlaceByID(newID);
}
