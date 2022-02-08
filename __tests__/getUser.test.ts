import { ObjectId } from "mongodb";
import { User } from "../src/db/types";
import { getUser } from "../src/rest/Users/getUser";
import StatusCode from "../src/rest/status";
import { Request, Response } from "express";
import { getUserByEmailOnly } from "../src/db/User/user";

jest.mock("../src/db/User/user");
const mockGetUserByEmailOnly = getUserByEmailOnly as jest.MockedFunction<typeof getUserByEmailOnly>;

const idString = "618cacca81bc431f3dcde5bd";

const mockUser: User = {
	_id: new ObjectId(idString),
	email: "ilovecheese@hotmail.com",
	hash: "2eb80383e8247580e4397273309c24e0003329427012d5048dcb203e4b280823",
	token: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
	dateTokenCreated: new Date(),
};

mockGetUserByEmailOnly.mockResolvedValue(mockUser);

describe("Get User endpoint tests", () => {
	it("successfully gets a user id by email", async () => {
		const mockJSON = jest.fn();
		const mockStatus = jest.fn().mockReturnValue({ json: mockJSON });

		await getUser(
			{ body: { email: "ilovecheese@hotmail.com" } } as unknown as Request<
				unknown,
				unknown,
				Partial<User>
			>,
			{ status: mockStatus, json: mockJSON } as unknown as Response
		);

		expect(mockStatus).toHaveBeenCalledWith(StatusCode.OK);
		expect(mockJSON).toHaveBeenCalledWith({
			id: idString,
		});
	});

	it("returns BAD_REQUEST if user does not supply an email", async () => {
		const mockJSON = jest.fn();
		const mockStatus = jest.fn().mockReturnValue({ json: mockJSON });

		await getUser(
			{ body: { email: undefined } } as unknown as Request<unknown, unknown, Partial<User>>,
			{ status: mockStatus, json: mockJSON } as unknown as Response
		);

		expect(mockStatus).toHaveBeenCalledWith(StatusCode.BAD_REQUEST);
	});

	it("returns INTERNAL_SERVER_ERROR if an error occurs while getting the user", async () => {
		const mockJSON = jest.fn();
		const mockStatus = jest.fn().mockReturnValue({ json: mockJSON });
		mockGetUserByEmailOnly.mockImplementation(() => {
			throw new Error();
		});

		await getUser(
			{ body: { email: "ilovecheese@hotmail.com" } } as unknown as Request<
				unknown,
				unknown,
				Partial<User>
			>,
			{ status: mockStatus, json: mockJSON } as unknown as Response
		);

		expect(mockStatus).toHaveBeenCalledWith(StatusCode.INTERNAL_SERVER_ERROR);
	});
});
