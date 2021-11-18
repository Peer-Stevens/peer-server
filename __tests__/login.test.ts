import { getUserByEmailAndHash } from "../src/db/User/user";
import { login } from "../src/rest/login";
import { AuthenticationError } from "../src/types";
import { Request, Response } from "express";
import StatusCode from "../src/rest/status";

jest.mock("../src/db/User/user");
const mockGetBy = getUserByEmailAndHash as jest.MockedFunction<typeof getUserByEmailAndHash>;

describe("login endpoint tests", () => {
	it("returns a 404 status if the account is not found", async () => {
		mockGetBy.mockImplementation((username, hash) => {
			throw new AuthenticationError(
				`No user exists with the username ${username} and hash ${hash}`
			);
		});
		const mockSend = jest.fn();
		mockSend.mockImplementation(() => {
			return { send: mockSend, status: mockStatus };
		});
		const mockStatus = jest.fn();
		mockStatus.mockImplementation(() => {
			return { send: mockSend, status: mockStatus };
		});
		await login(
			{ body: { username: "sludge", hash: "acbdefabcdefabcded" } } as Request,
			{ send: mockSend, status: mockStatus } as unknown as Response
		);

		expect(mockSend).toHaveBeenCalledWith("Account not found");
		expect(mockStatus).toHaveBeenCalledWith(StatusCode.NOT_FOUND);
	});
	it("returns a token if the account is found", async () => {
		mockGetBy.mockResolvedValue({
			email: "julioisfred@onedrive.com",
			hash: "bd160cd097a48e6601402411225cefca8a15ec9ab4f817adf985bee5708a1bdc",
			isBlindMode: false,
			readsBraille: false,
			doesNotPreferHelp: true,
		});
		const mockSend = jest.fn();
		mockSend.mockImplementation(() => {
			return { send: mockSend, status: mockStatus };
		});
		const mockStatus = jest.fn();
		mockStatus.mockImplementation(() => {
			return { send: mockSend, status: mockStatus };
		});
		await login(
			{
				body: {
					email: "julioisfred@hotmail.com",
					hash: "bd160cd097a48e6601402411225cefca8a15ec9ab4f817adf985bee5708a1bdc",
				},
				app: {
					set: jest.fn(),
					get: jest.fn().mockReturnValue({}),
				},
			} as unknown as Request,
			{ send: mockSend, status: mockStatus } as unknown as Response
		);

		expect(mockSend).toHaveBeenCalled();
		expect(mockStatus).toHaveBeenCalledWith(StatusCode.OK);
	});
});
