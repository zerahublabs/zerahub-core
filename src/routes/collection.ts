import { PrismaClient } from "@/generated/prisma";
import { Hono } from "hono";

const prisma = new PrismaClient();

const app = new Hono();

app.get("/", async (c) => {
	const page = Number(c.req.query("page") || 1);
	const limit = Number(c.req.query("limit") || 10);
	const skip = (page - 1) * limit;

	const collections = await prisma.collection.findMany({
		skip,
		take: limit,
		orderBy: {
			createdAt: "desc",
		},
		include: {
			user: {
				select: {
					id: true,
					address: true,
				},
			},
			coverStorage: {
				select: {
					id: true,
					filename: true,
					createdAt: true,
				},
			},
		},
	});
	const data = collections.map((d) => ({
		id: d.id,
		title: d.title,
		description: d.description,
		cover: d.coverStorage,
		price: d.price,
		createdAt: d.createdAt,
		publisher: d.user.address,
	}));

	return c.json({
		status: "ok",
		page: page,
		total: collections.length,
		data: data,
	});
});

app.get("/:collectionId", async (c) => {
	const collectionId = c.req.param("collectionId");

	try {
		const collection = await prisma.collection.findFirst({
			where: {
				id: collectionId,
			},
			omit: {
				cover: true,
				deletedAt: true,
			},
			include: {
				coverStorage: {
					select: {
						id: true,
						filename: true,
						createdAt: true,
					},
				},
				user: {
					select: {
						id: true,
						address: true,
					},
				},
			},
		});

		const collectionData = {
			id: collection?.id,
			title: collection?.title,
			description: collection?.description,
			cover: collection?.coverStorage,
			price: collection?.price,
			createdAt: collection?.createdAt,
			status: collection?.status,
			transactionHash: collection?.transactionHash,
			publisher: collection?.user?.address,
		};

		return c.json({
			status: "ok",
			data: collectionData,
		});
	} catch (e) {
		if (e instanceof Error) {
			console.error(e);
			return c.json({
				status: "fail",
				message: e.message,
			});
		}
		return c.json({
			status: "fail",
			message: "internal server error",
		});
	}
});

export default app;
