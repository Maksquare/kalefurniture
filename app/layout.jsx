import { Plus_Jakarta_Sans, Jost, Alex_Brush } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "@/context/ProductContext";
import { PackageProvider } from "@/context/PackageContext";
import { CartProvider } from "@/context/CartContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext"; 
import { CategoryProvider } from "@/context/CategoryContext";
import CartDrawer from "@/components/CartDrawer";
import CookieConsent from "@/components/CookieConsent";
import { Toaster } from "react-hot-toast";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  variable: "--font-cursive",
  weight: ["400"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kalefurnitures.com"),
  title: {
    default: "Kal Furniture | Premium Furniture in Addis Ababa",
    template: "%s | Kal Furniture",
  },
  description:
    "Experience world-class furniture design at Kal Furniture. From modern aesthetics to timeless classics, we deliver elegance to your home.",
  keywords: [
    "furniture Addis Ababa",
    "Kal Furniture",
    "premium furniture",
    "home decor",
    "modern furniture",
    "interior design Addis Ababa",
  ],
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Kal Furniture | Premium Furniture in Addis Ababa",
    description:
      "Experience world-class furniture design at Kal Furniture. Elegance, comfort, and style — in every piece.",
    type: "website",
    locale: "en_ET",
    siteName: "Kal Furniture",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${jost.variable} ${alexBrush.variable} antialiased`}
      >
        <SiteSettingsProvider>
          <CategoryProvider>
            <PackageProvider>
              <ProductProvider>
                <CartProvider>
                  {children}
                  <CartDrawer />
                  <CookieConsent />
                  <Toaster position="bottom-right" toastOptions={{ className: 'font-secondary text-[14px]' }} />
                </CartProvider>
              </ProductProvider>
            </PackageProvider>
          </CategoryProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}