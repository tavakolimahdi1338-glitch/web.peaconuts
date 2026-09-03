import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ProductModal } from './components/ProductModal';
import { ToastContainer } from './components/ToastContainer';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { SupportPage } from './pages/SupportPage';
import { AboutPage } from './pages/AboutPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

import type { Product } from './types';

const MainApp: React.FC = () => {
  const { currentView, adminToken } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // If viewing admin panel
  if (currentView === 'admin') {
    if (!adminToken) {
      return (
        <div className="min-h-screen bg-[#faf7f2] text-[#451a03]">
          <Navbar onOpenCart={() => setIsCartOpen(true)} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminLoginPage />
          </main>
          <Footer />
          <ToastContainer />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#faf7f2] text-[#451a03]">
        <AdminDashboard />
        <ToastContainer />
      </div>
    );
  }

  if (currentView === 'admin-login') {
    return (
      <div className="min-h-screen bg-[#faf7f2] text-[#451a03] flex flex-col justify-between">
        <Navbar onOpenCart={() => setIsCartOpen(true)} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <AdminLoginPage />
        </main>
        <Footer />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#451a03] flex flex-col justify-between selection:bg-amber-200">
      <div>
        <Navbar onOpenCart={() => setIsCartOpen(true)} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {currentView === 'home' && (
            <HomePage onSelectProduct={(p) => setSelectedProduct(p)} />
          )}
          {currentView === 'shop' && (
            <ShopPage onSelectProduct={(p) => setSelectedProduct(p)} />
          )}
          {currentView === 'checkout' && <CheckoutPage />}
          {currentView === 'track' && <TrackOrderPage />}
          {currentView === 'support' && <SupportPage />}
          {currentView === 'about' && <AboutPage />}
        </main>
      </div>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Global Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
