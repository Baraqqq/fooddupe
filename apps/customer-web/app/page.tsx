'use client';

import { useState, useEffect } from 'react';
import { productApi } from '@/lib/api';
import { StarIcon } from '@heroicons/react/24/solid';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import CheckoutModal from '@/components/CheckoutModal';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  isPopular: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  products: Product[];
}

interface CartItem extends Product {
  quantity: number;
}

export default function RestaurantPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  // Load products by category
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getProductsByCategory();
        
        if (response.success) {
          setCategories(response.data);
          if (response.data.length > 0) {
            setSelectedCategory(response.data[0].id);
          }
        } else {
          setError(response.error || 'Failed to load products');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load products');
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleOrderComplete = (orderNumber: string) => {
    setOrderComplete(orderNumber);
    setCart([]); // Clear cart
    setShowCheckout(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Order complete success screen
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bestelling geplaatst!</h1>
          <p className="text-gray-600 mb-4">
            Je bestelling <strong>{orderComplete}</strong> is succesvol geplaatst.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Je ontvangt binnenkort een bevestiging per e-mail.
          </p>
          <button
            onClick={() => setOrderComplete(null)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Nieuwe bestelling
          </button>
        </div>
      </div>
    );
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Simplified */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🍕</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pizza Mario</h1>
                <p className="text-sm text-gray-600">Test Restaurant</p>
              </div>
            </div>
            {/* Removed cart button since cart is visible in sidebar */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome to Pizza Mario</h2>
            <p className="text-red-100 mb-4">Testing our FoodDupe API!</p>
            <div className="flex items-center justify-center space-x-1">
              {[1,2,3,4,5].map(star => (
                <StarIcon key={star} className="w-5 h-5 text-yellow-400" />
              ))}
              <span className="ml-2 text-sm">4.9 (Test Reviews)</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="font-bold text-lg mb-4">Categories</h3>
              <nav className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-red-100 text-red-700 border-l-4 border-red-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({category.products.length})
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">
                {selectedCategoryData?.name || 'Products'}
              </h2>
              
              <div className="grid gap-4">
                {selectedCategoryData?.products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          {product.isPopular && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                        <p className="text-xl font-bold text-red-600">
                          €{product.price.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="ml-4 flex flex-col items-center space-y-3">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🍕</span>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-bold text-lg mb-4">Cart</h3>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Your cart is empty
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-red-600 font-semibold">€{item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>€{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  <button 
                    className="w-full mt-6 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    onClick={() => setShowCheckout(true)}
                  >
                    Place Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        cart={cart}
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
}