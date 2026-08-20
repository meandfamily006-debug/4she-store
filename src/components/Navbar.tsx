import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, User, Menu, X, Phone, MapPin, Sparkles, Shield, ChevronDown, SlidersHorizontal, LogOut, Check } from 'lucide-react';
import { useStore, ActivePage } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatIQD } from '../utils/formatters';

export const Navbar: React.FC = () => {
  const { activePage, setActivePage, searchQuery, setSearchQuery, wishlist, settings } = useStore();
  const { itemCount, subtotal, setIsCartDrawerOpen } = useCart();
  const { customer, isAuthenticated, openAuthModal, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks: { label: string; page: ActivePage }[] = [
    { label: 'الرئيسية', page: 'home' },
    { label: 'المتجر', page: 'shop' },
    { label: 'التصنيفات', page: 'categories' },
    { label: 'العروض والتخفيضات', page: 'offers' },
    { label: 'من نحن', page: 'about' },
    { label: 'تواصل معنا', page: 'contact' },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E1DA] shadow-xs">
      {/* Top Announcement Bar */}
      {settings?.showAnnouncement && (
        <div className="bg-[#3B322A] text-white py-1.5 px-4 text-xs font-medium tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-[#D7C4B7] shrink-0" />
              <span>{settings.announcementText}</span>
            </div>
            <div className="hidden md:flex items-center gap-4 shrink-0 text-[#E8DDD5] text-[11px]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#D7C4B7]" />
                {settings.storeAddress.split('،')[0]}، الموصل
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#D7C4B7]" />
                {settings.storePhone}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Right Section: Mobile Menu Trigger + Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#2D2621] hover:bg-[#F2EAE4] transition-colors"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <button
              type="button"
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 text-right group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A3F35] to-[#2D2621] text-white flex items-center justify-center font-serif-brand font-bold text-xl shadow-md group-hover:scale-105 transition-transform border border-[#6B5E54]/30">
                4s
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black tracking-tight text-[#2D2621]">
                    أزياء
                  </span>
                  <span className="text-xl font-black text-[#A67C52] font-serif-brand">
                    4sHe
                  </span>
                </div>
                <span className="block text-[10px] font-semibold text-[#8C7D73] tracking-wider">
                  الموصل • أسواق المثنى
                </span>
              </div>
            </button>
          </div>

          {/* Center Section: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map(link => {
              const isActive = activePage === link.page;
              return (
                <button
                  key={link.page}
                  type="button"
                  id={`nav-link-${link.page}`}
                  onClick={() => handleNavClick(link.page)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                    isActive
                      ? 'text-[#4A3F35] bg-[#F2EAE4] shadow-2xs font-bold'
                      : 'text-[#5C5046] hover:text-[#4A3F35] hover:bg-[#F4EBE8]'
                  }`}
                >
                  {link.label}
                  {link.page === 'offers' && (
                    <span className="mr-1.5 px-1.5 py-0.5 rounded-full bg-[#A67C52] text-white text-[10px] font-bold">
                      خصم
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Left Section: Search, Wishlist, User, Cart, Admin */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input on Desktop / Search Icon on Mobile */}
            <div className="relative">
              <button
                type="button"
                id="search-toggle-btn"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (activePage !== 'shop') setActivePage('shop');
                }}
                className="p-2.5 rounded-full text-[#5C5046] hover:bg-[#F2EAE4] hover:text-[#4A3F35] transition-colors"
                title="البحث عن منتج"
              >
                <Search className="w-5 h-5" />
              </button>

              {isSearchOpen && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#E8E1DA] p-2 z-50">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-[#8C7D73] absolute right-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="ابحثي عن فستان، طقم، بلوزة..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setActivePage('shop');
                          setIsSearchOpen(false);
                        }
                      }}
                      className="w-full pl-8 pr-9 py-2 text-xs bg-[#FAF8F5] rounded-xl border border-[#E8E1DA] focus:outline-none focus:border-[#4A3F35] focus:bg-white text-[#2D2621]"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute left-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              id="wishlist-btn"
              onClick={() => handleNavClick('profile')}
              className="relative p-2.5 rounded-full text-[#5C5046] hover:bg-[#F2EAE4] hover:text-[#4A3F35] transition-colors"
              title="المفضلة"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-[#A67C52] fill-[#A67C52]' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute 0 top-1 right-1 w-4 h-4 rounded-full bg-[#4A3F35] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User Account / Login Button */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    id="user-menu-btn"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full bg-[#F2EAE4] text-[#4A3F35] font-semibold text-xs border border-[#E8DDD5] hover:bg-[#EAE0D8] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#A67C52]" />
                    <span className="hidden md:inline max-w-[90px] truncate">
                      {customer?.name || customer?.phone || 'حسابي'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8E1DA] p-2 z-50 space-y-1">
                      <div className="px-3 py-2 border-b border-[#E8E1DA]">
                        <p className="text-xs font-bold text-[#2D2621] truncate">
                          {customer?.name || 'عميلة أزياء 4sHe'}
                        </p>
                        <p className="text-[11px] text-[#8C7D73] font-mono dir-ltr text-right">
                          {customer?.phone}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleNavClick('profile');
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl text-xs font-medium text-[#4A3F35] hover:bg-[#F4EBE8] flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-[#A67C52]" />
                        <span>حسابي وطلباتي</span>
                      </button>

                      {/* Admin Dashboard - visible only to staff or clearly tagged */}
                      {(customer?.role === 'manager' || customer?.role === 'worker' || customer?.phone === '07707440557') && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleNavClick('admin');
                          }}
                          className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50/70 hover:bg-amber-100/80 flex items-center justify-between gap-2 border border-amber-200/50"
                        >
                          <span className="flex items-center gap-2">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-800" />
                            <span>لوحة إدارة المتجر</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-200/70 text-amber-900 font-black">
                            {customer?.role === 'manager' ? 'مدير' : 'كادر'}
                          </span>
                        </button>
                      )}

                      <div className="pt-1 border-t border-[#E8E1DA]">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-right px-3 py-2 rounded-xl text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  id="navbar-login-btn"
                  onClick={openAuthModal}
                  className="px-3.5 py-2 rounded-xl bg-[#F2EAE4] hover:bg-[#4A3F35] hover:text-white text-[#4A3F35] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-[#E8DDD5]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </button>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              type="button"
              id="navbar-cart-btn"
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#4A3F35] hover:bg-[#3B322A] text-white shadow-md shadow-[#4A3F35]/20 hover:shadow-lg transition-all cursor-pointer border border-[#6B5E54]/30"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#A67C52] text-white text-[10px] font-black flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold">
                {subtotal > 0 ? formatIQD(subtotal) : 'السلة'}
              </span>
            </button>

            {/* Quick Admin Toggle Icon */}
            <button
              type="button"
              id="admin-dashboard-toggle-btn"
              onClick={() => handleNavClick('admin')}
              className={`p-2 rounded-xl transition-colors ${
                activePage === 'admin'
                  ? 'bg-[#F2EAE4] text-[#A67C52]'
                  : 'text-[#8C7D73] hover:text-[#4A3F35] hover:bg-[#F4EBE8]'
              }`}
              title="لوحة الإدارة"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E1DA] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navLinks.map(link => {
              const isActive = activePage === link.page;
              return (
                <button
                  key={link.page}
                  type="button"
                  onClick={() => handleNavClick(link.page)}
                  className={`w-full text-right px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-[#4A3F35] text-white'
                      : 'text-[#4A3F35] hover:bg-[#F2EAE4]'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.page === 'offers' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#A67C52] text-white text-[11px] font-bold">
                      عروض خاصة
                    </span>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className="w-full text-right px-4 py-3 rounded-xl text-sm font-semibold text-[#A67C52] hover:bg-[#F2EAE4] flex items-center justify-between"
            >
              <span>لوحة الإدارة والتحكم</span>
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-3 border-t border-[#E8E1DA] flex items-center justify-between text-xs text-[#8C7D73]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#A67C52]" />
              أسواق المثنى، الموصل
            </span>
            <a
              href="tel:07707440557"
              className="flex items-center gap-1 text-[#4A3F35] font-bold"
            >
              <Phone className="w-3.5 h-3.5" />
              0770 744 0557
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
