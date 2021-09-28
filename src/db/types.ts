import type { ObjectId } from "mongodb";
export interface User {
	_id?: ObjectId;
	isBlindMode: boolean;
	firstName: string;
	lastName: string;
	email: string;
	reviews: Array<ObjectId>;
}

export interface Review {
	_id?: ObjectId;
	userID: ObjectId;
	// made placeID an ObjectID for now until we figure out what type this will end up being
	placeID: ObjectId;
	braille: number | null;
	fontReadability: number | null;
	staffHelpfulness: number | null;
	openessOfSpace: number | null;
	comment: string | null;
	dateCreated: Date;
}

export interface Place {
	// made this an ObjectID for now until we figure out what type this will end up being
	_id?: ObjectId;
	avgBraille: number;
	avgFontReadability: number;
	avgStaffHelpfulness: number;
	avgOpenessOfSpace: number;
	comments: Array<string>;
}
