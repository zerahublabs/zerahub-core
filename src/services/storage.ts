import {
    STORAGE_ACCESS_KEY,
    STORAGE_ENDPOINT,
    STORAGE_SECRET_KEY,
} from "@/config/storage";
import { randomBytes } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SHA256 } from "bun";

export default class Storage {
    public client: S3Client;

    constructor() {
        this.client = new S3Client({
            endpoint: STORAGE_ENDPOINT,
            credentials: {
                accessKeyId: STORAGE_ACCESS_KEY,
                secretAccessKey: STORAGE_SECRET_KEY,
            },
            forcePathStyle: true,
        });
    }

    private generateRandomKey(): string {
        const timestamp = Date.now();
        const randomString = new SHA256().update(randomBytes(32)).digest();
        return `${timestamp}-${randomString}`;
    }

    async createPreSignedUrl(type: string, bucket: string) {
        const key = this.generateRandomKey();
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: type,
        });

        const signedUrl = await getSignedUrl(this.client, command, {
            expiresIn: 3600,
        });
        return {
            key,
            signedUrl,
        };
    }
}
