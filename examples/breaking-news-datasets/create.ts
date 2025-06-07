import axios from "axios";
import fs from "node:fs";
import FormData from "form-data";
import { SiweMessage } from "siwe";
import { mnemonicToAccount } from "viem/accounts";

let access_token: string = "";
const mnemonic = "test test test test test test test test test test test junk";

const account_1 = mnemonicToAccount(mnemonic, {
	accountIndex: 3,
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

async function createCollection() {
	try {
		const response = await fetch(`http://localhost:3001/collection`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
			body: JSON.stringify({
				title: "Real or Fake Datasets",
				description:
					"In the digital age, misinformation spreads faster than ever. To combat this challenge, i present a robust dataset crafted for the development and evaluation of machine learning models that can distinguish between real and fake news.",
				price: 0,
			}),
		});
		console.log(response);
		const res = await response.json();
		console.log(res);
		return res;
	} catch (error) {
		console.log(error);
		return {};
	}
}

async function uploadCover(collection: { id: string }) {
	const form = new FormData();
	const file = fs.createReadStream("./cover.jpg");
	form.append("file", file);

	try {
		const response = await axios.post(
			`http://localhost:3001/collection/${collection["id"]}/cover`,
			form,
			{
				headers: {
					...form.getHeaders(),
					Authorization: `Bearer ${access_token}`,
				},
				maxBodyLength: Infinity,
			},
		);
		console.log(response.data);
	} catch (err) {
		console.error("Upload error:", err.response?.data || err.message);
	}
}

await beforeRun();
const collection = await createCollection();
await uploadCover(collection["data"]);
