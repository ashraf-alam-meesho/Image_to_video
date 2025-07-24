import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

export interface TemplateData {
    image1: string;
    text1: string;
    image2: string;
    text2: string;
    image3: string;
    text3: string;
}

export class TemplateRenderer {
    private template: HandlebarsTemplateDelegate;

    constructor() {
        // Load the Handlebars template
        const templatePath = path.join(__dirname, '../../src/templates/product-pages.html');
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        this.template = Handlebars.compile(templateSource);
    }

    /**
     * Render the template with provided data
     * @param data - Object containing image URLs and text content
     * @returns Rendered HTML string
     */
    public renderTemplate(data: TemplateData): string {
        return this.template(data);
    }

    /**
     * Example usage with sample data
     */
    public static getExampleData(): TemplateData {
        return {
            image1: "https://nestasia.in/cdn/shop/files/waterbottlessetof3_27.jpg?v=1698991535&width=600",
            text1: `Mystery and Surprise: This "PACK OF 1 Labubu doll blind box" offers a thrilling mystery, as each purchase contains a random action figure, monster series keychain, or cute collectible figurine from the "energy series Labubu.
            Collectible and Adorable: Get ready to discover a delightful, random-colored Labubu collectible that serves as a charming addition to any collection, bringing a playful surprise with every unboxing. Versatile Decor and Play: Beyond being a fun surprise toy for kids, this blind box item can double as a unique home decor piece or a quirky keychain toy, adding personality wherever it goes.",`,
            
            image2: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop", 
            text2: `Premium Material and Quality: Crafted from soft, premium fabric, this 15 cm Labubu Bunny plush toy ensures a high-quality, huggable, and durable collectible designed for lasting enjoyment. Exclusive Energy Series Design: Each plush features unique designs and vibrant, multicolored patterns from the "Biginto Energy Series," making every reveal a distinct and visually appealing experience. Exciting Blind Box Experience: The sealed blind box packaging amplifies the excitement, providing the thrill of a surprise discovery as you unveil which adorable Labubu character you've received.`,
            
            image3: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop",
            text3: `Perfect for Collectors: An excellent choice for expanding any collection of designer toys or plushies, offering a fun and unpredictable way to acquire new and unique characters. Thoughtful Surprise Gift: This blind box makes an ideal and unexpected present for birthdays, holidays, or other special occasions, sure to bring joy and excitement to the recipient. Charming Decoration and Companion: Its compact size and appealing design make it perfect for adding a cute touch to desks, shelves, or bedside tables, while also serving as a delightful travel buddy for on-the-go fun.`
        };
    }
}

// Example usage function
export async function generateProductPages(templateData: TemplateData): Promise<string> {
    try {
        const renderer = new TemplateRenderer();
        const htmlContent = renderer.renderTemplate(templateData);
        fs.writeFileSync("product-pages.html", htmlContent);
        return htmlContent;
    } catch (error) {
        console.error('Error generating product pages:', error);
        throw error;
    }
}

// Example usage:
/*
const sampleData = TemplateRenderer.getExampleData();
const htmlOutput = await generateProductPages(sampleData);
console.log(htmlOutput); // This will be your rendered HTML
*/ 