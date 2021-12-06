import type { ObjectId } from "mongodb";
import type { Place as GooglePlaceID } from "@googlemaps/google-maps-services-js";

/*
 Note: _id is optional because _id of type ObjectId is automatically 
 generated by mongo upon an initial insertion
 */
export interface User {
	_id?: ObjectId;
	email: string;
	hash: string;
	isBlindMode: boolean;
	readsBraille: boolean;
	doesNotPreferHelp: boolean;
	dateEdited?: Date;
	token: string;
	dateTokenCreated: Date;
}

export interface Rating {
	_id?: ObjectId;
	userID: ObjectId;
	placeID: GooglePlaceID["place_id"];
	braille: number | null;
	fontReadability: number | null;
	staffHelpfulness: number | null;
	navigability: number | null;
	guideDogFriendly: number | null;
	comment: string | null;
	dateCreated: Date;
	dateEdited?: Date;
}

export interface Place {
	_id: GooglePlaceID["place_id"];
	avgBraille: number | null;
	avgFontReadability: number | null;
	avgStaffHelpfulness: number | null;
	avgNavigability: number | null;
	avgGuideDogFriendly: number | null;
}
