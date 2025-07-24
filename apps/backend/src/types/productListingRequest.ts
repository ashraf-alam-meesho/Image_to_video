import { z } from "zod";

export const productListingRequestSchema = z.object({
    productName: z.string(),
    productDescription: z.string(),
    imageUrls: z.array(z.string()).min(3).max(3),
});