import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { List } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Product description is required")
    .max(2000, "Description must be less than 2000 characters"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function ProductUpload() {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Images are now uploaded directly in the FileUpload component

  const submitProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const backendUrl = "${BACKEND_URL}"; // This will be configured later
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product submitted successfully!",
      });
      form.reset();
      setUploadedImages([]);
      setImageUrls([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImagesChange = (images: any[]) => {
    setUploadedImages(images);
    console.log("Uploaded Images:", images);

    // Extract URLs from successfully uploaded images
    const urls = images
      .filter((img) => img.url && !img.uploading && !img.error)
      .map((img) => img.url);
    setImageUrls(urls);
  };

  const handleMyListingsClick = () => {
    setLocation("/listings");
  };

  const onSubmit = (data: ProductFormData) => {
    // Get successfully uploaded images
    const successfullyUploadedImages = uploadedImages
      .filter((img) => img.url && !img.uploading)
      .map((img) => img.url);

    // Validate that at least one image is uploaded
    if (successfullyUploadedImages.length === 0) {
      toast({
        title: "Validation Error",
        description:
          "At least one product image must be successfully uploaded.",
        variant: "destructive",
      });
      return;
    }

    // Prepare the data for submission
    const submitData = {
      productName: data.name,
      productDescription: data.description,
      images: successfullyUploadedImages,
      timestamp: new Date().toISOString(),
    };

    console.log("Submitting product data:", submitData);
    submitProductMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-800">
                Add New Product
              </h1>
            </div>
            <button
              onClick={handleMyListingsClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <List size={16} />
              My Listings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Product Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <p className="text-sm text-slate-600">
                  Fill in the basic product details below
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Product Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name..." {...field} />
                      </FormControl>
                      <div className="text-sm text-slate-500">
                        {field.value.length}/100 characters
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Product Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Product Description{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your product in detail..."
                          className="resize-none"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <div className="text-sm text-slate-500">
                        {field.value.length}/2000 characters
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Image Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <p className="text-sm text-slate-600">
                  Upload up to 10 images. First image will be the main product
                  image.
                </p>
              </CardHeader>
              <CardContent>
                <FileUpload onImagesChange={handleImagesChange} />
              </CardContent>
            </Card>

            {/* Submit Button Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setUploadedImages([]);
                      setImageUrls([]);
                    }}
                    disabled={submitProductMutation.isPending}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                    disabled={submitProductMutation.isPending}
                  >
                    {submitProductMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit Product"
                    )}
                  </Button>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <strong>Submission Info:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Product name and description are required</li>
                    <li>
                      At least one successfully uploaded image is required
                    </li>
                    <li>
                      Data will be sent to:{" "}
                      <code className="bg-slate-100 px-1 rounded">
                        ${"Backend_url"}
                      </code>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </main>
    </div>
  );
}
