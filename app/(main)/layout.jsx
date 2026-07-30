import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import CartToast from "@/components/CartToast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HeroThemeProvider } from "@/context/HeroThemeContext";

export default function MainLayout({ children }) {
  return (
    <CartProvider>
      <HeroThemeProvider>
        <div>
          <Header />
          {children}
          <Footer />
          <CartDrawer />
          <CartToast />
        </div>
      </HeroThemeProvider>
    </CartProvider>
  );
}
