import type { Request, Response } from "express";
import { addUserToDb, getUserByEmailOnly } from "../../db/User/user";
import type { User } from "../../db/types";
import StatusCode from "../status";
import {
	handleError,
	AccountExistsErrorJSON,
	MissingParametersErrorJSON,
	UserCreatedJSON,
	createToken,
} from "../util";
import { AuthenticationError } from "../../errorClasses";

const endPointName = "addUser";

type AddUserRequestBody = Partial<User>;

/**
 * Checks if a user is in the database by their email.
 * @param email the user's email
 * @param req the request of the addUser endpoint
 * @param res the response of the addUser endpoint
 * @returns
 */
const userIsInDb = async (
	email: string,
	req: Request<unknown, unknown, AddUserRequestBody>,
	res: Response
) => {
	try {
		// check that user not already in db
		await getUserByEmailOnly(email); // check only email because we don't care if hash is different
	} catch (e) {
		if (!(e instanceof AuthenticationError)) {
			handleError<AddUserRequestBody>(e, endPointName, req, res);
		} else {
			return false;
		}
	}
	return true;
};

/**
 * REST endpoint to add a new user account. Assumes that:
 * - the email address was validated on the client-side
 * - the hash was generated successfully on the client-side
 *
 * If the request does not provide settings information in the body, defaults are
 * created.
 * @param req HTTP request object containing user info as the body.
 * @param res HTTP response to be sent back.
 */
export const addUser = async (
	req: Request<unknown, unknown, AddUserRequestBody>,
	res: Response
): Promise<void> => {
	const { email, hash } = req.body;

	if (!email || !hash) {
		console.warn("addUser: Attempted to make new account without email or hash");
		res.status(StatusCode.BAD_REQUEST).json(MissingParametersErrorJSON);
		return;
	}

	if (await userIsInDb(email, req, res)) {
		console.warn(`addUser: Attempted to make new account with existing email ${email}`);
		res.status(StatusCode.BAD_REQUEST).json(AccountExistsErrorJSON);
		return;
	}

	try {
		const token = createToken();
		await addUserToDb({
			email: email,
			hash: hash,
			token: token,
			dateTokenCreated: new Date(),
		});
		res.status(StatusCode.OK).json({ ...UserCreatedJSON, token: token });
	} catch (e) {
		handleError<AddUserRequestBody>(e, endPointName, req, res);
	}
};
