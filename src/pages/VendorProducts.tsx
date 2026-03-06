import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const VendorProducts = () => {
  const { token, user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/products')
      .then(res => res.json())
      .then(data => {
        // Filter products for this vendor
        const myProducts = data.filter((p: any) => p.vendor_id === user?.id);
        setProducts(myProducts);
        setLoading(false);
      });
  }, [user?.id]);

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiFetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to delete product.'}`);
      }
    } catch (error) {
      alert('An unexpected error occurred while deleting the product.');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading products...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 text-sm">Manage your inventory and product listings</p>
        </div>
        <Link 
          to="/dashboard/products/add"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search your products..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={product.image_url || `https://picsum.photos/seed/${product.id}/100/100`} 
                        alt="" 
                        className="w-12 h-12 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-bold text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {product.category || 'General'}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-indigo-600">₦{product.price.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`font-medium ${product.stock < 5 ? 'text-red-500' : 'text-gray-600'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/dashboard/products/edit/${product.id}`} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                          <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-200" />
                      </div>
                      <p className="text-gray-400 font-medium">No products found. Start by adding one!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorProducts;
