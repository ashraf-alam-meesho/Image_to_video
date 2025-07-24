import { TemplateRenderer } from './utils/template-renderer';
import { generateScreenshots } from './utils/screenshot-generator';
import path from 'path';
import fs from 'fs/promises';

async function generateCompleteHTMLAndScreenshots(image1: string, image2: string, image3: string, text1: string, text2: string, text3: string): Promise<void> {
    try {
        console.log('🎯 Starting HTML generation and screenshot process...');

        // Sample data for the template
        const Data = {
            image1: image1,
            text1: text1,
            
            image2: image2, 
            text2: text2,
            
            image3: image3,
            text3: text3};

        // Generate HTML from template
        console.log('📝 Generating HTML from template...');
        const renderer = new TemplateRenderer();
        const htmlContent = renderer.renderTemplate(Data);

        // Save the generated HTML to a file
        const outputHtmlPath = path.join(process.cwd(), 'generated-product-pages.html');
        await fs.writeFile(outputHtmlPath, htmlContent, 'utf8');
        console.log(`✅ HTML file generated: ${outputHtmlPath}`);

        // Create images directory
        const imagesDir = path.join(process.cwd(), 'images');
        
        // Take screenshots
        console.log('📸 Taking screenshots...');
        await generateScreenshots(outputHtmlPath, imagesDir);

        console.log('🎉 Process completed successfully!');
        console.log(`📄 HTML file: ${outputHtmlPath}`);
        console.log(`📁 Screenshots: ${imagesDir}/`);
        
    } catch (error) {
        console.error('❌ Error during generation process:', error);
        process.exit(1);
    }
}

// // Run the script
// if (require.main === module) {
//     generateCompleteHTMLAndScreenshots();
// }

export { generateCompleteHTMLAndScreenshots }; 