'use client';

import { useState, useEffect } from 'react';
import { Search, Package, AlertCircle, Check, History } from 'lucide-react';
import { InventoryItem } from '@/types';
import Navigation from '@/components/navigation';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateQuantities, setUpdateQuantities] = useState<Record<string, number>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [search, items]);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch inventory');
      }

      setItems(data.items);
      setFilteredItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch history');
      }

      setHistory(data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleUpdateQuantity = (itemId: string, value: number) => {
    setUpdateQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, value)
    }));
  };

  const handleUpdate = async (itemId: string, itemName: string) => {
    const useQuantity = updateQuantities[itemId] || 0;

    if (useQuantity === 0) {
      setError('Please enter a quantity to use');
      return;
    }

    setUpdating(prev => ({ ...prev, [itemId]: true }));
    setError(null);

    try {
      const response = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          use_quantity: useQuantity,
          notes: 'Manual update',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update inventory');
      }

      setSuccessMessage(`${itemName} updated successfully`);
      setUpdateQuantities(prev => ({ ...prev, [itemId]: 0 }));
      
      // Refresh inventory
      await fetchInventory();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleToggleHistory = async () => {
    if (!showHistory) {
      await fetchHistory();
    }
    setShowHistory(!showHistory);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Inventory</h1>
            <p className="text-gray-600">Manage current inventory levels</p>
          </div>
          <button
            onClick={handleToggleHistory}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <History className="w-5 h-5" />
            {showHistory ? 'Hide History' : 'View History'}
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {showHistory && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Inventory History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Item</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Quantity Change</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(record.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">{record.action}</td>
                      <td className="py-4 px-4 text-gray-600">{record.inventory?.name || 'N/A'}</td>
                      <td className={`py-4 px-4 font-medium ${record.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {record.quantity_change > 0 ? '+' : ''}{record.quantity_change}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {search ? 'No items found matching your search.' : 'No inventory items yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Item</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Current Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Use Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">{item.name}</td>
                      <td className="py-4 px-4 text-gray-600">{item.quantity}</td>
                      <td className="py-4 px-4">
                        <input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={updateQuantities[item.id] || ''}
                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleUpdate(item.id, item.name)}
                          disabled={updating[item.id] || (updateQuantities[item.id] || 0) === 0}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {updating[item.id] ? 'Updating...' : 'Update'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
