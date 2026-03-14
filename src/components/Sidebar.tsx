import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, ShoppingBag, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Truck } from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  let links: { to: string; icon: any; label: string }[] = [];

  switch (user.role) {
    case 'VENDOR':
      links = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { to: '/dashboard/products', icon: Package, label: 'My Products' },
        { to: '/dashboard/products/add', icon: PlusCircle, label: 'Add Product' },
        { to: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
        { to: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
      ];
      break;
    case 'ADMIN':
      links = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { to: '/dashboard/users', icon: Users, label: 'Users' },
        { to: '/dashboard/products', icon: Package, label: 'All Products' },
        { to: '/dashboard/orders', icon: ShoppingBag, label: 'All Orders' },
        { to: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
      ];
      break;
    case 'LOGISTICS':
      links = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { to: '/dashboard/deliveries', icon: Truck, label: 'Deliveries' },
      ];
      break;
    case 'SHOPPER':
      links = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
        { to: '/dashboard/orders', icon: ShoppingBag, label: 'My Orders' },
      ];
      break;
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
      <div className="p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{user.role} Menu</h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};