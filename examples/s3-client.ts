import { readFile } from "node:fs/promises";
import { S3Client } from "bun";
import {
	STORAGE_ACCESS_KEY,
	STORAGE_BUCKET,
	STORAGE_ENDPOINT,
	STORAGE_SECRET_KEY,
} from "../src/config/storage";

const s3Client = new S3Client({
	accessKeyId: STORAGE_ACCESS_KEY,
	secretAccessKey: STORAGE_SECRET_KEY,
	endpoint: STORAGE_ENDPOINT,
	bucket: STORAGE_BUCKET,
});

async function uploadFile() {
	const file = s3Client.file("test/cover.png");
	const buffer = await readFile("./examples/cover.png");
	await file.write(buffer);
	console.log("File uploaded successfully");
}

uploadFile().catch(console.error);
