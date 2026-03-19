import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { apiFetch } from '../utils/api';

const NIGERIAN_STATES = [
  { name: 'Abia', capital: 'Umuahia' },
  { name: 'Abuja', capital: 'FCT' },
  { name: 'Adamawa', capital: 'Yola' },
  { name: 'Akwa Ibom', capital: 'Uyo' },
  { name: 'Anambra', capital: 'Awka' },
  { name: 'Bauchi', capital: 'Bauchi' },
  { name: 'Bayelsa', capital: 'Yenagoa' },
  { name: 'Benue', capital: 'Makurdi' },
  { name: 'Borno', capital: 'Maiduguri' },
  { name: 'Cross River', capital: 'Calabar' },
  { name: 'Delta', capital: 'Asaba' },
  { name: 'Ebonyi', capital: 'Abakaliki' },
  { name: 'Edo', capital: 'Benin City' },
  { name: 'Ekiti', capital: 'Ado Ekiti' },
  { name: 'Enugu', capital: 'Enugu' },
  { name: 'Gombe', capital: 'Gombe' },
  { name: 'Imo', capital: 'Owerri' },
  { name: 'Jigawa', capital: 'Dutse' },
  { name: 'Kaduna', capital: 'Kaduna' },
  { name: 'Kano', capital: 'Kano' },
  { name: 'Katsina', capital: 'Katsina' },
  { name: 'Kebbi', capital: 'Birnin Kebbi' },
  { name: 'Kogi', capital: 'Lokoja' },
  { name: 'Kwara', capital: 'Ilorin' },
  { name: 'Lagos', capital: 'Ikeja' },
  { name: 'Nasarawa', capital: 'Lafia' },
  { name: 'Niger', capital: 'Minna' },
  { name: 'Ogun', capital: 'Abeokuta' },
  { name: 'Ondo', capital: 'Akure' },
  { name: 'Osun', capital: 'Osogbo' },
  { name: 'Oyo', capital: 'Ibadan' },
  { name: 'Plateau', capital: 'Jos' },
  { name: 'Rivers', capital: 'Port Harcourt' },
  { name: 'Sokoto', capital: 'Sokoto' },
  { name: 'Taraba', capital: 'Jalingo' },
  { name: 'Yobe', capital: 'Damaturu' },
  { name: 'Zamfara', capital: 'Gusau' },
  { name: 'International', capital: 'Worldwide' }
];

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    state: '',
    lga: '',
    streetAddress: ''
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [isInternational, setIsInternational] = useState(false);
  const [loadingShippingCost, setLoadingShippingCost] = useState(false);
  const [availableStates] = useState(NIGERIAN_STATES);

  const config = useMemo(() => ({
    reference: (new Date()).getTime().toString(),
    email: user?.email || '',
    amount: Math.round((total + shippingCost) * 100), // Paystack expects amount in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key',
  }), [user, total, shippingCost]);

  useEffect(() => {
    // Debounce or only calculate if state/lga are present to avoid initial empty calls
    if (shippingDetails.state && shippingDetails.lga) calculateShipping();
  }, [shippingDetails]);

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    setLoading(true);
    try {
      // 1. Verify payment on backend
      const verifyRes = await apiFetch('/api/orders/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reference: reference.reference })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || verifyData.status !== 'success') {
        throw new Error('Payment verification failed');
      }

      // 2. Create order
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: items.map(item => ({ ...item, product_id: item.id })),
          total_amount: total + shippingCost,
          shippingDetails,
          payment_reference: reference.reference
        })
      });

      if (res.ok) {
        clearCart();
        navigate('/dashboard');
        alert('Payment Successful! Order placed.');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create order');
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


    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey || publicKey === 'pk_test_your_public_key' || publicKey === '') {
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

  const calculateShipping = async () => {
    setLoadingShippingCost(true);
    setIsInternational(false);
    try {
      const res = await apiFetch('/api/orders/cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: shippingDetails.state,
          lga: shippingDetails.lga,
          items: items.map(item => ({ product_id: item.id, ...item })) // Send items for free shipping check
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.isInternational) {
          setIsInternational(true);
          setShippingCost(0);
        } else {
          setShippingCost(data.shippingCost);
        }
      } else {
        console.error('Failed to calculate shipping cost:', data.error);
        if (data.error) alert(data.error); // Alert the user (e.g., "Wrong state inputted")
        setShippingCost(0);
      }
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      setShippingCost(0);
    } finally {
      setLoadingShippingCost(false);
    }
  };

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
                src={item.image_url || `https://picsum.photos/seed/${item.id}/200/200`} 
                alt={item.name} 
                className="w-24 h-24 object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">Quantity:</p>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-full">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-gray-400 hover:text-indigo-600">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-gray-400 hover:text-indigo-600">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-indigo-600 font-bold">₦{item.price.toLocaleString()}</p>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Shipping Details</h3>
           <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 px-1">State</label>
              <input type="text" list="state-suggestions" required value={shippingDetails.state} onChange={(e) => setShippingDetails({...shippingDetails, state: e.target.value})} className="w-full pl-4 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="Enter state" />
              <datalist id="state-suggestions">
                {availableStates.map((s) => (
                  <option key={s.name} value={s.name}>{s.capital}</option>
                ))}
              </datalist>
            </div>

             <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 px-1">LGA</label>
              <input type="text" required value={shippingDetails.lga} onChange={(e) => setShippingDetails({...shippingDetails, lga: e.target.value})} className="w-full pl-4 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="Enter LGA" />
            </div>

             <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 px-1">Street Address</label>
              <input type="text" required value={shippingDetails.streetAddress} onChange={(e) => setShippingDetails({...shippingDetails, streetAddress: e.target.value})} className="w-full pl-4 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="Enter street address" />
            </div>
        </div>

        <button onClick={calculateShipping} className="w-full bg-gray-800 text-white py-3 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {loadingShippingCost ? 'Calculating...' : 'Calculate Shipping'}
        </button>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₦{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              {isInternational ? (
                <span className="text-orange-600 font-bold text-xs text-right">International (Contact Vendor)</span>
              ) : (
                <span className="text-emerald-600 font-bold">₦{shippingCost.toLocaleString()}</span>
              )}
            </div>
            <div className="border-t border-gray-50 pt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-indigo-600">₦{(total + shippingCost).toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || !shippingDetails.streetAddress}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Processing...' : (
              <>
                Pay ₦{(total + shippingCost).toLocaleString()}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Secure payment powered by Paystack
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
              <Truck className="w-4 h-4 text-indigo-500" />
              Delivery fees are calculated based on location
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
