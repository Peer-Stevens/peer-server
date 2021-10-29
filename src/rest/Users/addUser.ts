import type { Request, Response } from "express";
import { addUserToDb } from "../../db/User/user";
import type { User } from "../../db/types";

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
		res.status(200).json(newUser);
	} catch (e) {
		res.status(500).json(e);
	}
};
