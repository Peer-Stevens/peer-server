import { dbConnection } from "./mongoConnection";
import type { Collection } from "mongodb";
import type { DbData } from "./types";

export async function getCollection(
	collection: "rating" | "user" | "place"
): Promise<Collection<DbData>> {
	const _col: Promise<Collection<DbData>> | undefined = undefined;

	if (!_col) {
		const db = await dbConnection();
		return db.collection(collection);
	}

	return _col;
}
