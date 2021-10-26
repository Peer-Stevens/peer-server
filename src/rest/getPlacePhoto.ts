import { Request, Response } from "express";
import StatusCode from "./status";
import axios from "axios";

export const getPlacePhoto = async (req: Request, res: Response): Promise<void> => {
	const photoRef = req.params.ref;
	if (!photoRef) {
		res.status(StatusCode.BAD_REQUEST);
		return;
	}

	const { data } = await axios.get<Buffer>("https://maps.googleapis.com/maps/api/place/photo", {
		params: {
			photo_reference: photoRef,
			key: process.env.PLACES_API_KEY,
			maxwidth: 400,
		},
		responseType: "arraybuffer",
	});

	res.set({ "Content-Type": "image/png" });
	res.status(StatusCode.OK).send(data);
};
