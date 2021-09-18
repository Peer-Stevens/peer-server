import { dbConnection } from "./mongoConnection";

// This will allow you to have one reference to each collection per app
function getCollectionFn(collection: any) {
	let _col: any = undefined;

	return async () => {
		if (!_col) {
			const db = await dbConnection();
			_col = await db.collection(collection);
		}

		return _col;
	};
}

// List collections here in the mongoCollections object
export const mongoCollections = { places: getCollectionFn("places") };
