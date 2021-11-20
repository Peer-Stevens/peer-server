import type { Request, Response } from "express";
import { ServerErrorJSON } from "./types";
import StatusCode from "./rest/status";

/**
 * Prints an error for a REST endpoint that processes data
 * sent to the body.
 * @param e The error to be printed
 * @param name the name of the endpoint
 * @param req The request of the addUser endpoint
 * @param res The response of the addUser endpoint
 */
export const handleError = <T>(
	e: Error | unknown,
	name: string,
	req: Request<unknown, unknown, T>,
	res: Response
) => {
	// do not send error `e` as a response for security reasons
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	console.error(`${name}: The following error was thrown with the request body: ${req.body}`);
	console.error(e);
	res.status(StatusCode.INTERNAL_SERVER_ERROR).json(ServerErrorJSON);
};
