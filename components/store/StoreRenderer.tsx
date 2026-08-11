import Hero from "./blocks/Hero";
import ProductGrid from "./blocks/ProductGrid";
import Contact from "./blocks/Contact";

interface Section {
  type: string;
  data?: any;
}

interface Props {
  sections: Section[];
  products: any[];
  storeSlug: string;
}

export default function StoreRenderer({
  sections,
  products,
  storeSlug
}: Props) {

  return (
    <div>
      {
        sections?.map((section, index) => {

          switch (section.type) {

            case "hero":
              return (
                <Hero
                  key={index}
                  data={section.data}
                />
              );

            case "product_grid":
              return (
                <ProductGrid
                  key={index}
                  products={products}
                  storeSlug={storeSlug}
                />
              );

            case "contact":
              return (
                <Contact
                  key={index}
                  data={section.data}
                />
              );

            default:
              return null;

          }
        })
      }
    </div>
  );
}
