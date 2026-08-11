import Link from "next/link";

export default function AgentResult({
  data
}: {
    data: any
  }) {

  const products =
    data.products ||
    data.results ||
    [];

  return (
    <div>
      <h2>
        Matched Products
      </h2>

      {
        products.map((item: any) => {

          const product =
            item.product || item;

          return (
            <div
              key={product.product_id || product.id}
              className="border p-4"
            >

              <h3>
                {
                  product.name ||
                  product.title
                }
              </h3>

              <p>
                {
                  product.description
                }
              </p>

              <div className="mt-2">
                <strong>Match Score:</strong> {Math.round((product.semantic_match_score || 0) * 100)}%
              </div>

              {
                product.derived_semantics && Object.keys(product.derived_semantics).length > 0 && (
                  <div className="mt-2">
                    <strong>Derived Semantics:</strong>
                    <pre className="text-xs">{JSON.stringify(product.derived_semantics, null, 2)}</pre>
                  </div>
                )
              }

              {
                product.evidence && product.evidence.length > 0 && (
                  <div className="mt-2">
                    <strong>Evidence:</strong>
                    <pre className="text-xs">{JSON.stringify(product.evidence, null, 2)}</pre>
                  </div>
                )
              }

              <div className="mt-2">
                <strong>Semantic Data:</strong>
                <pre className="text-xs">{JSON.stringify(product.semantic_data, null, 2)}</pre>
              </div>

              <Link
                href={`/store/${product.store_slug}/products/${product.product_id || product.id}`}
                className="inline-block mt-2 text-blue-600 hover:text-blue-700"
              >
                View Product
              </Link>

            </div>
          )
        })
      }
    </div>
  )
}
