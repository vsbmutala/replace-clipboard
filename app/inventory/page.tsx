'use client';

import { useState, useEffect } from 'react';
import { Search, Package, AlertCircle, Check, History, TrendingUp, TrendingDown, Box, BarChart3, Plus, Edit, Trash2, LayoutGrid, Table } from 'lucide-react';
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, unit: 'units' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  const handleAddItem = async () => {
    if (!newItem.name || newItem.quantity < 0) return;

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item');
      }

      setSuccessMessage(`${newItem.name} added successfully`);
      setNewItem({ name: '', quantity: 0, unit: 'units' });
      setShowAddModal(false);
      
      // Refresh inventory
      await fetchInventory();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  const handleEditItem = async () => {
    if (!editItem || !editItem.name || editItem.quantity < 0) return;

    try {
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editItem),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update item');
      }

      setSuccessMessage(`${editItem.name} updated successfully`);
      setEditItem(null);
      setShowEditModal(false);
      
      // Refresh inventory
      await fetchInventory();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;

    try {
      const response = await fetch(`/api/inventory?id=${deleteItemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete item');
      }

      setSuccessMessage('Item deleted successfully');
      setDeleteItemId(null);
      setShowDeleteModal(false);
      
      // Refresh inventory
      await fetchInventory();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-gray-700 text-xl">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight">Inventory Dashboard</h1>
              <p className="text-gray-600 text-lg">Manage and track your kitchen inventory in real-time</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-105 shadow-md"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>
              <button
                onClick={handleToggleHistory}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-sm"
              >
                <History className="w-5 h-5" />
                {showHistory ? 'Hide History' : 'View History'}
              </button>
              <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'cards' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'table' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Table className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Items</p>
                <p className="text-4xl font-bold text-white">{items.length}</p>
              </div>
              <Box className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Low Stock Items</p>
                <p className="text-4xl font-bold text-white">{items.filter(item => item.quantity < 10).length}</p>
              </div>
              <TrendingDown className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 flex items-center gap-3 animate-pulse shadow-lg">
            <Check className="w-6 h-6 text-white flex-shrink-0" />
            <p className="text-white font-medium">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
            <p className="text-white font-medium">{error}</p>
          </div>
        )}

        {showHistory && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <History className="w-6 h-6" />
              Inventory History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity Change</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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

        {/* Search Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Inventory Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-lg">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <p className="text-gray-500 text-xl">
              {search ? 'No items found matching your search.' : 'No inventory items yet.'}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:scale-105 hover:shadow-xl transition-all duration-300 group shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                    <p className="text-gray-500 text-sm">{item.quantity < 10 ? 'Low Stock' : 'In Stock'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${item.quantity < 10 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                      {item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                    </div>
                    <button
                      onClick={() => {
                        setEditItem(item);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteItemId(item.id);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm">Current Quantity</span>
                    <span className="text-3xl font-bold text-gray-900">{item.quantity} <span className="text-lg font-normal text-gray-500">{item.unit}</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${item.quantity < 10 ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                      style={{ width: `${Math.min((item.quantity / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    max={item.quantity}
                    value={updateQuantities[item.id] || ''}
                    onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                    placeholder="Use quantity"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                  <button
                    onClick={() => handleUpdate(item.id, item.name)}
                    disabled={updating[item.id] || (updateQuantities[item.id] || 0) === 0}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md"
                  >
                    {updating[item.id] ? '...' : 'Use'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-indigo-500">
                    <th className="text-left py-4 px-6 font-semibold text-white">Item</th>
                    <th className="text-left py-4 px-6 font-semibold text-white">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-white">Quantity</th>
                    <th className="text-left py-4 px-6 font-semibold text-white">Progress</th>
                    <th className="text-left py-4 px-6 font-semibold text-white">Use Quantity</th>
                    <th className="text-left py-4 px-6 font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${item.quantity < 10 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                          {item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-2xl font-bold text-gray-900">{item.quantity}</span>
                        <span className="text-gray-500 ml-1">{item.unit}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${item.quantity < 10 ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                            style={{ width: `${Math.min((item.quantity / 50) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={updateQuantities[item.id] || ''}
                            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          />
                          <button
                            onClick={() => handleUpdate(item.id, item.name)}
                            disabled={updating[item.id] || (updateQuantities[item.id] || 0) === 0}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md"
                          >
                            {updating[item.id] ? '...' : 'Use'}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditItem(item);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteItemId(item.id);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Item</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Enter item name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="Enter quantity"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="e.g., lbs, boxes, units"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewItem({ name: '', quantity: 0, unit: 'units' });
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.name || newItem.quantity < 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditModal && editItem && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Item</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={editItem.name}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    placeholder="Enter item name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={editItem.quantity}
                    onChange={(e) => setEditItem({ ...editItem, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="Enter quantity"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    value={editItem.unit}
                    onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                    placeholder="e.g., lbs, boxes, units"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditItem(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditItem}
                  disabled={!editItem.name || editItem.quantity < 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Item</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteItemId(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
