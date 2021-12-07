import { Request, Response } from "express";
import axios from "axios";
import { getPlacePhoto } from "../src/rest/getPlacePhoto";
import StatusCode from "../src/rest/status";

jest.mock("axios");
//eslint-disable-next-line @typescript-eslint/unbound-method
const mockGet = axios.get as jest.MockedFunction<typeof axios.get>;

const mockData = "Well hello there,";

describe("Get place photo endpoint tests", () => {
	it("returns an OK response if there is no error", async () => {
		mockGet.mockResolvedValue({ data: mockData });

		const mockSet = jest.fn();
		const mockSend = jest.fn();
		const mockStatus = jest.fn().mockReturnValue({ send: mockSend });

		// getPlacePhoto needs an await to finish executing the promise...
		// yet it does not return one so its not technically "awaitable"

		//eslint-disable-next-line @typescript-eslint/await-thenable
		await getPlacePhoto(
			{ params: { ref: "aaaaaaaa" } } as unknown as Request,
			{
				send: mockSend,
				status: mockStatus,
				set: mockSet,
			} as unknown as Response
		);

		expect(mockSet).toHaveBeenCalledWith({ "Content-Type": "image/png" });
		expect(mockStatus).toHaveBeenCalledWith(StatusCode.OK);
		expect(mockSend).toHaveBeenCalledWith(mockData);
	});
});
