import { MongoClient } from "mongodb";
import type { Db } from "mongodb";
import dotenv from "dotenv";

let _connection: MongoClient;
let _db: Db;

// TODO: delete the dotenv stuff once the db is integrated with express!
dotenv.config();

export async function dbConnection(): Promise<Db> {
	if (!_connection) {
		_connection = await MongoClient.connect(
			`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@peer.uiwsq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
		);
		_db = _connection.db(process.env.DB_NAME);
	}

	return _db;
}
