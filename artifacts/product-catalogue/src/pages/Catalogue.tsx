import { useListProducts } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/product/ProductCard";
import { AddProductDrawer } from "@/components/product/AddProductDrawer";
import { PackageOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Catalogue() {
  const { data: products, isLoading, isError } = useListProducts();

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            >
              The Collection
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl"
            >
              Manage your premium inventory. Add new arrivals with stunning photography to captivate your audience.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="shrink-0"
          >
            <AddProductDrawer />
          </motion.div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
            <p className="text-muted-foreground font-medium animate-pulse">Loading collection...</p>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-lg font-semibold text-destructive">Failed to load products</p>
            <p className="text-muted-foreground mt-2">Please try refreshing the page.</p>
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative mb-8 w-64 h-64 opacity-90 mix-blend-multiply dark:mix-blend-screen pointer-events-none">
              <img 
                src={`${import.meta.env.BASE_URL}images/empty-state-art.png`} 
                alt="Empty showcase" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Your gallery is empty
            </h3>
            <p className="mt-3 max-w-md text-muted-foreground">
              It looks like you haven't added any products yet. Begin curating your collection by adding your first piece.
            </p>
            <div className="mt-8">
              <AddProductDrawer />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
