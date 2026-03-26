import { motion } from "framer-motion";
import { Trash2, ImageIcon } from "lucide-react";
import type { Product } from "@workspace/api-client-react/src/generated/api.schemas";
import { useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({
          title: "Product removed",
          description: `${product.name} has been deleted from the catalogue.`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete the product. Please try again.",
          variant: "destructive",
        });
      },
    },
  });

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative flex flex-col rounded-2xl bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.03]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted/50 border border-border/50">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30">
            <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Floating Category Badge */}
        <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground backdrop-blur-md shadow-sm">
          {product.category}
        </div>

        {/* Delete Action */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm("Are you sure you want to delete this product?")) {
              deleteProduct({ id: product.id });
            }
          }}
          disabled={isDeleting}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-muted-foreground backdrop-blur-md shadow-sm opacity-0 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
          aria-label="Delete product"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-display text-lg font-semibold leading-tight text-foreground line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 flex-1">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-foreground">
            {formattedPrice}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
