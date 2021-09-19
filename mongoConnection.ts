import { MongoClient, Db } from "mongodb";
import * as dotenv from "dotenv";

let _connection: MongoClient;
let _db: Db;

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
