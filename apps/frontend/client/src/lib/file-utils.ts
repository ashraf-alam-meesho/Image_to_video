export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
];

export function validateFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and WebP images are allowed";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File size must be less than 10MB";
  }

  return null;
}

export function validateFiles(files: File[]): {
  validFiles: File[];
  errors: string[];
} {
  const validFiles: File[] = [];
  const errors: string[] = [];

  if (files.length > 10) {
    errors.push("Maximum 10 images allowed");
    return { validFiles: [], errors };
  }

  files.forEach((file, index) => {
    const error = validateFile(file);
    if (error) {
      errors.push(`File ${index + 1}: ${error}`);
    } else {
      validFiles.push(file);
    }
  });

  return { validFiles, errors };
}

export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
