import { WPPortfolioItem } from "@/types/wordpress";
import PortfolioCard from "./PortfolioCard";

interface PortfolioGridProps {
    items: WPPortfolioItem[];
    title?: string;
}

export default function PortfolioGrid({ items, title }: PortfolioGridProps) {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-500 dark:text-zinc-400">No projects found.</p>
            </div>
        );
    }

    return (
        <section className="w-full">
            {title && (
                <h2 className="text-3xl font-bold mb-8 text-black dark:text-white">
                    {title}
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item) => (
                    <PortfolioCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}
