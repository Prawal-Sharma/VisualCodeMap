#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Creating VSIX package for Visual Code Map...\n');

// Build the extension first
console.log('🔨 Building extension...');
try {
    execSync('npm run compile', { stdio: 'inherit' });
    console.log('✅ Build successful\n');
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}

// Create a package info file
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;
const name = packageJson.name;

console.log(`📋 Package Information:`);
console.log(`   Name: ${name}`);
console.log(`   Version: ${version}`);
console.log(`   Publisher: ${packageJson.publisher}`);
console.log(`   Display Name: ${packageJson.displayName}\n`);

// Check required files exist
const requiredFiles = [
    'dist/extension.js',
    'package.json',
    'README.md',
    'LICENSE',
    'CHANGELOG.md'
];

console.log('🔍 Checking required files...');
let allFilesExist = true;
for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} - MISSING`);
        allFilesExist = false;
    }
}

if (!allFilesExist) {
    console.error('\n❌ Some required files are missing. Build cannot continue.');
    process.exit(1);
}

console.log('\n✅ All required files present');

// Create package summary
const summary = {
    name: name,
    displayName: packageJson.displayName,
    version: version,
    publisher: packageJson.publisher,
    description: packageJson.description,
    categories: packageJson.categories,
    keywords: packageJson.keywords,
    engines: packageJson.engines,
    activationEvents: packageJson.activationEvents,
    contributes: packageJson.contributes,
    main: packageJson.main,
    icon: packageJson.icon,
    repository: packageJson.repository,
    license: packageJson.license,
    files: [
        'dist/**/*',
        'src/webview/graph.js',
        'src/webview/styles/main.css',
        'resources/**/*',
        'package.json',
        'README.md',
        'LICENSE',
        'CHANGELOG.md'
    ]
};

// Write package summary
fs.writeFileSync('package-summary.json', JSON.stringify(summary, null, 2));
console.log('\n📄 Package summary created: package-summary.json');

console.log('\n🎉 Package preparation complete!');
console.log('\n📦 To create VSIX file:');
console.log('   1. Install vsce globally: npm install -g @vscode/vsce');
console.log('   2. Run: vsce package');
console.log('\n🚀 To publish:');
console.log('   1. Create publisher account at https://marketplace.visualstudio.com');
console.log('   2. Get Personal Access Token from Azure DevOps');
console.log('   3. Run: vsce login <publisher-name>');
console.log('   4. Run: vsce publish');
console.log('\n📖 For more info: https://code.visualstudio.com/api/working-with-extensions/publishing-extension');