import Hero from "@/components/Hero";
import Collections from "@/components/Collections";
import ProductGrid from "@/components/ProductGrid";
import PromoBanner from "@/components/PromoBanner";
import { fetchHeroAndPromoData } from "@/app/actions/admin";

export default async function Home() {
  const { heroProduct, promoSettings } = await fetchHeroAndPromoData();

  return (
    <div className="overflow-hidden min-h-screen bg-surface">
      <Hero initialProduct={heroProduct} />
      <Collections />
      <ProductGrid />
      <PromoBanner initialPromoSettings={promoSettings} />
    </div>
  );
}