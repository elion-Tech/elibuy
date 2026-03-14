import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { 
  Users, 
  Store, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          apiFetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
          apiFetch('/api/orders/my', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();
        
        setStats(statsData && !statsData.error ? statsData : null);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} color="bg-blue-500" />
        <StatCard icon={Store} label="Total Vendors" value={stats?.totalVendors || 0} color="bg-purple-500" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats?.totalOrders || 0} color="bg-indigo-500" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₦${(stats?.totalRevenue || 0).toLocaleString()}`} color="bg-emerald-500" />
      </div>
      
      <div className="bg-white rounded-3xl border border-gray-100 p-8">
        <h3 className="text-xl font-bold mb-6">Recent Orders</h3>
        <OrderTable orders={orders} />
      </div>
    </div>
  );

  const renderVendorDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Package} label="My Products" value={stats?.myProducts || 0} color="bg-indigo-500" />
        <StatCard icon={ShoppingCart} label="My Orders" value={stats?.myOrders || 0} color="bg-blue-500" />
        <StatCard icon={TrendingUp} label="My Revenue" value={`₦${(stats?.myRevenue || 0).toLocaleString()}`} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Orders</h3>
            <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <OrderTable orders={orders} setOrders={setOrders} />
        </div>
        <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-bold">Grow your business</h3>
            <p className="text-indigo-100">Add more products to increase your visibility and sales on Elibuy.</p>
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Product
            </button>
          </div>
          <ArrowUpRight className="absolute -bottom-4 -right-4 w-48 h-48 text-white/10" />
        </div>
      </div>
    </div>
  );

  const renderShopperDashboard = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 flex items-center gap-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl text-indigo-600 font-bold">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold">Hello, {user?.name}!</h2>
          <p className="text-gray-500 text-sm">Welcome to your personal dashboard. Track your orders and manage your profile.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8">
        <h3 className="text-xl font-bold mb-6">My Order History</h3>
        <OrderTable orders={orders} setOrders={setOrders} />
      </div>
    </div>
  );

  const renderLogisticsDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard icon={Clock} label="Pending Deliveries" value={stats?.pendingDeliveries || 0} color="bg-orange-500" />
        <StatCard icon={CheckCircle2} label="Completed Today" value={stats?.completedDeliveries || 0} color="bg-emerald-500" />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8">
        <h3 className="text-xl font-bold mb-6">Active Deliveries</h3>
        <OrderTable orders={orders} setOrders={setOrders} isLogistics />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{user?.role} Dashboard</h1>
        <div className="text-sm text-gray-400 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {user?.role === 'ADMIN' && renderAdminDashboard()}
      {user?.role === 'VENDOR' && renderVendorDashboard()}
      {user?.role === 'SHOPPER' && renderShopperDashboard()}
      {user?.role === 'LOGISTICS' && renderLogisticsDashboard()}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`${color} p-3 rounded-2xl text-white`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const OrderTable = ({ orders, setOrders, isLogistics }: { orders: any[], setOrders: React.Dispatch<React.SetStateAction<any[]>>, isLogistics?: boolean }) => {
  const { token } = useAuth();

  
  const updateStatus = async (id: string, status: string) => {
    await apiFetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    setOrders(prevOrders => prevOrders.map(order => 
      order.id === id ? { ...order, status: status } : order
    ));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
            <th className="pb-4 px-4">Order ID</th>
            <th className="pb-4 px-4">Date</th>
            <th className="pb-4 px-4">Amount</th>
            <th className="pb-4 px-4">Status</th>
               <th className="pb-4 px-4">Shipping Details</th>


            {isLogistics && <th className="pb-4 px-4">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4 font-bold text-gray-900">#ORD-{order.id}</td>
              <td className="py-4 px-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
              <td className="py-4 px-4 font-bold text-indigo-600">₦{order.total_amount.toLocaleString()}</td>
              <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                  order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'PAID' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {order.status}
                </span>
              </td>

              <td className="py-4 px-4 text-sm text-gray-500">
                {order.shippingDetails?.streetAddress}, {order.shippingDetails?.lga}, {order.shippingDetails?.state}
              </td>
              {isLogistics && (
                <td className="py-4 px-4">
                  <select 
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-xs font-bold bg-gray-100 border-none rounded-lg focus:ring-indigo-600"
                    value={order.status}
                  >
                    <option value="PAID">Paid</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={isLogistics ? 5 : 4} className="py-10 text-center text-gray-400 italic">No orders found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
