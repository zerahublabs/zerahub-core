import { SiweMessage } from "siwe";
import { mnemonicToAccount } from "viem/accounts";
import { describe, beforeEach, it } from "vitest";
import auth from "../auth";
import collection from "./collection";

const mnemonic = "test test test test test test test test test test test junk";

describe("Profile", () => {
    let access_token = "";
    const account_1 = mnemonicToAccount(mnemonic, {
        accountIndex: 1,
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

    it("should return collection data", async () => {
        const response = await collection.request("/", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
        });

        const json = await response.json();
        console.log(json);
    });
});
