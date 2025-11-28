#!/bin/bash

output="all_code_files.txt"
> "$output"  # clear the file before writing

# find all matching files
find . -type f \( \
    -name "*.py" -o \
    -name "*.R" -o \
    -name "*.r" -o \
    -name "Dockerfile*" -o \
    -name "*.yml" -o \
    -name "*.html" -o \
    -name "*.css" -o \
    -name "*.config" \
\) | while read -r f; do
    echo "=== $f ===" >> "$output"
    cat "$f" >> "$output"
    echo -e "\n" >> "$output"
done
