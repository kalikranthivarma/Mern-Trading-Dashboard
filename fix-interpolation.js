const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = '';
  let inTemplate = false;
  
  for (let i = 0; i < content.length; i++) {
    // Toggle template literal state
    if (content[i] === '`' && (i === 0 || content[i-1] !== '\\')) {
      inTemplate = !inTemplate;
    }
    
    // Check for ₹{
    if (content[i] === '₹' && content[i+1] === '{') {
      if (inTemplate) {
        newContent += '$';
      } else {
        newContent += '₹';
      }
    } else {
      newContent += content[i];
    }
  }

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed:', filePath);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

traverse(path.join(__dirname, 'frontend/src'));
console.log('Done!');
