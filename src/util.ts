import type { Request, Response } from "express";
import StatusCode from "./rest/status";

// Functions

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

// Constants
export const UserCreatedJSON = { status: "User successfully created." };
export const RatingCreatedJSON = { status: "Rating successfully created." };
export const MissingParametersErrorJSON = { error: "This request is missing parameters." };
export const WrongParamatersErrorJSON = {
	error: "This request has the wrong data type for a provided field in the body.",
};
export const UnauthorizedErrorJSON = {
	error: "You are not authorized to make this request. Please authenticate and try again.",
};
export const ServerErrorJSON = {
	error: "Something went wrong on the server. Please try again later.",
};
export const AccountExistsErrorJSON = { error: "An account already exists with this email." };
export const AccountNotFoundErrorJSON = {
	error: "Account with that email and password not found.",
};
export const RatingAlreadyExistsErrorJSON = {
	error: "This account has already added a rating to this place.",
};