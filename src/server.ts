import { example } from "./rest/example";
import { maps_api } from "./rest/api_key";
import express from "express";
import dotenv from "dotenv";
const app = express();
const port = 3030;

dotenv.config();

app.get("/api/maps", maps_api);

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
