import { example } from "./rest/example";
import express from "express";
import * as dotenv from "dotenv";
const app = express();
const port = 3030;

dotenv.config();

app.get("/example", example);

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
