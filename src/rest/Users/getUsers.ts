import { getUserById } from "../../db/User/user";
import type { Request, Response } from "express";
import { ObjectId } from "mongodb";

export const getUser = async (req: Request, res: Response): Promise<void> => {
	try {
		const user = await getUserById(new ObjectId(req.params.id));
		res.status(200).json(user);
	} catch (e) {
		res.status(500).json(e);
	}
};
