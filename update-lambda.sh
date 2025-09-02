#!/bin/bash

# Update Lambda function with improved email formatting

set -e

echo "🔧 Updating Lambda function with improved formatting..."

# Create temporary directory for Lambda package
mkdir -p lambda-update
cd lambda-update

# Copy improved files
cp ../improved-email-forwarder.js index.js
cp ../lambda-package.json package.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create deployment package
echo "📦 Creating deployment package..."
zip -r ../lambda-improved.zip .

cd ..
rm -rf lambda-update

echo "🚀 Updating Lambda function..."
aws lambda update-function-code \
    --function-name SESEmailForwarder \
    --zip-file fileb://lambda-improved.zip \
    --region us-east-1

echo "✅ Lambda function updated successfully!"

# Clean up
rm lambda-improved.zip

echo "🎉 Email forwarding will now be much cleaner and more readable!"