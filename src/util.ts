import { createHash } from "crypto";
import { ObjectId } from "bson";
import { MongoServerError } from "mongodb";
import type { Request, Response } from "express";
import { getPlaceByID } from "./db/Place/place";
import { getUserByID } from "./db/User/user";
import StatusCode from "./rest/status";
import { DbOperationError } from "./types";

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
): void => {
	// do not send error `e` as a response for security reasons
	console.error(
		`${name}: The following error was thrown with the request body: ${JSON.stringify(req.body)}`
	);
	console.error(e);
	res.status(StatusCode.INTERNAL_SERVER_ERROR).json(ServerErrorJSON);
};

/**
 * Create a new token for authentication. Requires the
 * `AUTH_SEED` environment variable to be set to obfuscate
 * the values of the tokens generated.
 * @returns the token.
 */
export const createToken = (): string => {
	return createHash("sha256")
		.update(`${new Date().toISOString()}${process.env.AUTH_SEED}`)
		.digest("hex");
};

/**
 * Returns true if the provided user is authenticated, and false if the
 * user is not.
 * @param userID the user's ID as a string.
 * @param token the string.
 * @returns a boolean
 */
export const isAuthenticated = async (
	userID: string,
	token: string | undefined
): Promise<boolean> => {
	const userIDBson = new ObjectId(userID);

	try {
		const user = await getUserByID(userIDBson);
		if (user.token !== token || !token) {
			return false;
		}
	} catch (e) {
		if (e instanceof MongoServerError) {
			console.warn(e);
		}
		throw e;
	}
	return true;
};

// following two functions are kinda moist, feel free to DRY it out

export const userExists = async <T>(
	userID: string,
	endPointName: string,
	req: Request<unknown, unknown, T>,
	res: Response
): Promise<boolean> => {
	try {
		await getUserByID(new ObjectId(userID));
	} catch (e) {
		if (e instanceof DbOperationError) {
			return false;
		} else {
			handleError<T>(e, endPointName, req, res);
		}
	}
	return true;
};

export const placeExists = async <T>(
	placeID: string,
	endPointName: string,
	req: Request<unknown, unknown, T>,
	res: Response
): Promise<boolean> => {
	try {
		await getPlaceByID(placeID);
	} catch (e) {
		if (e instanceof DbOperationError) {
			return false;
		} else {
			handleError<T>(e, endPointName, req, res);
		}
	}
	return true;
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
	error: "Account with that email and/or password not found.",
};
export const RatingAlreadyExistsErrorJSON = {
	error: "This account has already added a rating to this place.",
};
export const PlaceDoesNotExistErrorJSON = {
	error: "There is no place with the provided place ID.",
};
