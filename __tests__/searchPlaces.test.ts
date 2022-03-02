import { Client, Place as GooglePlace } from "@googlemaps/google-maps-services-js";
import { Request, Response } from "express";
import { searchPlaces } from "../src/rest/searchPlaces";
import { getPlaceByID } from "../src/db/Place/place";
import { PlaceA11yData } from "peer-types";
import StatusCode from "../src/rest/status";

jest.mock("@googlemaps/google-maps-services-js");
const mockClient = Client as jest.MockedClass<typeof Client>;
const mockPlacesFromText = jest.fn();
mockClient.mockReturnValue({
	findPlaceFromText: mockPlacesFromText,
} as unknown as Client);

jest.mock("../src/db/Place/place");
const mockGetPlaceByID = getPlaceByID as jest.MockedFunction<typeof getPlaceByID>;

// mock data

const mockPlace: GooglePlace = {
	name: "Andrew's House",
	place_id: "andhous",
};

const mockPlaceA11yData: PlaceA11yData = {
	_id: mockPlace.place_id,
	guideDogAvg: 5,
	isMenuAccessibleAvg: 1,
	noiseLevelAvg: 5,
	lightingAvg: 5,
	isStaffHelpfulAvg: 0,
	isBathroomOnEntranceFloorAvg: 1,
	isContactlessPaymentOfferedAvg: 1,
	isStairsRequiredAvg: 0,
	spacingAvg: 5,
	promotion: {
		monthly_budget: 100,
		max_cpc: 1,
	},
};

beforeEach(() => {
	mockPlacesFromText.mockClear();
	mockGetPlaceByID.mockReset();
});

describe("Search places endpoint tests", () => {
	it("returns an OK response when asked to get a searched place with accessibility data", async () => {
		mockPlacesFromText.mockResolvedValueOnce({ data: { candidates: [mockPlace] } });
		mockGetPlaceByID.mockResolvedValue(mockPlaceA11yData);

		const mockJSON = jest.fn();
		const mockStatus = jest.fn().mockReturnValue({ json: mockJSON });

		await searchPlaces(
			{ query: { search: "Andrew's+House", includeRatings: true } } as unknown as Request,
			{ status: mockStatus, json: mockJSON } as unknown as Response
		);

		expect(mockStatus).toHaveBeenCalledWith(StatusCode.OK);
		expect(mockJSON).toHaveBeenCalledWith({
			places: [{ ...mockPlace, accessibilityData: mockPlaceA11yData }],
		});
	});
});
