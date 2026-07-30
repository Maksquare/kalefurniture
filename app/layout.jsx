import { Cormorant_Garamond, Jost, Italiana } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "@/context/ProductContext";
import { PackageProvider } from "@/context/PackageContext";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { Toaster } from "react-hot-toast";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const italiana = Italiana({
  subsets: ["latin"],
  variable: "--font-italiana",
  weight: ["400"],
  display: "swap",
});

export const metadata = {
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
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
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
        className={`${cormorant.variable} ${jost.variable} ${italiana.variable} antialiased`}
      >
        <PackageProvider>
          <ProductProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <Toaster position="bottom-right" toastOptions={{ className: 'font-secondary text-[14px]' }} />
            </CartProvider>
          </ProductProvider>
        </PackageProvider>
      </body>
    </html>
  );
}