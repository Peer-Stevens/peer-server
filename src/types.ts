export class AuthenticationError extends Error {}

// Constants
export const UserCreatedJSON = { status: "User successfully created." };
export const RatingCreatedJSON = { status: "Rating successfully created." };
export const MalformedRequestErrorJSON = { error: "This request is missing parameters." };
export const UnauthorizedErrorJSON = {
	error: "You are not authorized to make this request. Please authenticate and try again.",
};
export const ServerErrorJSON = {
	error: "Something went wrong on the server. Please try again later.",
};
