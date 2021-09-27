import { ObjectId } from "mongodb";
export interface User {
	_id?: ObjectId;
	isBlind: boolean;
	firstName: string;
	lastName: string;
	email: string;
	reviews: Array<ObjectId> | Array<null>;
}

export interface Review {
	_id?: ObjectId;
	userID: ObjectId;
	// made placeID an ObjectID for now until we figure out what type this will end up being
	placeID: ObjectId;
	brailleRating: number | null;
	fontSizeRating: number | null;
	staffHelpfulnessRating: number | null;
	openessOfSpaceRating: number | null;
	comment: string | null;
	dateCreated: Date;
}

export interface Place {
	// made this an ObjectID for now until we figure out what type this will end up being
	_id?: ObjectId;
	avgBrailleRating: number | "No ratings have been submitted yet.";
	avgFontSizeRating: number | "No ratings have been submitted yet.";
	avgStaffHelpfulnessRating: number | "No ratings have been submitted yet.";
	avgOpenessOfSpaceRating: number | "No ratings have been submitted yet.";
	comments: Array<string> | Array<null>;
}
