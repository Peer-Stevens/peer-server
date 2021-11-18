import { editUserInDb, getUserByEmailAndHash } from "../db/User/user";
import { Request, Response } from "express";
import { AuthenticationError } from "../types";
import { createHash } from "crypto";
import StatusCode from "./status";
import { User } from "../db/types";
import { ObjectId } from "bson";

export const login = async (
	req: Request<unknown, unknown, { email: string; hash: string }>,
	res: Response
): Promise<void> => {
	const { email, hash } = req.body;

	let user: User;
	try {
		user = await getUserByEmailAndHash(email, hash);
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
	await editUserInDb(user._id as ObjectId, { token: token, dateTokenCreated: new Date() });
	res.status(StatusCode.OK).send(token);
};
