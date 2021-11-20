import { editUserInDb, getUserByEmailAndHash } from "../db/User/user";
import { Request, Response } from "express";
import { AccountNotFoundErrorJSON, AuthenticationError, ServerErrorJSON } from "../types";
import { createHash } from "crypto";
import StatusCode from "./status";
import { User } from "../db/types";
import { ObjectId } from "bson";

/**
 * REST endpoint to login with an existing account.
 * Assumes that the AUTH_SEED environment variable is set.
 * @param req HTTP request with an email and hash in the body.
 * @param res HTTP response to be sent.
 * @returns
 */
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
			res.status(StatusCode.NOT_FOUND).json(AccountNotFoundErrorJSON);
			return;
		} else {
			throw e;
		}
	}

	const token = createHash("sha256")
		.update(`${new Date().toISOString()}${process.env.AUTH_SEED}`)
		.digest("hex");

	try {
		await editUserInDb(user._id as ObjectId, { token: token, dateTokenCreated: new Date() });
	} catch (e) {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.error(`login: The following error was thrown with the request body: ${req.body}`);
		console.error(e);
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(ServerErrorJSON);
	}
	res.status(StatusCode.OK).send(token);
};
