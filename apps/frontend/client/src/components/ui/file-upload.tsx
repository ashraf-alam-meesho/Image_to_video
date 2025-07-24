import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { validateFiles, createImagePreview } from "@/lib/file-utils";
import { CloudUpload, X, Star, Trash2 } from "lucide-react";
import { Button } from "./button";

interface UploadedImage {
  file: File;
  preview: string;
  url?: string;
  uploading?: boolean;
  progress?: number;
  error?: boolean;
}

interface FileUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  className?: string;
}

export function FileUpload({
  onImagesChange,
  maxFiles = 10,
  className,
}: FileUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const { validFiles, errors } = validateFiles(acceptedFiles);

      if (errors.length > 0) {
        // Handle errors - could show toast here
        console.error("File validation errors:", errors);
        return;
      }

      // Create previews for valid files
      const newImages: UploadedImage[] = [];
      for (const file of validFiles) {
        try {
          const preview = await createImagePreview(file);
          newImages.push({ file, preview, uploading: true, progress: 0 });
        } catch (error) {
          console.error("Error creating preview:", error);
        }
      }

      const updatedImages = [...images, ...newImages].slice(0, maxFiles);
      setImages(updatedImages);
      onImagesChange(updatedImages);

      // Actually upload the images to the server
      newImages.forEach((image, index) => {
        uploadImage(images.length + index, image.file);
      });
    },
    [images, maxFiles, onImagesChange],
  );

  const uploadImage = async (imageIndex: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append("images", file);

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/demo/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const imageUrl = result.images[0]; // Get the first uploaded image URL

      // Update the image with the actual URL
      setImages((prev) => {
        const updatedImages = prev.map((img, idx) =>
          idx === imageIndex
            ? { ...img, uploading: false, progress: 100, url: imageUrl }
            : img,
        );
        // Notify parent component of the change
        onImagesChange(updatedImages);
        return updatedImages;
      });
    } catch (error) {
      console.error("Upload failed:", error);
      // Mark upload as failed
      setImages((prev) =>
        prev.map((img, idx) =>
          idx === imageIndex
            ? { ...img, uploading: false, progress: 0, error: true }
            : img,
        ),
      );
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles,
    multiple: true,
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-slate-300 hover:border-primary hover:bg-primary/5",
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <CloudUpload className="h-8 w-8 text-slate-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-slate-900">
              Drop your images here, or{" "}
              <span className="text-primary">browse</span>
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Supports: JPG, PNG, WebP up to 10MB each
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group bg-white border border-slate-200 rounded-lg overflow-hidden"
            >
              <img
                src={image.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="p-2 bg-white rounded-full text-slate-700 hover:text-red-600"
                    onClick={() => removeImage(index)}
                    title="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Upload Progress */}
              {image.uploading && (
                <>
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${image.progress || 0}%` }}
                    />
                  </div>
                </>
              )}

              {/* Error State */}
              {image.error && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                    Upload Failed
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add More Images Placeholder */}
          {images.length < maxFiles && (
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-slate-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <CloudUpload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Add Image</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Guidelines */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-800 mb-2">
          Image Guidelines
        </h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Use high-quality images with good lighting</li>
          <li>• Square images (1:1 ratio) work best</li>
          <li>• Minimum resolution: 800x800 pixels</li>
          <li>• Show multiple angles of your product</li>
        </ul>
      </div>
    </div>
  );
}
