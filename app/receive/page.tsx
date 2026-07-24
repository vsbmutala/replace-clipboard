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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Receive Shipment</h1>
        <p className="text-gray-600 mb-8">Upload invoice to extract inventory items</p>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-green-800 mb-2">Shipment Confirmed!</h2>
            <p className="text-green-600 mb-6">Inventory has been updated successfully.</p>
            <button
              onClick={handleReset}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Receive Another Shipment
            </button>
          </div>
        ) : extractedItems.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Review Extracted Items
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Item</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Expected Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actual Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">{item.name}</td>
                      <td className="py-4 px-4 text-gray-600">{item.quantity}</td>
                      <td className="py-4 px-4">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Confirming...' : 'Confirm Shipment'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Invoice</h3>
              <p className="text-gray-600 mb-6">Supported formats: Image (JPEG, PNG)</p>
              
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Choose File
              </label>

              {file && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {file && (
              <button
                onClick={handleUpload}
                disabled={loading}
                className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
