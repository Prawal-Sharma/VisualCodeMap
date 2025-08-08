#!/bin/bash

echo "📦 Creating VSIX package for Visual Code Map..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Clean up any previous attempts
rm -rf vsix-temp
rm -f visual-code-map-*.vsix

# Create temp directory
echo "📁 Creating package directory..."
mkdir -p vsix-temp

# Copy extension files
echo "📋 Copying extension files..."
cp -r dist vsix-temp/
cp -r resources vsix-temp/
cp package.json vsix-temp/
cp README.md vsix-temp/
cp CHANGELOG.md vsix-temp/
cp LICENSE vsix-temp/

# Create src/webview structure for the JavaScript files
mkdir -p vsix-temp/src/webview/styles
cp src/webview/graph.js vsix-temp/src/webview/
cp src/webview/styles/main.css vsix-temp/src/webview/styles/

# Copy node_modules for D3 (required for webview)
echo "📊 Copying D3.js dependency..."
mkdir -p vsix-temp/node_modules/d3/dist
cp node_modules/d3/dist/d3.min.js vsix-temp/node_modules/d3/dist/

# Create the VSIX (it's just a renamed ZIP)
echo "🗜️  Creating VSIX archive..."
cd vsix-temp
zip -q -r ../visual-code-map-0.1.0.vsix .
cd ..

# Clean up
echo "🧹 Cleaning up..."
rm -rf vsix-temp

# Check if successful
if [ -f "visual-code-map-0.1.0.vsix" ]; then
    SIZE=$(du -h visual-code-map-0.1.0.vsix | cut -f1)
    echo ""
    echo -e "${GREEN}✅ SUCCESS!${NC}"
    echo -e "${BLUE}📦 Package created: visual-code-map-0.1.0.vsix (${SIZE})${NC}"
    echo ""
    echo "📤 Next steps:"
    echo "1. Go to https://marketplace.visualstudio.com/manage"
    echo "2. Sign in and create/select your publisher"
    echo "3. Click 'New Extension' → 'Upload'"
    echo "4. Select the file: visual-code-map-0.1.0.vsix"
    echo ""
    echo "🎉 Your extension will be live in minutes!"
else
    echo ""
    echo "❌ Error: Failed to create VSIX package"
    exit 1
fi