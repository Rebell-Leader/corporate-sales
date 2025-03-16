#!/usr/bin/env bash

# Load env vars from .env file
export $(grep -v '^#' .env | xargs)

# Install requirements
pip install -r requirements.txt

# Start app
python code/app.py