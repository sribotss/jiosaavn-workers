#!/bin/bash

# JioSaavnAPI Cloudflare Workers Deployment Script

echo "🚀 Deploying JioSaavnAPI to Cloudflare Workers..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in
echo "🔍 Checking authentication..."
wrangler whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "🔐 Not logged in. Please login to Cloudflare..."
    wrangler login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Try different configuration approaches
echo "🔧 Attempting deployment..."

# Try with simple config first
echo "📋 Trying simple configuration..."
cp wrangler-simple.toml wrangler.toml
wrangler deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful with simple configuration!"
    echo "🌐 Your worker is deployed at: https://jiosaavn-api.your-subdomain.workers.dev"
else
    echo "⚠️  Simple configuration failed, trying full configuration..."
    cp wrangler.toml.backup wrangler.toml 2>/dev/null || cp wrangler-full.toml wrangler.toml 2>/dev/null || true
    wrangler deploy
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful with full configuration!"
        echo "🌐 Your worker is deployed at: https://jiosaavn-api.your-subdomain.workers.dev"
    else
        echo "❌ Deployment failed. Trying with JSON configuration..."
        wrangler deploy --config wrangler.jsonc
        
        if [ $? -eq 0 ]; then
            echo "✅ Deployment successful with JSON configuration!"
            echo "🌐 Your worker is deployed at: https://jiosaavn-api.your-subdomain.workers.dev"
        else
            echo "❌ All deployment attempts failed."
            echo "🔍 Please check the error messages above and ensure:"
            echo "   - You are logged in to Cloudflare (wrangler login)"
            echo "   - Your Cloudflare account is in good standing"
            echo "   - The worker name 'jiosaavn-api' is available"
            echo "   - You have sufficient permissions"
            exit 1
        fi
    fi
fi

echo "🎉 Deployment complete!"
echo "📖 Test your API with: curl https://jiosaavn-api.your-subdomain.workers.dev/result/?query=alone"