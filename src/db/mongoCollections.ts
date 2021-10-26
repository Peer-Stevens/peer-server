import { dbConnection } from "./mongoConnection";
import type { Collection } from "mongodb";

export async function getCollection<T>(
	collection: "rating" | "user" | "place"
): Promise<Collection<T>> {
	const _col: Promise<Collection<T>> | undefined = undefined;

	if (!_col) {
		const db = await dbConnection();
		return db.collection(collection);
	}

	return _col;
}
