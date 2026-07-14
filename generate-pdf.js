const fs = require('fs');
const { mdToPdf } = require('md-to-pdf');
const path = require('path');

const generatePdf = async () => {
  try {
    console.log("Reading markdown files...");
    const files = [
      'docs/01_Overview_and_Architecture.md',
      'docs/02_Database_and_API.md',
      'docs/03_Core_Modules.md',
      'docs/04_Security_and_Deployment.md',
      'docs/05_Interview_Questions.md'
    ];

    let combinedMarkdown = '';
    
    for (const file of files) {
      combinedMarkdown += fs.readFileSync(path.join(__dirname, file), 'utf-8');
      combinedMarkdown += '\n\n<div class="page-break"></div>\n\n';
    }

    // Save combined markdown for reference
    fs.writeFileSync('Enterprise_Documentation.md', combinedMarkdown);

    console.log("Generating PDF (this might take a minute)...");
    
    const pdf = await mdToPdf(
      { content: combinedMarkdown }, 
      { 
        dest: 'Enterprise_Documentation.pdf',
        pdf_options: { format: 'A4', margin: '20mm' },
        css: `
          body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; }
          h1, h2, h3 { color: #1a202c; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
          .page-break { page-break-after: always; }
          pre { background-color: #f7fafc; padding: 1rem; border-radius: 0.5rem; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
          th, td { border: 1px solid #cbd5e0; padding: 0.5rem; text-align: left; }
          th { background-color: #edf2f7; }
        `
      }
    );

    if (pdf) {
      console.log('Successfully generated Enterprise_Documentation.pdf!');
    }
  } catch (err) {
    console.error('Error generating PDF:', err);
  }
};

generatePdf();
