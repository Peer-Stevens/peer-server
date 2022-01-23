import { Client, Place as GooglePlace } from "@googlemaps/google-maps-services-js";
import { Request, Response } from "express";
import { getNearbyPlaces } from "../src/rest/getNearbyPlaces";
import { getPlaceByID } from "../src/db/Place/place";
import { Place, PlaceWithA11yAndPromo } from "../src/db/types";
import { PromotionMonth } from "../src/db/types";
import { getPromoMonth } from "../src/db/PromoMonth/promoMonth";
import StatusCode from "../src/rest/status";
import { ObjectId } from "mongodb";

jest.mock("@googlemaps/google-maps-services-js");
const mockClient = Client as jest.MockedClass<typeof Client>;
const mockPlacesNearby = jest.fn();
mockClient.mockReturnValue({
	placesNearby: mockPlacesNearby,
} as unknown as Client);

jest.mock("../src/db/Place/place");
const mockGetPlaceByID = getPlaceByID as jest.MockedFunction<typeof getPlaceByID>;

jest.mock("../src/db/PromoMonth/promoMonth");
const mockGetPromoMonth = getPromoMonth as jest.MockedFunction<typeof getPromoMonth>;

// mock data

const mockPlace: GooglePlace = {
	name: "Andrew's House",
	place_id: "andhous",
};

const mockPlaceA11yData: Place = {
	_id: mockPlace.place_id,
	avgBraille: 5,
	avgFontReadability: 5,
	avgGuideDogFriendly: 5,
	avgNavigability: 5,
	avgStaffHelpfulness: 5,
	promotion: {
		monthly_budget: 100,
		max_cpc: 1,
	},
};

const mockPromoMonth: PromotionMonth = {
	_id: new ObjectId(),
	placeID: mockPlace.place_id,
	month: 1,
	year: 2020,
	totalSpent: 0,
};

const combinedMock: PlaceWithA11yAndPromo = {
	...mockPlace,
	accessibilityData: mockPlaceA11yData,
	isValidPromo: true, // this place is valid because total spent < monthly budget
	isPromoted: true,
	spend_amount: 0.01,
};

const mockPromoMonthOverBudget: PromotionMonth = {
	_id: new ObjectId(),
	placeID: mockPlace.place_id,
	month: 2,
	year: 2022,
	totalSpent: 100,
};

const combinedMockOverBudget: PlaceWithA11yAndPromo = {
	...mockPlace,
	accessibilityData: mockPlaceA11yData,
	isValidPromo: false, // this place is valid because total spent < monthly budget
};

beforeEach(() => {
	mockPlacesNearby.mockClear();
	mockGetPlaceByID.mockReset();
});

describe("Get nearby places endpoint tests", () => {
	it("returns an OK response when asked to get nearby places with accessibility data", async () => {
		mockPlacesNearby.mockResolvedValueOnce({ data: { results: [mockPlace] } });
		mockGetPlaceByID.mockResolvedValue(mockPlaceA11yData);
		mockGetPromoMonth.mockResolvedValue(mockPromoMonth);

		const mockJSON = jest.fn();
		const mockStatus = jest.fn().mockReturnValue({ json: mockJSON });

		await getNearbyPlaces(
			{ query: { latitude: 0, longitude: 0, includeRatings: true } } as unknown as Request,
			{ status: mockStatus, json: mockJSON } as unknown as Response
		);

		expect(mockStatus).toHaveBeenCalledWith(StatusCode.OK);
		expect(mockJSON).toHaveBeenCalledWith({
			places: [combinedMock],
		});
	});
	it("returns a place without promoting it when the monthly budget is spent", async () => {
		mockPlacesNearby.mockResolvedValueOnce({ data: { results: [mockPlace] } });
		mockGetPlaceByID.mockResolvedValue(mockPlaceA11yData);
		mockGetPromoMonth.mockResolvedValue(mockPromoMonthOverBudget);

		const mockJSON = jest.fn();
		const mockStatus = jest.fn().mockReturnValue({ json: mockJSON });

		await getNearbyPlaces(
			{ query: { latitude: 0, longitude: 0, includeRatings: true } } as unknown as Request,
			{ status: mockStatus, json: mockJSON } as unknown as Response
		);

		expect(mockStatus).toHaveBeenCalledWith(StatusCode.OK);
		expect(mockJSON).toHaveBeenCalledWith({
			places: [combinedMockOverBudget],
		});
	});
});
