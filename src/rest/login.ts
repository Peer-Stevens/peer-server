import { getUserByUsernameAndHash } from "../db/User/user";
import { Request, Response } from "express";
import { AuthenticationError } from "../types";
import { createHash } from "crypto";
import StatusCode from "./status";

export const login = async (
	req: Request<unknown, unknown, { username: string; hash: string }>,
	res: Response
): Promise<void> => {
	const { username, hash } = req.body;

	try {
		await getUserByUsernameAndHash(username, hash);
	} catch (e) {
		if (e instanceof AuthenticationError) {
			res.status(StatusCode.NOT_FOUND).send("Account not found");
			return;
		} else {
			throw e;
		}
	}

	const token = createHash("sha256")
		.update(`${new Date().toISOString()}${process.env.AUTH_SEED}`)
		.digest("hex");
	const tokenStore: Record<string, string> = req.app.get("tokenStore") as Record<string, string>;
	tokenStore[username] = token;
	req.app.set("tokenStore", tokenStore);
	res.status(StatusCode.OK).send(token);
};
