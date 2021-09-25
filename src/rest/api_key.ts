import { Request, Response } from "express";
import StatusCode from "../utils/status_code";

export const maps_api = (req: Request, res: Response) => {
	res.status(StatusCode.OK).json({ key: "test" });
};
