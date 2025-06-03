import {
	STORAGE_ACCESS_KEY,
	STORAGE_BUCKET,
	STORAGE_ENDPOINT,
	STORAGE_SECRET_KEY,
} from "@/config/storage";
import { S3Client } from "bun";
import type { PrismaClient } from "@/generated/prisma";
import { extname, join } from "node:path";
import { randomBytes } from "node:crypto";

export default class Storage {
	public client: S3Client;
	private prisma: PrismaClient;

	constructor(_prisma: PrismaClient) {
		this.client = new S3Client({
			accessKeyId: STORAGE_ACCESS_KEY,
			secretAccessKey: STORAGE_SECRET_KEY,
			endpoint: STORAGE_ENDPOINT,
			bucket: STORAGE_BUCKET,
		});
		this.prisma = _prisma;
	}

	private generateRandomFileName(originalName: string): string {
		const ext = extname(originalName);
		const timestamp = Date.now();
		const randomString = randomBytes(16).toString("hex");
		return `${timestamp}-${randomString}${ext}`;
	}

	private async saveFileMetadata(storageId: string, file: File) {
		return await this.prisma.storageMetadata.createMany({
			data: [
				{
					storageId,
					key: "file_size",
					value: file.size.toString(),
				},
				{
					storageId,
					key: "file_type",
					value: file.type,
				},
				{
					storageId,
					key: "file_name",
					value: file.name,
				},
				{
					storageId,
					key: "file_extension",
					value: extname(file.name),
				},
				{
					storageId,
					key: "file_last_modified",
					value: file.lastModified.toString(),
				},
			],
		});
	}

	async saveFileToDatabase(file: File, path: string) {
		const storageData = await this.prisma.storage.create({
			data: {
				filename: path,
				bucket: STORAGE_BUCKET,
			},
		});
		await this.saveFileMetadata(storageData.id, file);

		return storageData;
	}

	async uploadFile(file: File, path: string) {
		const randomFileName = this.generateRandomFileName(file.name);
		const fullPath = join(path, randomFileName);

		const s3File = this.client.file(fullPath);
		const arrayBuffer = await file.arrayBuffer();
		await s3File.write(arrayBuffer);

		return await this.saveFileToDatabase(file, fullPath);
	}

	async uploadLargeFile(file: File, path: string) {
		const randomFileName = this.generateRandomFileName(file.name);
		const fullPath = join(path, randomFileName);

		const s3File = this.client.file(fullPath);
		const writer = s3File.writer({
			retry: 3,
			queueSize: 10,
			partSize: 1024 * 1024 * 10,
		});

		const arrayBuffer = await file.arrayBuffer();
		writer.write(arrayBuffer);
		await writer.end();

		return await this.saveFileToDatabase(file, fullPath);
	}
}
