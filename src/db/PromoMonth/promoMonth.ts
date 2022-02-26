import { DbOperationError } from "../../errorClasses";
import { getCollection } from "../../db/mongoCollections";
import type { Place as GooglePlace } from "@googlemaps/google-maps-services-js";
import { PromotionMonth } from "peer-types";

export type GetPromoMonthArgs = {
	placeID: GooglePlace["place_id"];
	month: number;
	year: number;
};

// find a promo by place id and month and year
export async function getPromoMonth({
	placeID,
	month,
	year,
}: GetPromoMonthArgs): Promise<PromotionMonth> {
	if (!(placeID && month && year)) throw new DbOperationError("Invalid input");
	const { _col, _connection } = await getCollection<PromotionMonth>("promotionMonth");

	const promoMonth = await _col.findOneAndUpdate(
		{ placeID, month, year },
		{ $setOnInsert: { placeID, month, year, totalSpent: 0 } },
		{ upsert: true, returnDocument: "after" }
	);

	await _connection.close();

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- promo month actually can't be null because of the upsert
	return promoMonth.value!;
}
