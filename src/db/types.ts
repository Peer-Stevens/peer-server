import { ObjectId } from "mongodb";

export interface Place {
	_id?: ObjectId;
	name: string;
	establishmentType: string;
}
