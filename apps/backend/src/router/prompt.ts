import { Router } from "express";
import pg from "pg";
import dotenv from "dotenv";
import { productListingRequestSchema } from "../types/productListingRequest";
import { createClient } from "redis";

dotenv.config();

const pgClient = new pg.Client(process.env.DATABASE_URL);
const redisClient = createClient({
    url: process.env.REDIS_URL
});

const router = Router();

router.post("/product-listing", async (req, res) => {
    const { success } = productListingRequestSchema.safeParse(req.body);

    if (success) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    try {
        const { productName, productDescription, imageUrls } = req.body;
        await pgClient.connect();
        await redisClient.connect();
        var image_url_to_store = ""
    
        imageUrls.forEach(async (imageUrl : string) => {
            image_url_to_store += imageUrl + ",";
        });
    
        const query = `INSERT INTO product_listing (product_name, product_description, image_links, status) VALUES ($1, $2, $3, 'requested') RETURNING id`;
    
        const result = await pgClient.query(query, [productName, productDescription, image_url_to_store]);
    
        const product_id = result.rows[0].id;

        await redisClient.publish("product_listing_queue", JSON.stringify({
            product_id: product_id,
            product_name: productName,
            product_description: productDescription,
            image_links: image_url_to_store,
            status: "requested"
        }))
    
        res.status(200).json({
            product_id: product_id,
            product_name: productName,
            product_description: productDescription,
            image_links: image_url_to_store,
            status: "requested"
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        await pgClient.end();
        await redisClient.quit();
    }
});

export const promptRouter = router;