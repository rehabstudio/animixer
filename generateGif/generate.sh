#!/bin/bash

# NOTE: This scipt requires AE be open with the animxer scene loaded

ROOT_DIR="$HOME/animixer"

# Clear existing
echo "Clearing existing images"
rm -r $ROOT_DIR/*

# Generate image sequence in AE
echo "Generating image sequence with AE"
osascript generateImages.scpt

# Generate gifs and upload to cloud storage
source ./setup.sh
python generate_gifs.py
