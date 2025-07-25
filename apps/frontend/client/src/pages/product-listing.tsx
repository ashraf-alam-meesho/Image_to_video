import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Package, Calendar, Upload } from "lucide-react";
import { useLocation } from "wouter";
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

const fetchProducts = async (): Promise<any> => {
  const response = await axios.get(`${BACKEND_URL}/prompt/all-products`);

  return response.data;
};

const ProductCard = ({ product }: { product: Product }) => {
  const imageUrls = product.image_links ? product.image_links.split(",").filter(Boolean) : [];
  const primaryImageUrl = imageUrls[0] || "";
  const [, setLocation] = useLocation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const handleImageClick = () => {
    setLocation(`/video/${product.id}`);
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {product.product_name}
          </CardTitle>
          <Badge className={getStatusColor(product.status)}>
            {product.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Image */}
        {primaryImageUrl && (
          <div 
            className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity relative"
            onClick={handleImageClick}
          >
            <img
              src={primaryImageUrl}
              alt={product.product_name}
              className="h-full w-full object-cover object-center"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            {product.status.toLowerCase() === "completed" && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-white bg-opacity-90 rounded-full p-3">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 right-2">
              {product.status.toLowerCase() === "completed" ? (
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  Video Ready
                </div>
              ) : (
                <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                  Processing...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Description */}
        <div>
          <p className="text-sm text-gray-600 line-clamp-3">
            {product.product_description}
          </p>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{formatDate(product.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Package size={16} />
            <span>ID: {product.id}</span>
          </div>
        </div>

        {/* Image Count */}
        {imageUrls.length > 1 && (
          <div className="text-xs text-gray-500">
            +{imageUrls.length - 1} more image{imageUrls.length > 2 ? "s" : ""}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProductListingSkeleton = () => (
  <Card className="h-full">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-16" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </CardContent>
  </Card>
);

export default function ProductListing() {
  const [, setLocation] = useLocation();
  
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleUploadClick = () => {
    setLocation("/");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-semibold text-slate-800">
                Product Listings
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex mb-4 gap-2">
                <AlertCircle size={32} className="text-red-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Failed to Load Products
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Unable to fetch product listings. Please try again.
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Retry
                  </button>
                </div>
              </div>
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-800">
                Product Listings
              </h1>
              {!isLoading && products && (
                <Badge variant="secondary" className="ml-3">
                  {products.length} product{products.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleUploadClick}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Upload size={16} />
                Upload Product
              </button>
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {isLoading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductListingSkeleton key={index} />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Package size={48} className="text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No Products Found
              </h2>
              <p className="text-sm text-gray-600">
                No products have been uploaded yet. Start by adding your first
                product.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
} 