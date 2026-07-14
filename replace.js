const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace literal $ before a template literal variable: $${  => ₹${
      let newContent = content.replace(/\$\$\{/g, '₹${');
      
      // Replace literal $ before numbers: $182.50 => ₹182.50
      newContent = newContent.replace(/\$(\d)/g, '₹$1');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Updated', fullPath);
      }
    }
  }
}
processDir('frontend/src');
