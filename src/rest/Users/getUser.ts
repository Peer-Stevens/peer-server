import type { Request, Response } from "express";
import { getUserByEmailOnly } from "../../db/User/user";
import StatusCode from "../status";
import type { User } from "../../db/types";
import { MissingParametersErrorJSON } from "../util";
type GetUserRequestBody = Partial<User>;

export const getUser = async (
	req: Request<unknown, unknown, GetUserRequestBody>,
	res: Response
): Promise<void> => {
	const { email } = req.body;
	if (!email) {
		res.status(StatusCode.BAD_REQUEST).json({ MissingParametersErrorJSON });
	} else {
		try {
			const user = await getUserByEmailOnly(email);
			res.status(StatusCode.OK).json({ id: user._id?.toString() });
		} catch (e) {
			res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
		}
	}
};
