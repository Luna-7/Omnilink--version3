import Link from "next/link";

export default function ProductGrid({
  products,
  storeSlug
}: {
  products: any[]
  storeSlug: string
}) {

  return (
    <div>
      {
        products?.map(product => (
          <div key={product.id}>
            <h3>
              {product.title || product.name}
            </h3>
            <p>
              {product.description}
            </p>
            <Link
              href={`/store/${storeSlug}/products/${product.id}`}
            >
              View
            </Link>
          </div>
        ))
      }
    </div>
  )
}
