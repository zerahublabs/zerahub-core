import { describeRoute } from "hono-openapi";

export const getProfile = describeRoute({
	description: "Get the authenticated user's profile",
	tags: ["User"],
	security: [{ bearerAuth: [] }],
	responses: {
		200: {
			description: "Successfully retrieved user profile",
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
						},
					},
				},
			},
		},
		401: {
			description: "Unauthorized - Invalid or missing token",
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							message: {
								type: "string",
								example: "Unauthorized",
							},
						},
					},
				},
			},
		},
	},
});

export const updateUsername = describeRoute({
	description: "Update the authenticated user's username",
	tags: ["User"],
	security: [{ bearerAuth: [] }],
	requestBody: {
		description: "New username",
		required: true,
		content: {
			"application/json": {
				schema: {
					type: "object",
					required: ["username"],
					properties: {
						username: {
							type: "string",
							description: "The new username to set",
							minLength: 1,
						},
					},
				},
			},
		},
	},
	responses: {
		200: {
			description: "Successfully updated username",
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
									username: {
										type: "string",
										description: "The updated username",
									},
								},
							},
						},
					},
				},
			},
		},
		400: {
			description: "Invalid username format",
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							message: {
								type: "string",
								example: "Invalid username format",
							},
						},
					},
				},
			},
		},
		401: {
			description: "Unauthorized - Invalid or missing token",
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							message: {
								type: "string",
								example: "Unauthorized",
							},
						},
					},
				},
			},
		},
	},
});
