import { getUserByID } from "../../db/User/user";
import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import StatusCode from "../status";

export const getUser = async (req: Request, res: Response): Promise<void> => {
	try {
		const user = await getUserByID(new ObjectId(req.params.id));
		res.status(StatusCode.OK).json(user);
	} catch (e) {
		res.status(StatusCode.INTERNAL_SERVER_ERROR).json(e);
	}
};
