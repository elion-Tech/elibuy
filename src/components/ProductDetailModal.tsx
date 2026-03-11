import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, CreditCard, Tag, Star } from 'lucide-react';
import { motion } from 'motion/react';

const ProductDetailModal = ({ product, onClose }: { product: any, onClose: () => void }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (product: any) => {
    addToCart(product);
    navigate('/cart');
  };

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10">
          <X className="w-6 h-6" />
        </button>
        
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
          <img
            src={product.image_url || `https://picsum.photos/seed/${product.id}/800/800`}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col space-y-6 overflow-y-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">
            <Tag className="w-4 h-4" />
            {product.category || 'General'}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
          
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-indigo-600">₦{product.price.toLocaleString()}</span>
            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              4.8
            </div>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed flex-1">
            {product.description || 'No description available for this product. It is a high-quality item perfect for your needs.'}
          </p>

          <div className="text-sm font-medium text-gray-500">{product.stock} units in stock</div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => addToCart(product)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-indigo-100 text-indigo-600 font-bold hover:bg-indigo-50 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={() => handleBuyNow(product)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
            >
              <CreditCard className="w-4 h-4" />
              Buy Now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetailModal;