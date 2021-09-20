import { dbConnection } from "./mongoConnection";

// This will allow you to have one reference to each collection per app
// TODO: Change the string literal union types later once we create actual db functions.
// These are just examples, for now, to demonstrate how this should be used later.

export function getCollectionFn(collection: "places" | "users") {
	let _col: any = undefined;

	return async () => {
		if (!_col) {
			const db = await dbConnection();
			_col = await db.collection(collection);
		}

		return _col;
	};
}
