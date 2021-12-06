import { Client, Place as GooglePlace } from "@googlemaps/google-maps-services-js";
import { Request, Response } from "express";
import { getNearbyPlaces } from "../src/rest/getNearbyPlaces";
import { getPlaceByID } from "../src/db/Place/place";
import { Place } from "../src/db/types";
import StatusCode from "../src/rest/status";

jest.mock("@googlemaps/google-maps-services-js");
const mockClient = Client as jest.MockedClass<typeof Client>;
const mockPlacesNearby = jest.fn();
mockClient.mockReturnValue({
	placesNearby: mockPlacesNearby,
} as unknown as Client);

jest.mock("../src/db/Place/place");
const mockGetPlaceByID = getPlaceByID as jest.MockedFunction<typeof getPlaceByID>;

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
};

beforeEach(() => {
	mockPlacesNearby.mockClear();
	mockGetPlaceByID.mockReset();
});

describe("Get nearby places endpoint tests", () => {
	it("returns an OK response when asked to get nearby places with accessibility data", async () => {
		mockPlacesNearby.mockResolvedValueOnce({ data: { results: [mockPlace] } });
		mockGetPlaceByID.mockResolvedValue(mockPlaceA11yData);

		const mockJSON = jest.fn();
		const mockStatus = jest.fn().mockReturnValue({ json: mockJSON });

		await getNearbyPlaces(
			{ query: { latitude: 0, longitude: 0, includeRatings: true } } as unknown as Request,
			{ status: mockStatus, json: mockJSON } as unknown as Response
		);

		expect(mockStatus).toHaveBeenCalledWith(StatusCode.OK);
		expect(mockJSON).toHaveBeenCalledWith({
			places: [{ ...mockPlace, accessibilityData: mockPlaceA11yData }],
		});
	});
});
