import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useUploadProductImage } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { mutate: uploadImage, isPending: isUploading } = useUploadProductImage({
    mutation: {
      onSuccess: (data) => {
        onChange(data.imageUrl);
        toast({
          title: "Image uploaded",
          description: "Your product image is ready.",
        });
      },
      onError: () => {
        toast({
          title: "Upload failed",
          description: "There was a problem uploading your image. Please try again.",
          variant: "destructive",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    uploadImage({ data: { image: file } });
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        onClick={() => !isUploading && !value && fileInputRef.current?.click()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
          value
            ? "border-transparent bg-muted/50"
            : isHovered
            ? "border-primary/50 bg-primary/5"
            : "border-border bg-muted/20"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <AnimatePresence mode="wait">
          {value ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="group relative h-full w-full"
            >
              <img
                src={value}
                alt="Product preview"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <button
                onClick={clearImage}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-destructive hover:text-white opacity-0 group-hover:opacity-100"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ) : isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3 text-primary"
            >
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-medium">Uploading...</span>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 text-muted-foreground transition-colors group-hover:text-primary"
            >
              <div className="rounded-full bg-background p-4 shadow-sm ring-1 ring-border/50 transition-transform group-hover:scale-110">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Click to upload image</p>
                <p className="mt-1 text-xs">JPEG, PNG up to 5MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
