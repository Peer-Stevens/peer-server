import { dbConnection } from "./mongoConnection";
import type { Collection } from "mongodb";
import { Place } from "./types";

// This will allow you to have one reference to each collection per app
// TODO: Change the string literal union types later once we create actual db functions.
// These are just examples, for now, to demonstrate how this should be used later.

export async function getCollection(collection: "places" | "users"): Promise<Collection<Place>> {
	let _col: Collection<Place> | undefined = undefined;

	if (!_col) {
		const db = await dbConnection();
		_col = db.collection(collection);
	}

	return _col;
}
