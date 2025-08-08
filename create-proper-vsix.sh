#!/bin/bash

echo "📦 Creating proper VSIX package for VS Code..."
echo ""

# Clean up
rm -rf vsix-package
rm -f visual-code-map-*.vsix

# Create package directory
mkdir -p vsix-package/extension

# Copy all extension files to extension subfolder
echo "📋 Copying extension files..."
cp -r dist vsix-package/extension/
cp -r resources vsix-package/extension/
cp package.json vsix-package/extension/
cp README.md vsix-package/extension/
cp CHANGELOG.md vsix-package/extension/
cp LICENSE vsix-package/extension/

# Create src structure
mkdir -p vsix-package/extension/src/webview/styles
cp src/webview/graph.js vsix-package/extension/src/webview/
cp src/webview/styles/main.css vsix-package/extension/src/webview/styles/

# Copy D3
mkdir -p vsix-package/extension/node_modules/d3/dist
cp node_modules/d3/dist/d3.min.js vsix-package/extension/node_modules/d3/dist/

# Copy manifest to root
cp extension.vsixmanifest vsix-package/extension.vsixmanifest

# Add [Content_Types].xml
cat > vsix-package/\[Content_Types\].xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".json" ContentType="application/json"/>
  <Default Extension=".vsixmanifest" ContentType="text/xml"/>
  <Default Extension=".md" ContentType="text/markdown"/>
  <Default Extension=".js" ContentType="application/javascript"/>
  <Default Extension=".css" ContentType="text/css"/>
  <Default Extension=".svg" ContentType="image/svg+xml"/>
  <Default Extension=".png" ContentType="image/png"/>
  <Default Extension=".txt" ContentType="text/plain"/>
</Types>
EOF

# Create VSIX
echo "🗜️  Creating VSIX archive..."
cd vsix-package
zip -q -r ../visual-code-map-0.1.0.vsix .
cd ..

# Clean up
rm -rf vsix-package

echo ""
echo "✅ VSIX package created: visual-code-map-0.1.0.vsix"
echo ""
echo "Try uploading this version!"