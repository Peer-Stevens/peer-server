import { Request, Response } from "express";
import StatusCode from "../utils/status_code";

export const example = (req: Request, res: Response) => {
	res.status(StatusCode.OK).json({ exampleResponse: "helloworld" });
};
