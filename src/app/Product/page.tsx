"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@sanity/client";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

const sanity = createClient({
  projectId: "r79i5c8",
  dataset: "production",
  apiVersion: "2023-01-01",
  useCdn: true,
});

interface Product {
  imageUrl: string | StaticImport;
  _id: string;
  title: string;
  price: number;
  description: string;
  discountPercentage: number;
  slug: {
    current: string;
  };
  image: {
    asset: {
      url: string;
    };
  };
  tags: string[];
}

const ProductCards: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const query = `*[_type == "product"] {
        _id,
        title,
        price,
        description,
        discountPercentage,
        slug,
        image {
          asset->url
        },
        tags
      }`;
      const data = await sanity.fetch(query);
      setProducts(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(
        err.message.includes("NetworkError")
          ? "Network error occurred. Please check your connection."
          : "Failed to load products. Please try again later."
      );
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => [...prevCart, product]);
    alert(`${product.title} has been added to your cart!`);
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== id));
  };

  const truncateDescription = (description: string, maxLength = 100): string =>
    description.length > maxLength
      ? `${description.slice(0, maxLength)}...`
      : description;

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl text-center text-slate-800 mt-4 mb-4">
        Products From API Data
      </h2>

      {error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}  // Key based on product ID for uniqueness
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300"
            >
              <Link href={`/product/${product.slug.current}`}>
                <Image
                  src={product.image.asset.url}  // Correct usage of image URL
                  alt={product.title}  // Descriptive alt text
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover rounded-md"
                />
                <h2 className="text-lg font-semibold mt-2">{product.title}</h2>
              </Link>
              <p className="text-slate-800 mt-2 text-sm">
                {truncateDescription(product.description)}
              </p>
              <div className="mt-4">
                <p className="text-slate-800 font-bold">${product.price}</p>
                {product.discountPercentage > 0 && (
                  <p className="text-sm text-green-600">
                    {product.discountPercentage}% OFF
                  </p>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={`${product._id}-${tag}`}  // Ensure unique key for each tag
                    className="bg-gray-200 text-gray-700 text-xs py-1 px-2 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => addToCart(product)}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-slate-100 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-black text-red-800">Cart Summary</h2>
        {cart.length > 0 ? (
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item._id}  // Key for cart items based on their unique ID
                className="flex justify-between items-center bg-yellow-50 shadow-sm p-4 rounded-md"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-blue-600">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <Image
                  src={item.imageUrl}
                  alt={item.title}  // Descriptive alt text for cart items
                  width={50}
                  height={50}
                  className="rounded-md"
                />
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="ml-4 text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-black text-center">
            Your Cart Is Empty. Please Add Products.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCards;
