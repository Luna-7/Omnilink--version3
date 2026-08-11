import Link from "next/link";


export default function DemoNav() {
  return (
    <nav className="border-b p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="text-xl font-bold">
          Omnilink
        </div>
        <div className="flex gap-6">
          <Link
            href="/dashboard"
            className="text-sm hover:text-blue-600"
          >
            Merchant Dashboard
          </Link>
          <Link
            href="/dashboard/products"
            className="text-sm hover:text-blue-600"
          >
            Product Node
          </Link>
          <Link
            href="/agent/demo"
            className="text-sm hover:text-blue-600"
          >
            Agent Demo
          </Link>
          <Link
            href="/store/demo-store"
            className="text-sm hover:text-blue-600"
          >
            Public Store
          </Link>
        </div>
      </div>
    </nav>
  )
}
