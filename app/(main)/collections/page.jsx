import CollectionsGrid from "@/components/CollectionsGrid";

export const metadata = {
  title: "Collections | Kal Furniture",
  description: "Explore our meticulously curated furniture collections.",
};

const CollectionsPage = () => {
  return (
    <div className="overflow-hidden min-h-screen">
      <main className="pt-32 xl:pt-40 container">
        <div className="max-w-3xl mx-auto text-center mb-4">
          <h1 className="font-primary text-[40px] md:text-[52px] font-light text-secondary leading-[1.1] tracking-[-0.02em] mb-6">
            Curated <em className="text-gold not-italic font-semibold">Collections.</em>
          </h1>
          <p className="font-secondary text-[16px] text-secondary/70 leading-relaxed">
            Explore our meticulously crafted furniture categories, designed to elevate every space in your home.
          </p>
        </div>
      </main>

      <div className="-mt-8">
        <CollectionsGrid />
      </div>
    </div>
  );
};

export default CollectionsPage;
