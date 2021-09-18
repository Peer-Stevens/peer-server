import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

// was having an issue with the types, we can fix this later...
let _connection: any = undefined;
let _db: any = undefined;

export async function dbConnection() {
	dotenv.config();

	if (!_connection) {
		_connection = await MongoClient.connect(
			`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@peer.uiwsq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
		);
		_db = await _connection.db(process.env.DB_NAME);
	}

	return _db;
}
