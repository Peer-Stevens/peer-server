import type { Request, Response } from "express";
import { getUserByEmailOnly } from "../../db/User/user";
import StatusCode from "../status";

export const getUser = async (req: Request, res: Response): Promise<void> => {
	try {
		const user = await getUserByEmailOnly(req.params.id);
		res.status(StatusCode.OK).json(user._id);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};
