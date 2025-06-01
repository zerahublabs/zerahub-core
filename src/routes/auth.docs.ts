import { describeRoute } from "hono-openapi";

export const authLogin = describeRoute({
	description:
		"Authenticate user with Ethereum wallet using SIWE (Sign-In with Ethereum)",
	tags: ["Authentication"],
	requestBody: {
		description: "SIWE authentication payload",
		required: true,
		content: {
			"application/json": {
				schema: {
					type: "object",
					required: ["signature", "message"],
					properties: {
						signature: {
							type: "string",
							description: "Ethereum signature of the SIWE message",
						},
						message: {
							type: "string",
							description: "Formatted SIWE message that was signed",
						},
					},
				},
			},
		},
	},
	responses: {
		200: {
			description: "Successfully authenticated",
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							status: {
								type: "string",
								enum: ["ok"],
							},
							data: {
								type: "object",
								properties: {
									user: {
										type: "object",
										properties: {
											id: { type: "string" },
											username: { type: "string" },
											address: { type: "string" },
											createdAt: {
												type: "string",
												format: "date-time",
											},
											updatedAt: {
												type: "string",
												format: "date-time",
											},
										},
									},
									access_token: {
										type: "string",
										description: "JWT token for authenticated requests",
									},
								},
							},
						},
					},
				},
			},
		},
		400: {
			description: "Invalid signature or message",
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							status: {
								type: "string",
								enum: ["error"],
							},
							message: {
								type: "string",
							},
						},
					},
				},
			},
		},
	},
});

export const authInit = describeRoute({
	description: "Get a new nonce for SIWE authentication",
	tags: ["Authentication"],
	responses: {
		200: {
			description: "Successfully generated nonce",
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							status: {
								type: "string",
								enum: ["ok"],
							},
							data: {
								type: "object",
								properties: {
									nonce: {
										type: "string",
										description: "Random nonce to be used in SIWE message",
									},
								},
							},
						},
					},
				},
			},
		},
	},
});
