import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, Truck, Store, Search, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">Elibuy</Link>
            <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-1.5 border border-gray-100">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-64"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Shop</Link>
            {user && (
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-indigo-700">{user.role}</span>
                </div>
                <button 
                  onClick={() => { logout(); navigate('/login'); }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-4 py-2">Login</Link>
                <Link to="/signup" className="text-sm font-medium bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-sm">Sign up</Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4">
          <Link to="/" className="block text-sm font-medium text-gray-600">Shop</Link>
          <Link to="/cart" className="block text-sm font-medium text-gray-600">Cart ({items.length})</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-sm font-medium text-gray-600">Dashboard</Link>
              <button onClick={logout} className="block text-sm font-medium text-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm font-medium text-gray-600">Login</Link>
              <Link to="/signup" className="block text-sm font-medium text-indigo-600">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
