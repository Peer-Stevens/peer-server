import { Request, Response } from "express";
import StatusCode from "./status";
import axios from "axios";

export const getPlacePhoto = async (req: Request, res: Response): Promise<void> => {
	const { ref } = req.params;

	try {
		const { data } = await axios.get<Buffer>(
			"https://maps.googleapis.com/maps/api/place/photo",
			{
				params: {
					photo_reference: ref,
					key: process.env.PLACES_API_KEY,
					maxwidth: 400,
				},
				responseType: "arraybuffer",
			}
		);
		res.set({ "Content-Type": "image/png" });
		res.status(StatusCode.OK).send(data);
	} catch (e) {
		res.set({ "Content-Type": "text/html" });
		res.status(StatusCode.BAD_REQUEST).send("Got bad reference");
	}
};
