export class AuthenticationError extends Error {}

// Constants
export const UserCreatedJSON = { status: "User successfully created" };
export const RatingCreatedJSON = { status: "Rating successfully created" };
export const MalformedRequestErrorJSON = { error: "Malformed request" };
export const UnauthorizedErrorJSON = { error: "Not authorized to make this request" };
export const ServerErrorJSON = { error: "Something went wrong" };
