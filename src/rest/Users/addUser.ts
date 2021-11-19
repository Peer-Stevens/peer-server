import type { Request, Response } from "express";
import { addUserToDb } from "../../db/User/user";
import type { User } from "../../db/types";
import StatusCode from "../status";
import { MalformedRequestErrorJSON, ServerErrorJSON, UserCreatedJSON } from "../../types";

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
	req: Request<unknown, unknown, Partial<User>>,
	res: Response
): Promise<void> => {
	const { email, hash, isBlindMode, readsBraille, doesNotPreferHelp } = req.body;

	if (!email || !hash) {
		res.status(StatusCode.BAD_REQUEST).json(MalformedRequestErrorJSON);
		return;
	}

	const userDetails = {
		email: email,
		hash: hash,
		isBlindMode: isBlindMode || false,
		readsBraille: readsBraille || false,
		doesNotPreferHelp: doesNotPreferHelp || false,
	};

	try {
		await addUserToDb(userDetails);
		res.status(StatusCode.OK).json(UserCreatedJSON);
	} catch (e) {
		// do not send error `e` as a response for security reasons
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.error(`The following error was thrown with the request body: ${req.body}`);
		console.error(e);
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(ServerErrorJSON);
	}
};
