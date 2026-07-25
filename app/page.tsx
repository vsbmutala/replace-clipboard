import Link from 'next/link';
import { Package, Inbox } from 'lucide-react';

export default function Home() {
  console.log('=== CLIENT ENV DEBUG ===');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('========================');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center tracking-tight">Kitchen Inventory</h1>
        <p className="text-xl text-gray-600 mb-12 text-center">AI-powered inventory management for volunteers</p>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/receive"
            className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Inbox className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Receive Shipment</h2>
              <p className="text-gray-600">Upload invoice and extract items using AI</p>
            </div>
          </Link>

          <Link
            href="/inventory"
            className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">View Inventory</h2>
              <p className="text-gray-600">Search and manage current inventory levels</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
