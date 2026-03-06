import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  Settings, 
  PlusCircle,
  BarChart3,
  ClipboardList,
  Store
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = {
    ADMIN: [
      { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
      { icon: Users, label: 'Users', path: '/dashboard/users' },
      { icon: Store, label: 'Vendors', path: '/dashboard/vendors' },
      { icon: ShoppingCart, label: 'All Orders', path: '/dashboard/orders' },
      { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ],
    VENDOR: [
      { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
      { icon: Package, label: 'My Products', path: '/dashboard/products' },
      { icon: PlusCircle, label: 'Add Product', path: '/dashboard/products/add' },
      { icon: ClipboardList, label: 'Orders', path: '/dashboard/orders' },
      { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    ],
    SHOPPER: [
      { icon: LayoutDashboard, label: 'My Account', path: '/dashboard' },
      { icon: ShoppingCart, label: 'Order History', path: '/dashboard/orders' },
      { icon: Settings, label: 'Profile Settings', path: '/dashboard/settings' },
    ],
    LOGISTICS: [
      { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
      { icon: Truck, label: 'Deliveries', path: '/dashboard/deliveries' },
      { icon: ClipboardList, label: 'History', path: '/dashboard/history' },
    ],
  };

  const currentMenu = menuItems[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-[calc(100vh-64px)] sticky top-16 hidden md:block">
      <div className="p-6 space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Main Menu</p>
        {currentMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
              location.pathname === item.path 
                ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4 transition-colors",
              location.pathname === item.path ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
            )} />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
};
