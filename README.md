# ZeraHub Core API

A high-performance web API built with Bun and Hono.

## Prerequisites

- [Bun](https://bun.sh/) runtime installed
- Docker (optional, for containerized deployment)

## Development

1. Install dependencies:
```bash
bun install
```

2. Start the development server:
```bash
bun run dev
```

The server will start on http://localhost:3000 with hot reloading enabled.

## Production Build

1. Build the application:
```bash
bun run build
```

2. Start the production server:
```bash
bun run start
```

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t zerahub-api .
```

2. Run the container:
```bash
docker run -p 3000:3000 zerahub-api
```

## API Endpoints

- `GET /`: Welcome message and API version
- `GET /health`: Health check endpoint

## Environment Variables

- `PORT`: Server port (default: 3000)

# Aliases path
```
The aliases I've set up are:
@/* - Root of src directory
@components/* - React/UI components
@routes/* - API routes
@models/* - Database models/schemas
@config/* - Configuration files
@utils/* - Utility functions
@services/* - Business logic/services
@middlewares/* - Middleware functions
@types/* - TypeScript type definitions
```

# Technology
- Runtime: Bun
- Scripting: TypeScript
- Database: PostgreSQL
- ORM: PrismaJS
- Object Storage: Minio S3 Compatible
- Unit Testing: Vitest
- Linter & Formatter: Biome
- Deployment: docker
- Authentication: SIWE & JWT Compatible
