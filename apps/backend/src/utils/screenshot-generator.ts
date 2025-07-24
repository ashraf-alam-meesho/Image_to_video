import { chromium, Browser, Page } from 'playwright';
import path from 'path';
import fs from 'fs/promises';

export class ScreenshotGenerator {
    private browser: Browser | null = null;

    /**
     * Initialize the browser in headless mode
     */
    async init(): Promise<void> {
        this.browser = await chromium.launch({
            headless: true, // Run in headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    /**
     * Take screenshots of the HTML file
     * @param htmlFilePath - Path to the HTML file
     * @param outputDir - Directory to save screenshots (default: 'images')
     */
    async takeScreenshots(htmlFilePath: string, outputDir: string = 'images'): Promise<void> {
        if (!this.browser) {
            throw new Error('Browser not initialized. Call init() first.');
        }

        // Ensure output directory exists
        await this.ensureDirectoryExists(outputDir);

        const page = await this.browser.newPage();
        
        try {
            // Set viewport size for consistent screenshots
            await page.setViewportSize({ width: 1200, height: 800 });

            // Get absolute path to HTML file
            const absoluteHtmlPath = path.resolve(htmlFilePath);
            const fileUrl = `file://${absoluteHtmlPath}`;

            // Load the HTML file
            await page.goto(fileUrl, { waitUntil: 'networkidle' });

            // Wait a bit for any animations or loading
            await page.waitForTimeout(1000);

            // Take full page screenshot
            const fullPagePath = path.join(outputDir, 'full-page.png');
            await page.screenshot({
                path: fullPagePath,
                fullPage: true,
                type: 'png'
            });
            console.log(`✅ Full page screenshot saved: ${fullPagePath}`);

            // Take individual page screenshots
            await this.takeIndividualPageScreenshots(page, outputDir);

        } catch (error) {
            console.error('Error taking screenshots:', error);
            throw error;
        } finally {
            await page.close();
        }
    }

    /**
     * Take screenshots of individual pages
     */
    private async takeIndividualPageScreenshots(page: Page, outputDir: string): Promise<void> {
        const pages = await page.locator('.page').all();
        
        for (let i = 0; i < pages.length; i++) {
            const pageElement = pages[i];
            const screenshotPath = path.join(outputDir, `page-${i + 1}.png`);
            
            await pageElement.screenshot({
                path: screenshotPath,
                type: 'png'
            });
            
            console.log(`✅ Page ${i + 1} screenshot saved: ${screenshotPath}`);
        }
    }

    /**
     * Ensure directory exists, create if it doesn't
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
            console.log(`📁 Created directory: ${dirPath}`);
        }
    }

    /**
     * Close the browser
     */
    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

/**
 * Main function to generate screenshots
 */
export async function generateScreenshots(
    htmlFilePath: string, 
    outputDir: string = 'images'
): Promise<void> {
    const generator = new ScreenshotGenerator();
    
    try {
        console.log('🚀 Initializing Playwright browser...');
        await generator.init();
        
        console.log(`📸 Taking screenshots of: ${htmlFilePath}`);
        await generator.takeScreenshots(htmlFilePath, outputDir);
        
        console.log('✨ Screenshot generation completed!');
    } catch (error) {
        console.error('❌ Failed to generate screenshots:', error);
        throw error;
    } finally {
        await generator.close();
    }
}

// Example usage
if (require.main === module) {
    const htmlPath = path.join(__dirname, '../templates/product-pages.html');
    const outputPath = path.join(process.cwd(), 'images');
    
    generateScreenshots(htmlPath, outputPath)
        .then(() => {
            console.log('🎉 All done! Check the images folder for your screenshots.');
        })
        .catch((error) => {
            console.error('💥 Error:', error);
            process.exit(1);
        });
} 