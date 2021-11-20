import type { Request, Response } from "express";
import { addUserToDb, getUserByEmailOnly } from "../../db/User/user";
import type { User } from "../../db/types";
import StatusCode from "../status";
import {
	AuthenticationError,
	MissingParametersErrorJSON,
	ServerErrorJSON,
	UserCreatedJSON,
} from "../../types";

type AddUserRequestBody = Partial<
	Omit<User, "isBlindMode" | "readsBraille" | "doesNotPreferHelp"> & {
		isBlindMode: string;
		readsBraille: string;
		doesNotPreferHelp: string;
	}
>;

const handleError = (
	e: Error | unknown,
	req: Request<unknown, unknown, AddUserRequestBody>,
	res: Response
) => {
	// do not send error `e` as a response for security reasons
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	console.error(`addUser: The following error was thrown with the request body: ${req.body}`);
	console.error(e);
	res.status(StatusCode.INTERNAL_SERVER_ERROR).json(ServerErrorJSON);
};

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
			handleError(e, req, res);
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
 * @param req HTTP request object containing a user info as the body.
 * @param res HTTP response to be sent back.
 */
export const addUser = async (
	req: Request<unknown, unknown, AddUserRequestBody>,
	res: Response
): Promise<void> => {
	const { email, hash, isBlindMode, readsBraille, doesNotPreferHelp } = req.body;

	if (!email || !hash) {
		console.warn("addUser: Attempted to make new account without email or hash");
		res.status(StatusCode.BAD_REQUEST).json(MissingParametersErrorJSON);
		return;
	}

	const userDetails = {
		email: email,
		hash: hash,
		isBlindMode: isBlindMode === "true",
		readsBraille: readsBraille === "true",
		doesNotPreferHelp: doesNotPreferHelp === "true",
	};

	if (await userIsInDb(email, req, res)) {
		console.warn(`addUser: Attempted to make new account with existing email ${email}`);
		res.status(StatusCode.BAD_REQUEST).json(MissingParametersErrorJSON);
		return;
	}

	try {
		await addUserToDb(userDetails);
		res.status(StatusCode.OK).json(UserCreatedJSON);
	} catch (e) {
		handleError(e, req, res);
	}
};
