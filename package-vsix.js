#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('📦 Creating VS Code VSIX package...\n');

// Create output stream
const output = fs.createWriteStream('visual-code-map-0.1.0.vsix');
const archive = archiver('zip', {
    zlib: { level: 9 }
});

// Handle errors
archive.on('error', (err) => {
    throw err;
});

// Listen for completion
output.on('close', () => {
    const size = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`\n✅ VSIX package created successfully!`);
    console.log(`📦 File: visual-code-map-0.1.0.vsix (${size} MB)`);
    console.log('\n🚀 Ready to upload to VS Code Marketplace!');
});

// Pipe archive to output
archive.pipe(output);

// Add extension files
console.log('Adding extension files...');

// Add main files
archive.file('package.json', { name: 'extension/package.json' });
archive.file('README.md', { name: 'extension/README.md' });
archive.file('CHANGELOG.md', { name: 'extension/CHANGELOG.md' });
archive.file('LICENSE', { name: 'extension/LICENSE' });

// Add dist folder
archive.directory('dist/', 'extension/dist');

// Add resources
archive.directory('resources/', 'extension/resources');

// Add webview files
archive.file('src/webview/graph.js', { name: 'extension/src/webview/graph.js' });
archive.directory('src/webview/styles/', 'extension/src/webview/styles');

// Add node_modules/d3
if (fs.existsSync('node_modules/d3/dist/d3.min.js')) {
    archive.file('node_modules/d3/dist/d3.min.js', { name: 'extension/node_modules/d3/dist/d3.min.js' });
}

// Create extension manifest
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const manifest = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011">
  <Metadata>
    <Identity Language="en-US" Id="${packageJson.name}" Version="${packageJson.version}" Publisher="${packageJson.publisher}"/>
    <DisplayName>${packageJson.displayName}</DisplayName>
    <Description xml:space="preserve">${packageJson.description}</Description>
    <Tags>Programming Languages,Other</Tags>
    <Categories>Programming Languages,Other</Categories>
    <GalleryFlags>Public</GalleryFlags>
    <Badges></Badges>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="^1.74.0" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionDependencies" Value="" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionPack" Value="" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="workspace" />
      <Property Id="Microsoft.VisualStudio.Code.LocalizedLanguages" Value="" />
      <Property Id="Microsoft.VisualStudio.Services.Links.Source" Value="https://github.com/Prawal-Sharma/VisualCodeMap.git" />
      <Property Id="Microsoft.VisualStudio.Services.Links.Getstarted" Value="https://github.com/Prawal-Sharma/VisualCodeMap.git" />
      <Property Id="Microsoft.VisualStudio.Services.Links.GitHub" Value="https://github.com/Prawal-Sharma/VisualCodeMap.git" />
      <Property Id="Microsoft.VisualStudio.Services.Links.Support" Value="https://github.com/Prawal-Sharma/VisualCodeMap/issues" />
      <Property Id="Microsoft.VisualStudio.Services.Links.Learn" Value="https://github.com/Prawal-Sharma/VisualCodeMap.git" />
      <Property Id="Microsoft.VisualStudio.Services.Branding.Color" Value="#2C2C32" />
      <Property Id="Microsoft.VisualStudio.Services.Branding.Theme" Value="dark" />
      <Property Id="Microsoft.VisualStudio.Services.GitHubFlavoredMarkdown" Value="true" />
    </Properties>
    <License>extension/LICENSE</License>
    <Icon>extension/resources/icon.svg</Icon>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Changelog" Path="extension/CHANGELOG.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="extension/LICENSE" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="extension/resources/icon.svg" Addressable="true" />
  </Assets>
</PackageManifest>`;

archive.append(manifest, { name: 'extension.vsixmanifest' });

// Create [Content_Types].xml
const contentTypes = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".json" ContentType="application/json"/>
  <Default Extension=".vsixmanifest" ContentType="text/xml"/>
  <Default Extension=".md" ContentType="text/markdown"/>
  <Default Extension=".js" ContentType="application/javascript"/>
  <Default Extension=".css" ContentType="text/css"/>
  <Default Extension=".svg" ContentType="image/svg+xml"/>
  <Default Extension=".png" ContentType="image/png"/>
  <Default Extension=".txt" ContentType="text/plain"/>
  <Default Extension=".ts" ContentType="application/typescript"/>
  <Default Extension=".tsx" ContentType="application/typescript"/>
  <Default Extension=".html" ContentType="text/html"/>
</Types>`;

archive.append(contentTypes, { name: '[Content_Types].xml' });

// Finalize the archive
console.log('Finalizing package...');
archive.finalize();