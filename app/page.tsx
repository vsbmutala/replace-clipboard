import Link from 'next/link';
import { Package, Inbox } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">Kitchen Inventory</h1>
        <p className="text-xl text-gray-600 mb-12 text-center">AI-powered inventory management for volunteers</p>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/receive"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <Inbox className="w-16 h-16 text-blue-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Receive Shipment</h2>
              <p className="text-gray-600">Upload invoice and extract items using AI</p>
            </div>
          </Link>

          <Link
            href="/inventory"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <Package className="w-16 h-16 text-green-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">View Inventory</h2>
              <p className="text-gray-600">Search and manage current inventory levels</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
