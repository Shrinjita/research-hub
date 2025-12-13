// src/pages/ShoppingMode.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

interface Product {
  source: string;
  name: string;
  summary: string;
  image?: string;
  link: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    source: "https://amazon.com",
    name: "Seiko 5 Automatic Watch",
    summary: "Classic design, reliable automatic movement.",
    image: "https://via.placeholder.com/150",
    link: "https://amazon.com",
  },
  {
    source: "https://ebay.com",
    name: "Seiko 5 Sports Watch",
    summary: "Durable, water-resistant, perfect for daily wear.",
    image: "https://via.placeholder.com/150",
    link: "https://ebay.com",
  },
  {
    source: "https://walmart.com",
    name: "Seiko 5 Analog Watch",
    summary: "Affordable and stylish, great gift option.",
    image: "https://via.placeholder.com/150",
    link: "https://walmart.com",
  },
];

export default function ShoppingMode() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(false);

  const searchProducts = async () => {
    if (!query.trim()) return;
    setLoading(true);

    // Replace with live API call later
    setTimeout(() => {
      // Filter mock data by query for demo
      setProducts(
        MOCK_PRODUCTS.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        )
      );
      setLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Mode</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Products</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Search products (e.g. Seiko 5)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchProducts()}
          />
          <Button onClick={searchProducts} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-sm">{p.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-40 object-contain mb-2"
                />
              )}
              <p className="text-sm mb-2">{p.summary}</p>
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-sm underline"
              >
                View on {new URL(p.source).hostname}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
