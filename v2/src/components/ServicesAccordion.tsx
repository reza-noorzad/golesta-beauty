import type { ServiceCategory } from "@/lib/services-store";

export default function ServicesAccordion({
  categories,
  expandResults = false,
}: {
  categories: ServiceCategory[];
  expandResults?: boolean;
}) {
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <details
          key={category.id}
          open={expandResults || undefined}
          className="group rounded-2xl border border-[#e8ddd0] bg-white"
        >
          <summary className="cursor-pointer rounded-2xl p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a98348] sm:p-7">
            <h2 className="ml-2 inline font-serif text-2xl [overflow-wrap:anywhere]">
              {category.title}
            </h2>
            {category.desc && (
              <p className="mt-3 text-sm leading-6 text-[#74685d]">
                {category.desc}
              </p>
            )}
            <p className="mt-3 text-sm text-[#8b6a3c]">
              {category.items.length}{" "}
              {category.items.length === 1 ? "Leistung" : "Leistungen"}
            </p>
          </summary>
          <dl className="mx-5 divide-y divide-[#e8ddd0] border-t border-[#e8ddd0] pb-3 sm:mx-7">
            {category.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 py-4 text-sm sm:text-base"
              >
                <dt className="min-w-0 [overflow-wrap:anywhere]">{item.name}</dt>
                <dd className="ml-auto text-right font-medium text-[#8b6a3c] [overflow-wrap:anywhere]">
                  {item.price}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ))}
    </div>
  );
}
