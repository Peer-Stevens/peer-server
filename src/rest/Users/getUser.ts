import type { Request, Response } from "express";
import { getUserByEmailOnly } from "../../db/User/user";
import StatusCode from "../status";
import type { User } from "../../db/types";
type GetUserRequestBody = Partial<User>;

export const getUser = async (
	req: Request<unknown, unknown, GetUserRequestBody>,
	res: Response
): Promise<void> => {
	const { email } = req.body;
	try {
		if (email) {
			//This is wrapped in an if statement due to an error stating that the email (or req.body) could be undefined
			const user = await getUserByEmailOnly(email.toString());
			res.status(StatusCode.OK).json({ id: user._id?.toString() });
		}
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};
