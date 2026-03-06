import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, DollarSign, Image as ImageIcon, Tag, Loader2, ArrowLeft } from 'lucide-react';
import { apiFetch } from '../utils/api';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category: 'Electronics'
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setFormData({
            name: data.name,
            description: data.description,
            price: data.price.toString(),
            stock: data.stock.toString(),
            image_url: data.image_url || '',
            category: data.category
          });
        } else {
          setError(data.error || 'Failed to fetch product data.');
        }
      })
      .catch(() => setError('An unexpected error occurred.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const res = await apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        })
      });

      if (res.ok) {
        navigate('/dashboard/products');
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to update product.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading product details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500">Update the details for your product.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 px-1">Product Name</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="e.g. Wireless Headphones" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 px-1">Price (₦)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 px-1">Stock Quantity</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="number" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="10" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 px-1">Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="https://example.com/image.jpg" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 px-1">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {['Electronics', 'Fashion', 'Home'].map((cat) => (
                <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })} className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${ formData.category === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-indigo-200' }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 px-1">Description</label>
            <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all min-h-[120px]" placeholder="Tell us about your product..." />
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 disabled:opacity-70">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;