'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tenantData: any) => void;
}

export default function CreateTenantModal({ isOpen, onClose, onSubmit }: CreateTenantModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Restaurant Info
    name: '',
    subdomain: '',
    email: '',
    phone: '',
    plan: 'starter',
    
    // Owner Info
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPassword: '',
    
    // Address Info
    address: '',
    city: '',
    postalCode: '',
    
    // Settings
    enableDelivery: true,
    enablePickup: true,
    deliveryFee: 2.50,
    freeDeliveryThreshold: 20.00
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Restaurantnaam is verplicht';
    if (!formData.subdomain.trim()) newErrors.subdomain = 'Subdomain is verplicht';
    if (!formData.email.trim()) newErrors.email = 'Email is verplicht';
    if (!formData.phone.trim()) newErrors.phone = 'Telefoon is verplicht';
    if (!formData.ownerFirstName.trim()) newErrors.ownerFirstName = 'Voornaam eigenaar is verplicht';
    if (!formData.ownerLastName.trim()) newErrors.ownerLastName = 'Achternaam eigenaar is verplicht';
    if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Email eigenaar is verplicht';
    if (!formData.ownerPassword.trim()) newErrors.ownerPassword = 'Wachtwoord is verplicht';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Ongeldig emailadres';
    }
    if (formData.ownerEmail && !emailRegex.test(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Ongeldig emailadres';
    }

    // Subdomain validation
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (formData.subdomain && !subdomainRegex.test(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain mag alleen letters, cijfers en streepjes bevatten';
    }

    // Password validation
    if (formData.ownerPassword && formData.ownerPassword.length < 6) {
      newErrors.ownerPassword = 'Wachtwoord moet minimaal 6 karakters zijn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        name: '',
        subdomain: '',
        email: '',
        phone: '',
        plan: 'starter',
        ownerFirstName: '',
        ownerLastName: '',
        ownerEmail: '',
        ownerPassword: '',
        address: '',
        city: '',
        postalCode: '',
        enableDelivery: true,
        enablePickup: true,
        deliveryFee: 2.50,
        freeDeliveryThreshold: 20.00
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSubdomain = () => {
    const name = formData.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);
    setFormData(prev => ({ ...prev, subdomain: name }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Nieuw Restaurant Toevoegen</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Restaurant Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Restaurant Informatie</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Naam *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="bijv. Pizza Mario"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subdomain * 
                    <button 
                      type="button"
                      onClick={generateSubdomain}
                      className="ml-2 text-blue-600 text-xs hover:underline"
                    >
                      genereer
                    </button>
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.subdomain}
                      onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase() }))}
                      className={`flex-1 p-3 border rounded-l-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.subdomain ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="pizzamario"
                    />
                    <span className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-3 flex items-center text-gray-600">
                      .fooddupe.nl
                    </span>
                  </div>
                  {errors.subdomain && <p className="text-red-600 text-sm mt-1">{errors.subdomain}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="info@pizzamario.nl"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefoon *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="036-841-4025"
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abonnement Plan
                  </label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="starter">Starter (€29/maand)</option>
                    <option value="professional">Professional (€59/maand)</option>
                    <option value="enterprise">Enterprise (€129/maand)</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Zandstraat 15"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stad
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Almere"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="1334 HD"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Eigenaar Informatie</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voornaam *
                    </label>
                    <input
                      type="text"
                      value={formData.ownerFirstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, ownerFirstName: e.target.value }))}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.ownerFirstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Mario"
                    />
                    {errors.ownerFirstName && <p className="text-red-600 text-sm mt-1">{errors.ownerFirstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Achternaam *
                    </label>
                    <input
                      type="text"
                      value={formData.ownerLastName}
                     onChange={(e) => setFormData(prev => ({ ...prev, ownerLastName: e.target.value }))}
                     className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                       errors.ownerLastName ? 'border-red-300' : 'border-gray-300'
                     }`}
                     placeholder="Rossi"
                   />
                   {errors.ownerLastName && <p className="text-red-600 text-sm mt-1">{errors.ownerLastName}</p>}
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Email Eigenaar *
                 </label>
                 <input
                   type="email"
                   value={formData.ownerEmail}
                   onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                     errors.ownerEmail ? 'border-red-300' : 'border-gray-300'
                   }`}
                   placeholder="mario@pizzamario.nl"
                 />
                 {errors.ownerEmail && <p className="text-red-600 text-sm mt-1">{errors.ownerEmail}</p>}
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Wachtwoord *
                 </label>
                 <input
                   type="password"
                   value={formData.ownerPassword}
                   onChange={(e) => setFormData(prev => ({ ...prev, ownerPassword: e.target.value }))}
                   className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                     errors.ownerPassword ? 'border-red-300' : 'border-gray-300'
                   }`}
                   placeholder="Minimaal 6 karakters"
                 />
                 {errors.ownerPassword && <p className="text-red-600 text-sm mt-1">{errors.ownerPassword}</p>}
               </div>

               {/* Service Settings */}
               <div className="mt-6">
                 <h4 className="text-md font-medium mb-3 text-gray-900">Service Instellingen</h4>
                 
                 <div className="space-y-3">
                   <div className="flex items-center">
                     <input
                       type="checkbox"
                       id="enableDelivery"
                       checked={formData.enableDelivery}
                       onChange={(e) => setFormData(prev => ({ ...prev, enableDelivery: e.target.checked }))}
                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                     />
                     <label htmlFor="enableDelivery" className="ml-2 text-sm font-medium text-gray-700">
                       Bezorging inschakelen
                     </label>
                   </div>

                   <div className="flex items-center">
                     <input
                       type="checkbox"
                       id="enablePickup"
                       checked={formData.enablePickup}
                       onChange={(e) => setFormData(prev => ({ ...prev, enablePickup: e.target.checked }))}
                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                     />
                     <label htmlFor="enablePickup" className="ml-2 text-sm font-medium text-gray-700">
                       Afhalen inschakelen
                     </label>
                   </div>

                   {formData.enableDelivery && (
                     <div className="grid grid-cols-2 gap-4 mt-4">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Bezorgkosten (€)
                         </label>
                         <input
                           type="number"
                           step="0.01"
                           min="0"
                           value={formData.deliveryFee}
                           onChange={(e) => setFormData(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) || 0 }))}
                           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Gratis bezorging vanaf (€)
                         </label>
                         <input
                           type="number"
                           step="0.01"
                           min="0"
                           value={formData.freeDeliveryThreshold}
                           onChange={(e) => setFormData(prev => ({ ...prev, freeDeliveryThreshold: parseFloat(e.target.value) || 0 }))}
                           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                         />
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </div>
         </div>

         {/* Footer */}
         <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
           <button
             type="button"
             onClick={onClose}
             className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
           >
             Annuleren
           </button>
           <button
             type="submit"
             disabled={loading}
             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             {loading ? (
               <span className="flex items-center">
                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                 Aanmaken...
               </span>
             ) : (
               'Restaurant Aanmaken'
             )}
           </button>
         </div>
       </form>
     </div>
   </div>
 );
}