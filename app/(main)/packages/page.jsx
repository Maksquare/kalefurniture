import PackageSlider from "@/components/PackageSlider";

export const metadata = {
  title: "Exclusive Packages | Kal Furniture",
  description: "Discover our premium, curated furniture bundles at exclusive promotional prices.",
};

const PackagesPage = () => {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-20 sm:pt-32 pb-20 sm:pb-24 overflow-hidden">
      {/* Hero Header */}
      <div className="container px-4 sm:px-6 lg:px-12 mb-6 sm:mb-10 text-center max-w-4xl mx-auto">
        <span className="px-3 py-1 rounded-full bg-gold/15 text-gold font-secondary text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] border border-gold/30 inline-block mb-3 sm:mb-4 shadow-sm">
          Curated Architectural Suites
        </span>
        <h1 className="font-primary text-[32px] sm:text-[52px] lg:text-[64px] text-secondary font-normal leading-[1.1] sm:leading-[1.08] mb-3 sm:mb-4">
          Tailored Bundles & <em className="text-gold not-italic font-medium">Complete Packages</em>
        </h1>
        <p className="font-secondary text-[13px] sm:text-[16px] text-secondary/70 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
          Explore complete room solutions meticulously hand-crafted by Kal Furniture artisans. Save up to 20% on complete bundled ensembles with complimentary white-glove setup.
        </p>
      </div>

      {/* Main Slider Content */}
      <main className="w-full">
        <PackageSlider />
      </main>
    </div>
  );
};

export default PackagesPage;
