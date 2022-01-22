import { createHash } from "crypto";
import { ObjectId } from "bson";
import { MongoServerError } from "mongodb";
import type { Request, Response } from "express";
import { Strategy } from "passport-local";
import { editUserInDb, getUserByEmailAndHash, getUserByID } from "../db/User/user";
import StatusCode from "./status";
import { User } from "../db/types";
import { AuthenticationError } from "../errorClasses";

// Functions

/**
 * Handles a generic error thrown by a REST endpoint. Logs the content of the body
 * of the request.
 * @param e The error to be printed
 * @param req The request of the endpoint
 * @param res The response of the endpoint
 */
export const handleError = (
	e: Error | unknown,
	req: Request,
	res: Response,
	next: (err: Error | unknown) => void
): void => {
	if (res.headersSent) {
		next(e);
	}
	// do not send error `e` as a response for security reasons
	console.error(
		`${req.url}: The following error was thrown with the request body: ${JSON.stringify(
			req.body
		)}`
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

// Constants
export const UserCreatedJSON = { status: "User successfully created." };
export const RatingCreatedJSON = { status: "Rating successfully created." };
export const RatingUpdatedJSON = { status: "Rating successfully updated." };
export const RatingDeletedJSON = { status: "Rating successfully deleted." };
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
export const RatingDoesNotExistErrorJSON = {
	error: "There is no rating with the provided ID.",
};
export const RatingAlreadyExistsErrorJSON = {
	error: "This account has already added a rating to this place.",
};
export const PlaceDoesNotExistErrorJSON = {
	error: "There is no place with the provided place ID.",
};
export const InvalidPlaceIDErrorJSON = {
	error: "You must provide a valid place ID.",
};

/**
 * Strategy for the server to use for logging in.
 * Assumes that the `AUTH_SEED` environment variable
 * is set to call `createToken()`.
 */
export const strategy = new Strategy(
	{ usernameField: "email", passwordField: "hash" },
	async (email, hash, done) => {
		let user: User;
		try {
			user = await getUserByEmailAndHash(email, hash);
		} catch (e) {
			if (e instanceof AuthenticationError) {
				return done(null, false, {
					message: "Account with that email and/or password not found.",
				});
			} else {
				return done(e);
			}
		}

		const token = createToken();

		try {
			await editUserInDb(user._id as ObjectId, {
				token: token,
				dateTokenCreated: new Date(),
			});
		} catch (e) {
			return done(e);
		}

		console.log(`Successfully signed in ${email}`);

		return done(null, token);
	}
);
