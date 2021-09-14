import { Request, Response } from "express";

export const example = (req: Request, res: Response) => {
	res.status(200).json({ exampleResponse: "helloworld" });
};
