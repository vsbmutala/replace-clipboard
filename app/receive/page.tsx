'use client';

import { useState } from 'react';
import { Upload, Package, Check, AlertCircle } from 'lucide-react';
import { ExtractedItem } from '@/types';
import Navigation from '@/components/navigation';

export default function ReceivePage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract items');
      }

      setExtractedItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract items');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const updated = [...extractedItems];
    updated[index].quantity = Math.max(0, newQuantity);
    setExtractedItems(updated);
  };

  const handleUnitChange = (index: number, newUnit: string) => {
    const updated = [...extractedItems];
    updated[index].unit = newUnit;
    setExtractedItems(updated);
  };

  const handleConfirmShipment = async () => {
    if (!file || extractedItems.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_filename: file.name,
          items: extractedItems.map(item => ({
            name: item.name,
            expected_quantity: item.quantity,
            actual_quantity: item.quantity,
            unit: item.unit || 'units',
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm shipment');
      }

      setSuccess(true);
      setFile(null);
      setExtractedItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm shipment');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedItems([]);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight">Receive Shipment</h1>
        <p className="text-gray-600 text-lg mb-8">Upload invoice to extract inventory items</p>

        {success ? (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-center shadow-lg">
            <Check className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Shipment Confirmed!</h2>
            <p className="text-green-100 mb-6">Inventory has been updated successfully.</p>
            <button
              onClick={handleReset}
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-md"
            >
              Receive Another Shipment
            </button>
          </div>
        ) : extractedItems.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Review Extracted Items
              </h2>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl px-6 py-3 shadow-md">
                <p className="text-blue-100 text-sm font-medium">Total Items</p>
                <p className="text-2xl font-bold text-white">{extractedItems.length}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-900">{item.name}</td>
                      <td className="py-4 px-4">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                          className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <input
                          type="text"
                          value={item.unit || 'units'}
                          onChange={(e) => handleUnitChange(index, e.target.value)}
                          placeholder="units"
                          className="w-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleConfirmShipment}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? 'Confirming...' : 'Confirm Shipment'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Invoice</h3>
              <p className="text-gray-600 mb-6">Supported formats: Image (JPEG, PNG), PDF, Excel, CSV</p>
              
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-colors cursor-pointer shadow-md"
              >
                Choose File
              </label>

              {file && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl p-4 flex items-center gap-3 shadow-md">
                <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
                <p className="text-white">{error}</p>
              </div>
            )}

            {file && (
              <button
                onClick={handleUpload}
                disabled={loading}
                className="mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? 'Extracting...' : 'Extract Items'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
