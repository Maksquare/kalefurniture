import Hero from "@/components/Hero";
import Collections from "@/components/Collections";
import ProductGrid from "@/components/ProductGrid";
import PromoBanner from "@/components/PromoBanner";
import { fetchHeroAndPromoData } from "@/app/actions/admin";
import { resolveImageUrl } from "@/lib/imageUtils";

export default async function Home() {
  const { heroProduct, promoSettings, heroSettings } = await fetchHeroAndPromoData();

  // Resolve main hero image URL for high-priority preload link in <head>
  const rawMainHeroImage = 
    heroProduct?.images?.[0] ||
    heroProduct?.image ||
    "/ksf009-preview.webp";
  const mainHeroImageUrl = resolveImageUrl(rawMainHeroImage);

  return (
    <div className="overflow-hidden min-h-screen bg-surface">
      {/* Preload main hero image with high fetch priority (automatically hoisted to <head> by React 19 / Next.js) */}
      <link 
        rel="preload" 
        as="image" 
        href={mainHeroImageUrl} 
        fetchPriority="high" 
      />

      <Hero initialProduct={heroProduct} initialHeroSettings={heroSettings} />
      <Collections />
      <ProductGrid />
      <PromoBanner initialPromoSettings={promoSettings} />
    </div>
  );
}