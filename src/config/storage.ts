export const STORAGE_BUCKET = process.env.STORAGE_BUCKET || "zerahub-storage";
export const STORAGE_ENDPOINT =
	process.env.STORAGE_ENDPOINT || "http://localhost:9000";
export const STORAGE_ACCESS_KEY =
	process.env.STORAGE_ACCESS_KEY || "minioadmin";
export const STORAGE_SECRET_KEY =
	process.env.STORAGE_SECRET_KEY || "minioadmin";

export const STORAGE_CONFIG = {
	bucket: STORAGE_BUCKET,
	endpoint: STORAGE_ENDPOINT,
	accessKey: STORAGE_ACCESS_KEY,
	secretKey: STORAGE_SECRET_KEY,
};
