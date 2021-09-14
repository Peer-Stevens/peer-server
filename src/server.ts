import { example } from './rest/example'
import express from "express";
const app = express();
const port = 3030;

app.get("/example", example);