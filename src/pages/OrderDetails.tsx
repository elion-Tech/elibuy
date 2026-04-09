import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Package, Truck, Calendar, CreditCard, ChevronLeft, MapPin } from 'lucide-react';

interface OrderItem {
  product_id: any;
  name: string;
  quantity: number;
  price: number;
  image_url: string;
  vendor_name: string;
  size?: string;
}

interface Order {
  _id: string;
  status: string;
  total_amount: number;
  createdAt: string;
  items: OrderItem[];
  shippingDetails: {
    streetAddress?: string;
    city?: string;
    state?: string;
    lga?: string;
    phoneNumber?: string;
  };
  payment_reference: string;
}

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiFetch(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch order details');
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchOrder();
  }, [id, token]);

  if (loading) return <div className="p-20 text-center text-gray-500">Loading order details...</div>;
  if (error) return <div className="p-20 text-center text-red-500">Error: {error}</div>;
  if (!order) return <div className="p-20 text-center">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
      </div>

      {/* Summary Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase">Order ID</p>
          <p className="font-mono text-sm">#{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase">Date</p>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-indigo-500" />
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase">Status</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            order.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {order.status}
          </span>
        </div>
        <div className="space-y-1 md:text-right">
          <p className="text-xs font-semibold text-gray-400 uppercase">Total Amount</p>
          <p className="text-xl font-bold text-indigo-600">₦{order.total_amount.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            Items Summary
          </h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4">
                <img 
                  src={(item.image_url && item.image_url.startsWith('http')) ? item.image_url : `https://picsum.photos/seed/${idx}/200/200`} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="text-xs text-gray-500">Vendor: {item.vendor_name}</p>
                  {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm">
                      <span className="text-gray-400 font-medium">{item.quantity} x</span> ₦{item.price.toLocaleString()}
                    </p>
                    <p className="font-bold text-indigo-600">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-500" />
              Shipping Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-gray-600">
                  {order.shippingDetails?.streetAddress || 'No address provided'}
                  <br />
                  {order.shippingDetails?.lga ? `${order.shippingDetails.lga}, ` : 'N/A, '}
                  {order.shippingDetails?.city ? `${order.shippingDetails.city}, ` : ''}
                  {order.shippingDetails?.state || 'N/A'}
                </p>
              </div>
              <div className="flex gap-3">
                <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-gray-600">{order.shippingDetails?.phoneNumber || 'No phone provided'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              Payment Info
            </h2>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase">Reference</p>
              <p className="text-sm font-mono text-gray-600 truncate">{order.payment_reference}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;