import Link from 'next/link';
import { Home, Inbox, Package } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-gray-700">
            <Home className="w-5 h-5" />
            <span className="font-semibold">Home</span>
          </Link>
          <div className="flex gap-6">
            <Link
              href="/receive"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Inbox className="w-5 h-5" />
              <span className="font-medium">Receive</span>
            </Link>
            <Link
              href="/inventory"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Inventory</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
