import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Tag, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');

  useEffect(() => {
    apiFetch('/api/health')
      .then(res => res.json())
      .then(data => setDbStatus(data.database))
      .catch(() => setDbStatus('disconnected'));

    apiFetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
          setFilteredProducts(data);
        } else {
          console.error('Expected array of products, got:', data);
          setProducts([]);
          setFilteredProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const handleBuyNow = (product: any) => {
    addToCart(product);
    navigate('/cart');
  };

  if (loading) return <div className="flex justify-center p-20">Loading products...</div>;

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden bg-indigo-600 p-8 md:p-16 text-white">
        <div className="absolute top-4 right-4 z-20">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
            dbStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            dbStatus === 'loading' ? 'bg-white/10 text-white/50 border border-white/20' :
            'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              dbStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
              dbStatus === 'loading' ? 'bg-white/30' :
              'bg-red-400'
            }`} />
            Database: {dbStatus}
          </span>
        </div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest">New Collection 2026</span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">Upgrade Your Lifestyle with Elibuy</h1>
          <p className="text-indigo-100 text-lg">Discover premium products from verified vendors across the globe. Fast delivery, secure payments.</p>
          <button 
            onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-900/20"
          >
            Shop Now
          </button>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
      </div>

      <div id="products-section" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Electronics', 'Fashion', 'Home'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-white border border-gray-100 text-gray-600 hover:border-indigo-600 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400">No products available in this category. Check back later!</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all group flex flex-col"
            >
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                <img 
                  src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-gray-900 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    4.8
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                  <Tag className="w-3 h-3" />
                  {product.category || 'General'}
                </div>
                <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-indigo-600">₦{product.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-400">{product.stock} in stock</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={() => addToCart(product)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-100 text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition-all"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Cart
                  </button>
                  <button 
                    onClick={() => handleBuyNow(product)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
