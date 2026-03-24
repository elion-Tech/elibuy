import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { apiFetch } from '../utils/api';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total, clearCart, loading: cartLoading, error: cartError } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [retryCount, setRetryCount] = useState(0);

  const config = useMemo(() => ({
    reference: (new Date()).getTime().toString(),
    email: user?.email || '',
    amount: Math.round(total * 100), // Paystack expects amount in kobo
    publicKey: (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '').trim(),
  }), [user, total, retryCount]);

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    setLoading(true);
    try {
      console.log('Payment successful, creating order...');
      
      const orderPayload = {
        payment_reference: reference.reference,
      };

      // Use the dedicated REST endpoint we've been using
      const res = await apiFetch('/api/orders/from-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log('Order created successfully:', responseData);
        clearCart();
        navigate('/dashboard');
        alert(`Payment Successful! Order placed.\nOrder ID: ${responseData.orderId}`);
      } else {
        let errorMessage = `Server error: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Order creation failed. Server response:', errorData);
        } catch (e) {
          console.error('Order creation failed. Could not parse JSON response:', res);
          const text = await res.text();
          console.error('Raw response:', text);
        }
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error processing order. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    alert('Payment cancelled.');
    setRetryCount(prev => prev + 1); // Regenerate reference for next attempt
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.email) {
      alert('Please update your email in profile to proceed.');
      return;
    }


    const publicKey = (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '').trim();
    if (!publicKey || publicKey === '') {
      const proceed = confirm(
        "Paystack Public Key is not configured. \n\n" +
        "To use real payments, please set VITE_PAYSTACK_PUBLIC_KEY in your environment variables. \n\n" +
        "Would you like to simulate a successful payment for demo purposes instead?"
      );
      
      if (proceed) {
        // Simulate Paystack success
        onSuccess({ reference: 'DEMO-' + Date.now() });
      }
      return;
    }

    initializePayment(onSuccess, onClose);
  };

  if (cartLoading && items.length === 0) { // Show loading only on initial load
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Loading your cart...</h2>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Error loading cart</h2>
        <p className="text-gray-500">{cartError}</p>
        <button onClick={() => window.location.reload()} className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all">
          Try Again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500">Looks like you haven't added anything to your cart yet.</p>
        </div>
        <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 items-center">
              <img 
                src={(item.image_url && item.image_url.startsWith('http')) ? item.image_url : `https://picsum.photos/seed/${item.id}/200/200`} 
                alt={item.name} 
                className="w-24 h-24 object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">Quantity:</p>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-full">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-gray-400 hover:text-indigo-600" disabled={cartLoading}>
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-gray-400 hover:text-indigo-600" disabled={cartLoading}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-indigo-600 font-bold">₦{item.price.toLocaleString()}</p>
              </div>
              <button 
                type="button"
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50" disabled={cartLoading}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₦{total.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-50 pt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-indigo-600">₦{total.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || cartLoading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Processing...' : (
              <>
                Pay ₦{total.toLocaleString()}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Secure payment powered by Paystack
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
