import { Request, Response } from "express";

export const example = (req: Request, res: Response): void => {
	res.status(200).json({ exampleResponse: "helloworld" });
};
