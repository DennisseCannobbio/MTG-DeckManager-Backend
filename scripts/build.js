#!/usr/bin/env node

/**
 * Build script that handles TypeScript compilation and path alias resolution
 * This script replaces the path aliases with relative paths for production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Building MTG Deck Manager API...');

try {
  // Step 1: Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    execSync('rimraf dist', { stdio: 'inherit' });
  }

  // Step 2: Compile TypeScript
  console.log('📦 Compiling TypeScript...');
  execSync('tsc', { stdio: 'inherit' });

  // Step 3: Replace path aliases in compiled JS files
  console.log('🔄 Resolving path aliases...');
  replacePathAliases('./dist');

  // Step 4: Copy package.json for production
  console.log('📋 Copying package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Create production package.json (only dependencies, no devDependencies)
  const prodPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    main: packageJson.main,
    scripts: {
      start: packageJson.scripts.start || 'node main.js'
    },
    dependencies: packageJson.dependencies,
    keywords: packageJson.keywords,
    author: packageJson.author,
    license: packageJson.license
  };

  fs.writeFileSync('./dist/package.json', JSON.stringify(prodPackageJson, null, 2));

  // Step 5: Copy .env.example as reference
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', './dist/.env.example');
  }

  console.log('✅ Build completed successfully!');
  console.log('');
  console.log('📁 Production files are in ./dist');
  console.log('🚀 To run production build:');
  console.log('   cd dist && npm install --production && npm start');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

/**
 * Replace TypeScript path aliases with relative paths in compiled JS files
 */
function replacePathAliases(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      replacePathAliases(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace path aliases with relative paths
      content = content.replace(/require\("@domain\//g, 'require("../domain/');
      content = content.replace(/require\("@application\//g, 'require("../application/');
      content = content.replace(/require\("@infrastructure\//g, 'require("../infrastructure/');
      content = content.replace(/require\("@presentation\//g, 'require("../presentation/');
      content = content.replace(/require\("@shared\//g, 'require("../shared/');
      
      // Handle different directory levels
      const depth = filePath.split(path.sep).length - 2; // -2 for dist and filename
      const relativePath = '../'.repeat(depth);
      
      if (depth > 1) {
        content = content.replace(/require\("\.\.\//g, `require("${relativePath}`);
      }
      
      fs.writeFileSync(filePath, content);
    }
  }
}