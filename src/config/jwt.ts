export const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
export const JWT_EXPIRES = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 days
