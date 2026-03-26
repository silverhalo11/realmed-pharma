import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Sparkles } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { useCreateProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description needs more detail"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  category: z.string().min(2, "Category is required"),
  imageUrl: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddProductDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: undefined as unknown as number,
      category: "",
      imageUrl: null,
    },
  });

  const { mutate: createProduct, isPending } = useCreateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({
          title: "Product added!",
          description: "Your new product is now live in the catalogue.",
        });
        closeDrawer();
      },
      onError: (error) => {
        console.error("Create error:", error);
        toast({
          title: "Something went wrong",
          description: "Could not add the product. Please check your inputs.",
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    createProduct({ data });
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setTimeout(() => form.reset(), 300); // Reset after animation
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-95"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />
        <Plus className="h-5 w-5" />
        <span>Add Product</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl sm:border-l sm:border-border"
            >
              <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-xl font-bold">New Product</h2>
                </div>
                <button
                  onClick={closeDrawer}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="add-product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Product Image</label>
                    <Controller
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <ImageUpload value={field.value} onChange={field.onChange} />
                      )}
                    />
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground" htmlFor="name">
                        Product Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="e.g. Minimalist Ceramic Vase"
                        className={`w-full rounded-xl border-2 bg-transparent px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-0 ${
                          form.formState.errors.name ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                        }`}
                        {...form.register("name")}
                      />
                      {form.formState.errors.name && (
                        <p className="text-xs font-medium text-destructive">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground" htmlFor="price">
                          Price (USD)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <input
                            id="price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className={`w-full rounded-xl border-2 bg-transparent py-3 pl-8 pr-4 text-sm transition-colors focus:outline-none focus:ring-0 ${
                              form.formState.errors.price ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                            }`}
                            {...form.register("price")}
                          />
                        </div>
                        {form.formState.errors.price && (
                          <p className="text-xs font-medium text-destructive">{form.formState.errors.price.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground" htmlFor="category">
                          Category
                        </label>
                        <input
                          id="category"
                          type="text"
                          placeholder="e.g. Home Decor"
                          className={`w-full rounded-xl border-2 bg-transparent px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-0 ${
                            form.formState.errors.category ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                          }`}
                          {...form.register("category")}
                        />
                        {form.formState.errors.category && (
                          <p className="text-xs font-medium text-destructive">{form.formState.errors.category.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground" htmlFor="description">
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={4}
                        placeholder="Detail the materials, dimensions, and inspiration behind this piece..."
                        className={`w-full resize-none rounded-xl border-2 bg-transparent px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-0 ${
                          form.formState.errors.description ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                        }`}
                        {...form.register("description")}
                      />
                      {form.formState.errors.description && (
                        <p className="text-xs font-medium text-destructive">{form.formState.errors.description.message}</p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <div className="border-t border-border/50 bg-muted/30 p-6">
                <button
                  type="submit"
                  form="add-product-form"
                  disabled={isPending}
                  className="w-full rounded-xl bg-primary py-4 text-center font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isPending ? "Adding Product..." : "Publish Product"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
