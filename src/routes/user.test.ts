import { SiweMessage } from "siwe";
import { mnemonicToAccount } from "viem/accounts";
import { describe, beforeEach, it, expect } from "vitest";
import auth from "./auth";
import app from "./user";

const mnemonic = "test test test test test test test test test test test junk";

describe("Profile", () => {
	let access_token = "";
	const account_1 = mnemonicToAccount(mnemonic, {
		accountIndex: 0,
	});

	beforeEach(async () => {
		const initAuthResponse = await auth.request("/init", {
			headers: {
				"Content-Type": "application/json",
			},
		});
		const initAuthJson = await initAuthResponse.json();

		const siwe = new SiweMessage({
			address: account_1.address,
			chainId: 1,
			domain: "localhost",
			nonce: initAuthJson.data.nonce,
			statement: "Sign in with Ethereum to the app.",
			uri: "http://localhost",
			version: "1",
		});

		const message = siwe.prepareMessage();

		const signature = await account_1.signMessage({
			message: message,
		});

		const response = await auth.request("/", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				signature,
				message,
			}),
		});

		const json = await response.json();

		access_token = json.data.access_token;
	});

	it("should return valid profile data", async () => {
		const response = await app.request("/me", {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${access_token}`,
			},
		});

		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json).toHaveProperty("status");
		expect(json).toHaveProperty("data");
		expect(json.status).toBe("ok");
		expect(json.data).toHaveProperty("id");
		expect(json.data).toHaveProperty("username");
		expect(json.data).toHaveProperty("address");
		expect(json.data).toHaveProperty("createdAt");
		expect(json.data).toHaveProperty("updatedAt");
	});

	it("should return 401 with invalid token", async () => {
		const response = await app.request("/me", {
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer invalid_token",
			},
		});

		expect(response.status).toBe(401);
	});

	it("should return 401 without authorization header", async () => {
		const response = await app.request("/me", {
			headers: {
				"Content-Type": "application/json",
			},
		});

		expect(response.status).toBe(401);
	});

	describe("Username Update", () => {
		it("should successfully update username", async () => {
			const newUsername = "zerahub-account-test";
			const response = await app.request("/username", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${access_token}`,
				},
				body: JSON.stringify({
					username: newUsername,
				}),
			});

			const json = await response.json();

			expect(response.status).toBe(200);
			expect(json).toHaveProperty("status");
			expect(json.status).toBe("ok");
			expect(json.data).toHaveProperty("username");
			expect(json.data.username).toBe(newUsername);
		});

		it("should return 400 with invalid username format", async () => {
			const response = await app.request("/username", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${access_token}`,
				},
				body: JSON.stringify({
					username: "",
				}),
			});

			const json = await response.json();

			expect(response.status).toBe(400);
			expect(json).toHaveProperty("message");
			expect(json.message).toBe("Validation failed");
		});
	});
});
