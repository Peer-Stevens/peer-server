export class AuthenticationError extends Error {}
export class DbOperationError extends Error {}

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
