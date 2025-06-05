import axios from "axios";
import fs from "node:fs";
import FormData from "form-data";
import { SiweMessage } from "siwe";
import { mnemonicToAccount } from "viem/accounts";

let access_token: string = "";
const mnemonic = "test test test test test test test test test test test junk";

const account_1 = mnemonicToAccount(mnemonic, {
    accountIndex: 0,
});

async function beforeRun() {
    const initAuthResponse = await fetch("http://localhost:3001/auths/init", {
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

    const response = await fetch("http://localhost:3001/auths", {
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
}

async function collectionDetails() {
    const response = await axios.get(
        `http://localhost:3001/collection/f8fc1466-dcd2-4d95-ac84-d59757cc79f5`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
            maxBodyLength: Infinity,
        }
    );
    console.log(response.data);
}

await beforeRun();
await collectionDetails();
