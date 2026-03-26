import { Link } from "wouter";
import { PackageSearch } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
            <PackageSearch className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            LUMIÈRE
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden text-sm font-medium text-muted-foreground md:block">
            Curated Collection
          </div>
          <div className="h-8 w-8 rounded-full bg-muted border border-border/50 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User avatar" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
