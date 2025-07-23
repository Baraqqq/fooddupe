'use client';

import { useState } from 'react';
import { orderApi } from '@/lib/api';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutModalProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: (orderNumber: string) => void;
}

export default function CheckoutModal({ cart, isOpen, onClose, onOrderComplete }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    type: 'DELIVERY' as 'DELIVERY' | 'PICKUP',
    paymentMethod: 'IDEAL' as 'CASH' | 'CARD' | 'IDEAL',
    notes: ''
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = formData.type === 'DELIVERY' ? 2.50 : 0;
  const tax = (subtotal + deliveryFee) * 0.21;
  const total = subtotal + deliveryFee + tax;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          notes: ''
        })),
        type: formData.type,
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };
      
      const response = await orderApi.createOrder(orderData);
      
      if (response.success) {
        onOrderComplete(response.data.orderNumber);
      }
      
    } catch (error: any) {
      console.error('Order creation failed:', error);
      alert('Er ging iets mis bij het plaatsen van je bestelling. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Bestelling afronden</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Je bestelling</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotaal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Bezorgkosten</span>
                    <span>€{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>BTW (21%)</span>
                  <span>€{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Totaal</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order Type */}
            <div>
              <label className="block font-medium mb-2">Bestelling type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="DELIVERY"
                    checked={formData.type === 'DELIVERY'}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'DELIVERY'})}
                    className="mr-2"
                  />
                  Bezorging (€2.50)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="PICKUP"
                    checked={formData.type === 'PICKUP'}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'PICKUP'})}
                    className="mr-2"
                  />
                  Afhalen
                </label>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Voornaam"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Achternaam"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
            </div>

            <input
              type="email"
              placeholder="E-mailadres"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />

            <input
              type="tel"
              placeholder="Telefoonnummer"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />

            {/* Address (only for delivery) */}
            {formData.type === 'DELIVERY' && (
              <>
                <input
                  type="text"
                  placeholder="Adres"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Stad"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="p-3 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Postcode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    className="p-3 border rounded-lg"
                    required
                  />
                </div>
              </>
            )}

            {/* Payment Method */}
            <div>
              <label className="block font-medium mb-2">Betaalmethode</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="IDEAL">iDEAL</option>
                <option value="CARD">Creditcard</option>
                <option value="CASH">Contant (bij afhalen/bezorging)</option>
              </select>
            </div>

            {/* Notes */}
            <textarea
              placeholder="Opmerkingen (optioneel)"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-3 border rounded-lg"
              rows={3}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Bestelling plaatsen...' : `Bestellen - €${total.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}