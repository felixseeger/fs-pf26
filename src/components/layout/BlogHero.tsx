interface BlogHeroProps {
  title: string;
  description?: string;
}

export default function BlogHero({ title, description }: BlogHeroProps) {
  return (
    <section className="bg-linear-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 text-white py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            {title}
          </h1>
          {description && (
            <p className="text-xl md:text-2xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
