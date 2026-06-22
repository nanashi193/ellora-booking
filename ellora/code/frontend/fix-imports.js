const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name.endsWith('.ts')) {
      fixImports(fullPath);
    }
  }
}

function fixImports(fullPath) {
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace imports like from '../../shared/components/button/button' to button.component
  // But we have to be careful to only target files we changed.
  const regex = /from\s+['"](.*?)(?:\.component)?['"]/g;
  let changed = false;
  
  let newContent = content.replace(regex, (match, importPath) => {
    if (importPath.includes('/shared/components/') || importPath.includes('/layouts/')) {
      const parts = importPath.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart && !lastPart.endsWith('.component') && !importPath.endsWith('.css') && !importPath.endsWith('.scss')) {
        return `from '${importPath}.component'`;
      }
    }
    return match;
  });
  
  if (newContent !== content) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
  }
}

processDirectory(path.join(__dirname, 'src/app'));
