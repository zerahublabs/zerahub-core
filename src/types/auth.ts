export type WalletType = `0x${string}`;

export interface User {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
}

export interface RegisterResponse {
	success: boolean;
	message: string;
	user?: Pick<User, "email" | "name">;
	errors?: Array<{
		code: string;
		message: string;
		path: string[];
	}>;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	success: boolean;
	message: string;
	token?: string;
	user?: Pick<User, "email" | "name">;
	errors?: Array<{
		code: string;
		message: string;
	}>;
}
