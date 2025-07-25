import { Router } from "express";
import pg from "pg";
import { productListingRequestSchema } from "../types/productListingRequest";
import { createClient } from "redis";

const router = Router();

// Create Redis client only if REDIS_URL is provided
let redisClient: any = null;
if (process.env.REDIS_URL) {
    redisClient = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379"
    });
}

router.post("/product-listing", async (req, res) => {
    const { success } = productListingRequestSchema.safeParse(req.body);

    if (success) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    const pgClient = new pg.Client(process.env.DATABASE_URL);

    try {
        const { productName, productDescription, imageUrls } = req.body;
        await pgClient.connect();
        
        var image_url_to_store = ""
    
        imageUrls.forEach(async (imageUrl : string) => {
            image_url_to_store += imageUrl + ",";
        });
    
        const query = `INSERT INTO product_listing (product_name, product_description, image_links, status) VALUES ($1, $2, $3, 'requested') RETURNING id`;
    
        const result = await pgClient.query(query, [productName, productDescription, image_url_to_store]);
    
        const product_id = result.rows[0].id;

        // Only use Redis if it's available
        if (redisClient) {
            try {
                await redisClient.connect();
                await redisClient.publish("product_listing_queue", JSON.stringify({
                    product_id: product_id,
                    product_name: productName,
                    product_description: productDescription,
                    image_links: image_url_to_store,
                    status: "requested"
                }));
                await redisClient.quit();
            } catch (redisError) {
                console.warn("Redis not available, skipping queue publish:", redisError);
            }
        }
    
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
    }
});

router.get("/all-products", async (req, res) => {
    const pgClient = new pg.Client(process.env.DATABASE_URL);
    const query = `SELECT * FROM image_details`;
    
    try {
        await pgClient.connect();
        const result = await pgClient.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        await pgClient.end();
    }
});

router.get("/product/:id", async (req, res) => {
    const pgClient = new pg.Client(process.env.DATABASE_URL);
    const productId = req.params.id;
    
    // Validate product ID
    if (!productId || isNaN(Number(productId))) {
        return res.status(400).json({ error: "Invalid product ID" });
    }
    
    const query = `SELECT * FROM image_details WHERE id = $1`;
    
    try {
        await pgClient.connect();
        const result = await pgClient.query(query, [productId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        await pgClient.end();
    }
});

export const promptRouter = router;