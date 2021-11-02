import type { Request, Response } from "express";
import { addUserToDb } from "../../db/User/user";
import type { User } from "../../db/types";
import StatusCode from "../status";

export const addUser = async (
	req: Request<unknown, unknown, Partial<User>>,
	res: Response
): Promise<void> => {
	try {
		const newUser = await addUserToDb({
			// fake data for now until we have authentication implemented
			username: "bro123",
			isBlindMode: false,
			readsBraille: true,
			doesNotPreferHelp: true,
		});
		res.status(StatusCode.OK).json(newUser);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};
