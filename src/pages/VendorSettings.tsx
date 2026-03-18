import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Save, Loader2, MapPin } from 'lucide-react';

const ZONES = [
  { key: 'sameState', label: 'Within Same State' },
  { key: 'northCentral', label: 'North Central (NC)' },
  { key: 'northEast', label: 'North East (NE)' },
  { key: 'northWest', label: 'North West (NW)' },
  { key: 'southEast', label: 'South East (SE)' },
  { key: 'southSouth', label: 'South South (SS)' },
  { key: 'southWest', label: 'South West (SW)' },
];

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 
  'Yobe', 'Zamfara'
];

const VendorSettings = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [state, setState] = useState('');
  const [logistics, setLogistics] = useState<any>({});

  useEffect(() => {
    // Fetch current user settings to populate form
    apiFetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        // @ts-ignore
        if (data.vendorSettings) {
            // @ts-ignore
            setState(data.vendorSettings.state || '');
            // @ts-ignore
            setLogistics(data.vendorSettings.logistics || {});
        }
        setFetching(false);
    });
  }, [token]);

  const handlePriceChange = (zone: string, value: string) => {
    setLogistics({ ...logistics, [zone]: parseFloat(value) || 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vendorSettings: {
            state,
            logistics
          }
        })
      });

      if (res.ok) {
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-10 text-center">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Logistics Configuration</h1>
          <p className="text-gray-500">Set your base shipping rates based on geopolitical zones.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Your Business Location (State)
            </label>
            <select 
              value={state} 
              onChange={(e) => setState(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all"
              required
            >
              <option value="">Select State</option>
              {NIGERIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400">This is used as the reference point for calculations.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Zone Pricing (₦)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ZONES.map((zone) => (
                <div key={zone.key} className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{zone.label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                    <input
                      type="number"
                      value={logistics[zone.key] || ''}
                      onChange={(e) => handlePriceChange(zone.key, e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 text-right font-bold"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Configuration</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorSettings;