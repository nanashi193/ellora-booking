const fs = require('fs');
const path = require('path');

const baseDirs = [
  'src/app/shared/components',
  'src/app/layouts',
  'src/app/features'
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'auth') {
        processDirectory(fullPath);
      }
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      processFile(fullPath, dir, entry.name);
    }
  }
}

function processFile(fullPath, dir, fileName) {
  let content = fs.readFileSync(fullPath, 'utf8');
  if (!content.includes('@Component')) return;
  
  // Extract template
  const templateMatch = content.match(/template:\s*`([\s\S]*?)`/);
  
  const baseName = fileName.replace(/\.ts$/, '');
  const newBaseName = baseName.endsWith('.component') ? baseName : `${baseName}.component`;
  
  if (templateMatch) {
    const templateContent = templateMatch[1].trim();
    
    // Write html
    fs.writeFileSync(path.join(dir, `${newBaseName}.html`), templateContent, 'utf8');
    
    // Write scss (empty)
    fs.writeFileSync(path.join(dir, `${newBaseName}.scss`), '', 'utf8');
    
    // Replace in ts
    content = content.replace(/template:\s*`[\s\S]*?`/, `templateUrl: './${newBaseName}.html',\n  styleUrl: './${newBaseName}.scss'`);
    
    // Remove inline styles if present
    content = content.replace(/,\s*styles:\s*`[\s\S]*?`/, '');
  }
  
  // Rename file
  if (fileName !== `${newBaseName}.ts`) {
    fs.unlinkSync(fullPath);
    fs.writeFileSync(path.join(dir, `${newBaseName}.ts`), content, 'utf8');
  } else {
    fs.writeFileSync(fullPath, content, 'utf8');
  }
}

for (const dir of baseDirs) {
  processDirectory(path.join(__dirname, dir));
}

// Update routes
const routesPath = path.join(__dirname, 'src/app/app.routes.ts');
if (fs.existsSync(routesPath)) {
  let routesContent = fs.readFileSync(routesPath, 'utf8');
  routesContent = routesContent.replace(/import\('\.\/layouts\/main-layout\/main-layout'\)/g, "import('./layouts/main-layout/main-layout.component')");
  routesContent = routesContent.replace(/import\('\.\/features\/home\/home'\)/g, "import('./features/home/home.component')");
  routesContent = routesContent.replace(/import\('\.\/features\/search\/search'\)/g, "import('./features/search/search.component')");
  routesContent = routesContent.replace(/import\('\.\/features\/salon-details\/salon-details'\)/g, "import('./features/salon-details/salon-details.component')");
  fs.writeFileSync(routesPath, routesContent, 'utf8');
}
