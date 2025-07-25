import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, Play, Download } from "lucide-react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface Product {
  id: number;
  product_name: string;
  product_description: string;
  image_links: string;
  status: string;
  created_at: string;
}

const fetchProduct = async (productId: string): Promise<Product> => {
  const response = await axios.get(`${BACKEND_URL}/prompt/product/${productId}`);
  return response.data;
};

const VideoViewerSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="w-full aspect-video rounded-lg" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
);

export default function VideoViewer() {
  const [match, params] = useRoute("/video/:id");
  const [, setLocation] = useLocation();
  const productId = params?.id;

  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId!),
    enabled: !!productId,
  });

  const handleBackToListings = () => {
    setLocation("/listings");
  };

  const getVideoUrl = (productId: string) => {
    // Assuming videos are stored with a predictable naming pattern
    return `${BACKEND_URL}/videos/final_video.mp4`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!match || !productId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Invalid Video URL
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              The video ID provided is not valid.
            </p>
            <Button onClick={handleBackToListings}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button variant="ghost" onClick={handleBackToListings}>
                <ArrowLeft size={16} className="mr-2" />
                Back to Listings
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Failed to Load Video
              </h2>
              <p className="text-sm text-gray-600">
                Unable to load the video for this product.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={handleBackToListings}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Listings
            </Button>
            {product && (
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
                <span className="text-sm text-gray-600">
                  Product ID: {product.id}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <VideoViewerSkeleton />
        ) : product ? (
          <div className="space-y-6">
            {/* Video Section */}
            <Card>
              <CardContent className="p-0">
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full"
                    poster={product.image_links?.split(",")[0] || ""}
                  >
                    <source src={getVideoUrl(productId)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute top-4 right-4">
                    <a
                      href={getVideoUrl(productId)}
                      download={`${product.product_name}_video.mp4`}
                      className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-lg transition-colors"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                      {product.product_name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Created on {formatDate(product.created_at)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Description</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {product.product_description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Product Images */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {product.image_links ? (
                        product.image_links
                          .split(",")
                          .filter(Boolean)
                          .map((imageUrl, index) => (
                            <div
                              key={index}
                              className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100"
                            >
                              <img
                                src={imageUrl.trim()}
                                alt={`${product.product_name} - ${index + 1}`}
                                className="h-full w-full object-cover object-center"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-gray-500">No images available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
} 