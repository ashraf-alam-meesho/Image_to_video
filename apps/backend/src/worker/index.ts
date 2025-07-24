import { createClient } from "redis";
import { GoogleGenAI } from "@google/genai";
import { generateCompleteHTMLAndScreenshots } from "../generate-and-screenshot";
import { exec } from 'child_process';
// import dotenv from 'dotenv';
// dotenv.config();
import { promisify } from 'util';

// const redisClient = createClient({
//     url: process.env.REDIS_URL
// });

const ai = new GoogleGenAI({
    apiKey: "AIzaSyAZT_2Mqg6AsXGpjytM1FWqxJyCf2Sp8VY"
});

// Promisify exec to make it awaitable
const execAsync = promisify(exec);

async function main() {
    // await redisClient.connect();

    const test_product_id = "TEST_123";
    const test_product_name = "Premium Wireless Headphones";
    const test_product_description = "High-quality noise-cancelling wireless headphones with 30-hour battery life and premium sound quality";
    const test_image_links = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e,https://images.unsplash.com/photo-1505740106531-4243f3831c78,https://images.unsplash.com/photo-1505751104546-4b63c93054b1";

    await generateProductPages(test_product_id, test_product_name, test_product_description, test_image_links);

    // while(true) {
    //     const subscriber = await redisClient.subscribe("product_listing_queue", async (message) => {
    //         try {
    //             const data = JSON.parse(message);
    //             const product_id = data.product_id;
    //             const product_name = data.product_name;
    //             const product_description = data.product_description;
    //             const image_links = data.image_links;
    //             const status = data.status;

    //             // Add await to wait for completion before processing next message
    //             await generateProductPages(product_id, product_name, product_description, image_links);
    //         } catch (error) {
    //             console.error('Error processing message:', error);
    //         }
    //     });
    // }
}

async function generateProductPages(product_id: string, product_name: string, product_description: string, image_links: string) {
    const prompt = `
        You are a professional product copywriter. Given the following product information, create 3 distinct and engaging product page descriptions for an e-commerce carousel.

        Product Name: ${product_name}
        Product Description: ${product_description}

        Requirements:
        1. Create 3 different angles/perspectives for the same product
        2. Each description should be 2-3 sentences long
        3. Focus on different benefits: features, lifestyle, and value proposition
        4. Make them compelling and sales-oriented
        5. Keep each description between 100-150 characters

        I don't want any other data other than json format. no wildcard characters. just curly brackets and alphanumeric characters. only provide the object without any nuances. Also this response is not visual, so don't add \`\`\` for editor UI. Return ONLY a JSON object in this exact format:
        {
        "page_1": "First product description focusing on key features and functionality",
        "page_2": "Second product description focusing on lifestyle and user experience", 
        "page_3": "Third product description focusing on value and quality benefits"
        }`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    const data =  response.text;
    console.log('response', data);

    //@ts-ignore
    const jsonData = JSON.parse(data);

    const images = image_links.split(',');

    const image1 = images[0];
    const image2 = images[1];
    const image3 = images[2];

    const text1 = jsonData.page_1;
    const text2 = jsonData.page_2;
    const text3 = jsonData.page_3;

    await generateCompleteHTMLAndScreenshots(image1, image2, image3, text1, text2, text3);

    try {
        // Use promisified exec to wait for script completion
        const { stdout, stderr } = await execAsync('sh scripts/make-videos.sh');
        console.log('Script output:', stdout);
        if (stderr) {
            console.error('Script errors:', stderr);
        }
        console.log('Video generation completed successfully');
    } catch (error) {
        console.error('Script execution failed:', error);
        throw error; // Re-throw to handle in the subscriber
    }
}

main();