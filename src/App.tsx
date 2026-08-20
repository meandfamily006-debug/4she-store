import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthGateModal } from './components/AuthGateModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';

// Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { OffersView } from './views/OffersView';
import { AboutUsView } from './views/AboutUsView';
import { ContactUsView } from './views/ContactUsView';
import { PoliciesView } from './views/PoliciesView';
import { UserProfileView } from './views/UserProfileView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { CategoriesSection } from './components/CategoriesSection';

const MainLayout: React.FC = () => {
  const { activePage } = useStore();

  const renderActiveView = () => {
    switch (activePage) {
      case 'home':
        return <HomeView />;
      case 'shop':
        return <ShopView />;
      case 'categories':
        return (
          <div className="py-8 bg-[#faf8f7] min-h-screen">
            <CategoriesSection />
            <div className="mt-8">
              <ShopView />
            </div>
          </div>
        );
      case 'offers':
        return <OffersView />;
      case 'about':
        return <AboutUsView />;
      case 'contact':
        return <ContactUsView />;
      case 'policies':
        return <PoliciesView />;
      case 'profile':
        return <UserProfileView />;
      case 'admin':
        return <AdminDashboardView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f7] text-gray-900 font-sans antialiased selection:bg-[#5a1e35] selection:text-white" dir="rtl">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderActiveView()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals & Drawers */}
      <AuthGateModal />
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <MainLayout />
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
