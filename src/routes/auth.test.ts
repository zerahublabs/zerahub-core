import { describe, it, expect } from "vitest";
import app from "./auth";
import { mnemonicToAccount } from "viem/accounts";
import { SiweMessage } from "siwe";

const mnemonic = "test test test test test test test test test test test junk";

describe("Authentication", () => {
	let nonce = "";
	const account_1 = mnemonicToAccount(mnemonic, {
		accountIndex: 0,
	});

	it("should return correct initialization data", async () => {
		const response = await app.request("/init", {
			headers: {
				"Content-Type": "application/json",
			},
		});
		const json = await response.json();
		expect(response.status).toBe(200);
		expect(json).toHaveProperty("status");
		expect(json).toHaveProperty("data");
		expect(json.status).toBe("ok");
		expect(json.data).toHaveProperty("nonce");

		nonce = json.data.nonce;
	});

	it("should successfully authenticate with SIWE", async () => {
		const siwe = new SiweMessage({
			address: account_1.address,
			chainId: 1,
			domain: "localhost",
			nonce: nonce,
			statement: "Sign in with Ethereum to the app.",
			uri: "http://localhost",
			version: "1",
		});

		const message = siwe.prepareMessage();

		const signature = await account_1.signMessage({
			message: message,
		});

		const response = await app.request("/", {
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

		expect(response.status).toBe(200);
		expect(json).toHaveProperty("status");
		expect(json.status).toBe("ok");
		expect(json).toHaveProperty("data");
		expect(json.data).toHaveProperty("user");
		expect(json.data).toHaveProperty("access_token");
	});
});
