import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { readFile } from "node:fs/promises";

const STORAGE_ENDPOINT = "http://localhost:9000";
const STORAGE_ACCESS_KEY = "root";
const STORAGE_SECRET_KEY = "rootpassword";

const client = new S3Client({
	endpoint: STORAGE_ENDPOINT,
	region: "us-east-1",
	credentials: {
		accessKeyId: STORAGE_ACCESS_KEY,
		secretAccessKey: STORAGE_SECRET_KEY,
	},
	forcePathStyle: true,
});

const command = new PutObjectCommand({
	Bucket: "zerahub-covers",
	Key: "randomtest.png",
});

const url = await getSignedUrl(client, command, {
	expiresIn: 3600,
});

console.log(url);
// const fileToUpload = await readFile("cover.png")

// const response = await fetch(url, {
//     method: 'put',
//     body: fileToUpload,
//     headers: {
//         "Content-Length": fileToUpload.byteLength.toString()
//     }
// })

// console.log(await response.text())
