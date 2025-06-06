#!/bin/bash

# Exit on error
set -e

echo "Running database migrations..."
bunx prisma migrate deploy

echo "Migrations completed successfully!"
