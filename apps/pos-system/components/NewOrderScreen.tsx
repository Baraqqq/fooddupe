'use client';

import { useState, useEffect } from 'react';
import { productApi, orderApi } from '@/lib/api';
import { 
  PlusIcon, 
  MinusIcon, 
  TrashIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

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
  notes?: string;
}

interface NewOrderScreenProps {
  onOrderCreated: (order: any) => void;
  onCancel: () => void;
}

export default function NewOrderScreen({ onOrderCreated, onCancel }: NewOrderScreenProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Customer form
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: ''
  });
  
  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP' | 'DINE_IN'>('PICKUP');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [notes, setNotes] = useState('');

  // Load products
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
        }
      } catch (error) {
        console.error('Failed to load products:', error);
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

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderType === 'DELIVERY' ? 2.50 : 0;
    const tax = (subtotal + deliveryFee) * 0.21;
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round((subtotal + deliveryFee + tax) * 100) / 100
    };
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert('Voeg items toe aan de bestelling');
      return;
    }

    if (!customer.firstName || !customer.phone) {
      alert('Vul minimaal naam en telefoonnummer in');
      return;
    }

    try {
      setSubmitting(true);

      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          notes: item.notes || ''
        })),
        type: orderType,
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email || 'walk-in@restaurant.local',
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          postalCode: customer.postalCode
        },
        paymentMethod,
        notes
      };

      console.log('Creating order with data:', orderData);
      const response = await orderApi.createOrder(orderData);

      if (response.success) {
        console.log('Order created successfully:', response.data);
        onOrderCreated(response.data);
        // Reset form
        setCart([]);
        setCustomer({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          postalCode: ''
        });
        setNotes('');
      }

    } catch (error: any) {
      console.error('Order creation failed:', error);
      alert('Kon order niet aanmaken: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const pricing = getCartTotal();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Product Selection */}
      <div className="w-2/3 bg-white overflow-y-auto">
        {/* Categories */}
        <div className="border-b bg-gray-50 p-4">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-800 hover:bg-gray-100 border'
                }`}
              >
                {category.name} ({category.products.length})
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            {selectedCategoryData?.name || 'Producten'}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedCategoryData?.products.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border-2 hover:border-red-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  {product.isPopular && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-600 text-lg">€{product.price.toFixed(2)}</span>
                  <button className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {(!selectedCategoryData?.products || selectedCategoryData.products.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <p>Geen producten gevonden in deze categorie</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary & Customer Info */}
      <div className="w-1/3 bg-gray-50 border-l overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Nieuwe Bestelling</h2>

          {/* Cart Items */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-900">Items ({cart.length})</h3>
            
            {cart.length === 0 ? (
              <p className="text-gray-600 text-center py-4 bg-white rounded-lg">
                Geen items geselecteerd
              </p>
            ) : (
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="bg-white rounded-lg p-3 border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-gray-900">{item.name}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-semibold text-gray-900">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Type */}
          <div className="mb-4">
            <label className="block font-medium mb-2 text-gray-900">Order Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'PICKUP', label: 'Afhalen' },
                { value: 'DELIVERY', label: 'Bezorging' },
                { value: 'DINE_IN', label: 'Ter Plaatse' }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setOrderType(type.value as any)}
                  className={`px-3 py-2 rounded text-sm font-medium border ${
                    orderType === type.value
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-4">
            <h3 className="font-semibold mb-3 text-gray-900">Klant Informatie</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Voornaam *"
                  value={customer.firstName}
                  onChange={(e) => setCustomer({...customer, firstName: e.target.value})}
                  className="p-3 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <input
                  type="text"
                  placeholder="Achternaam"
                  value={customer.lastName}
                  onChange={(e) => setCustomer({...customer, lastName: e.target.value})}
                  className="p-3 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <input
                type="tel"
                placeholder="Telefoon *"
                value={customer.phone}
                onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                className="w-full p-3 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              
              {orderType === 'DELIVERY' && (
                <>
                  <input
                    type="text"
                    placeholder="Adres"
                    value={customer.address}
                    onChange={(e) => setCustomer({...customer, address: e.target.value})}
                    className="w-full p-3 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Stad"
                      value={customer.city}
                      onChange={(e) => setCustomer({...customer, city: e.target.value})}
                      className="p-3 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <input
                      type="text"
                      placeholder="Postcode"
                      value={customer.postalCode}
                      onChange={(e) => setCustomer({...customer, postalCode: e.target.value})}
                      className="p-3 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="block font-medium mb-2 text-gray-900">Betaling</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`px-3 py-2 rounded text-sm font-medium border ${
                  paymentMethod === 'CASH'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
                }`}
              >
                💰 Contant
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`px-3 py-2 rounded text-sm font-medium border ${
                  paymentMethod === 'CARD'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
                }`}
              >
                💳 Pin/Kaart
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block font-medium mb-2 text-gray-900">Opmerkingen</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Extra opmerkingen..."
              className="w-full p-3 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
            />
          </div>

          {/* Order Total */}
          {cart.length > 0 && (
            <div className="mb-6 bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-800">
                  <span>Subtotaal</span>
                  <span>€{pricing.subtotal.toFixed(2)}</span>
                </div>
                {pricing.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-800">
                    <span>Bezorgkosten</span>
                    <span>€{pricing.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-800">
                  <span>BTW (21%)</span>
                  <span>€{pricing.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl border-t pt-2 text-gray-900">
                  <span>Totaal</span>
                  <span className="text-red-600">€{pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubmitOrder}
              disabled={cart.length === 0 || submitting || !customer.firstName || !customer.phone}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Order Plaatsen...
                </span>
              ) : (
                `🛒 Order Plaatsen - €${pricing.total.toFixed(2)}`
              )}
            </button>
            
            <button
              onClick={onCancel}
              className="w-full bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              ❌ Annuleren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}