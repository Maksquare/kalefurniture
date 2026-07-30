import PackageSlider from "@/components/PackageSlider";

export const metadata = {
  title: "Exclusive Packages | Kal Furniture",
  description: "Discover our premium, curated furniture bundles at exclusive promotional prices.",
};

const PackagesPage = () => {
  return (
    <div className="bg-white min-h-screen pt-28 pb-20 overflow-hidden">
      <main className="container">
        <PackageSlider />
      </main>
    </div>
  );
};

export default PackagesPage;
