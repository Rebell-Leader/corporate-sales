#!/usr/bin/env bash

cd frontend

# Install dependencies
npm install

# Run production build
npm run build

# Start server
npm run start