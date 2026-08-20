import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, SlidersHorizontal, Sparkles, ArrowUpDown, X, Tag, Check, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { formatIQD } from '../utils/formatters';

export const ShopView: React.FC = () => {
  const { products, categories, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();

  const [priceRange, setPriceRange] = useState<number>(120000);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [onlySale, setOnlySale] = useState<boolean>(false);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Available Sizes across products
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.sizes?.forEach(s => set.add(s)));
    return Array.from(set);
  }, [products]);

  // Available Colors across products
  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach(p => p.colors?.forEach(c => map.set(c.name, c.hex)));
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category filter
        if (selectedCategory !== 'all' && selectedCategory !== 'الكل' && p.category !== selectedCategory) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Price range filter
        if (p.price > priceRange) return false;

        // Size filter
        if (selectedSize !== 'all' && !p.sizes?.includes(selectedSize)) return false;

        // Color filter
        if (selectedColor !== 'all' && !p.colors?.some(c => c.name === selectedColor)) return false;

        // Sale filter
        if (onlySale && !p.isOnSale && (!p.discountPercentage || p.discountPercentage <= 0)) return false;

        // Stock filter
        if (onlyInStock && p.stock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, selectedCategory, searchQuery, priceRange, selectedSize, selectedColor, onlySale, onlyInStock, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange(120000);
    setSelectedSize('all');
    setSelectedColor('all');
    setOnlySale(false);
    setOnlyInStock(false);
    setSortBy('newest');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    priceRange < 120000 ||
    selectedSize !== 'all' ||
    selectedColor !== 'all' ||
    onlySale ||
    onlyInStock;

  return (
    <div className="py-10 bg-[#faf8f7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-right space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8edf1] text-[#5a1e35] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>متجر أزياء 4sHe بالموصل</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
            كافة التشكيلات النسائية
          </h1>
          <p className="text-sm text-gray-500 max-w-xl">
            استعرضي أرقى الفساتين، الأطقم والبلايز مع إمكانية التصفية بحسب المقاس، اللون، والتصنيف
          </p>
        </div>

        {/* Categories Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#5a1e35] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            جميع التصنيفات ({products.length})
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.name
                  ? 'bg-[#5a1e35] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.name} ({products.filter(p => p.category === cat.name).length})
            </button>
          ))}
        </div>

        {/* Toolbar: Search, Sort, Mobile Filter Button */}
        <div className="bg-white p-4 rounded-2xl border border-[#eedfd9] shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحثي بالاسم أو الوصف..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-9 py-2 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#5a1e35] focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden px-3.5 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>الفلاتر {hasActiveFilters && '• (مفعّلة)'}</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 shrink-0">الترتيب:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:border-[#5a1e35]"
              >
                <option value="newest">الأحدث وصولًا</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييمًا</option>
              </select>
            </div>

            {/* Results Counter */}
            <span className="text-xs text-gray-500 hidden sm:inline">
              عرض <strong>{filteredProducts.length}</strong> من <strong>{products.length}</strong> قطعة
            </span>
          </div>
        </div>

        {/* Main Grid + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar (Desktop) */}
          <aside className={`lg:col-span-3 space-y-6 text-right ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-5 rounded-3xl border border-[#eedfd9] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-[#5a1e35]" />
                  <span>تصفية المنتجات</span>
                </h3>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[11px] text-rose-600 hover:underline font-bold"
                  >
                    إعادة ضبط
                  </button>
                )}
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>السعر حتى:</span>
                  <span className="text-[#5a1e35] font-bold">{formatIQD(priceRange)}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="120000"
                  step="5000"
                  value={priceRange}
                  onChange={e => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#5a1e35]"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>20,000 د.ع</span>
                  <span>120,000 د.ع</span>
                </div>
              </div>

              {/* Size Filter */}
              {allSizes.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-800">المقاس</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedSize('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        selectedSize === 'all'
                          ? 'border-[#5a1e35] bg-[#5a1e35] text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      الكل
                    </button>
                    {allSizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          selectedSize === size
                            ? 'border-[#5a1e35] bg-[#5a1e35] text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Filter */}
              {allColors.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-800">اللون</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedColor('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        selectedColor === 'all'
                          ? 'border-[#5a1e35] bg-[#5a1e35] text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      جميع الألوان
                    </button>
                    {allColors.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border transition-all ${
                          selectedColor === c.name
                            ? 'border-[#5a1e35] bg-[#fcedf1] text-[#5a1e35]'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Toggles: On Sale & In Stock */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer p-2 rounded-xl hover:bg-gray-50">
                  <span className="font-semibold">القطع المخفضة فقط</span>
                  <input
                    type="checkbox"
                    checked={onlySale}
                    onChange={e => setOnlySale(e.target.checked)}
                    className="w-4 h-4 accent-[#5a1e35] rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer p-2 rounded-xl hover:bg-gray-50">
                  <span className="font-semibold">المتوفر في المخزون فقط</span>
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={e => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 accent-[#5a1e35] rounded"
                  />
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#eedfd9] space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#fcedf1] text-[#5a1e35] flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900">لا توجد نتائج تطابق بحثكِ</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    جربي تغيير معايير البحث أو تصفية السعر أو اختيار تصنيف مختلف
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-xl bg-[#5a1e35] text-white text-xs font-bold shadow-md hover:bg-[#431424] transition-all cursor-pointer"
                >
                  إلغاء جميع الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
