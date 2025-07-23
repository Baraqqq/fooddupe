'use client';

import { orderApi } from '@/lib/api';
import { 
 CheckCircleIcon, 
 XCircleIcon,
 PhoneIcon,
 MapPinIcon,
 ClockIcon
} from '@heroicons/react/24/outline';

interface Order {
 id: string;
 orderNumber: string;
 status: string;
 type: string;
 total: number;
 customerName: string;
 customerPhone: string;
 deliveryAddress?: string;
 estimatedTime?: number;
 items: {
   id: string;
   name: string;
   quantity: number;
   price: number;
   notes?: string;
 }[];
 createdAt: string;
 notes?: string;
}

interface OrderDetailsProps {
 order: Order | null;
 onOrderUpdate: () => void;
}

const ORDER_STATUSES = {
 PENDING: { label: 'Nieuw', color: 'bg-yellow-500', next: 'CONFIRMED' },
 CONFIRMED: { label: 'Bevestigd', color: 'bg-blue-500', next: 'PREPARING' },
 PREPARING: { label: 'In Bereiding', color: 'bg-orange-500', next: 'READY' },
 READY: { label: 'Klaar', color: 'bg-green-500', next: 'COMPLETED' },
 COMPLETED: { label: 'Afgerond', color: 'bg-gray-500', next: null },
 CANCELLED: { label: 'Geannuleerd', color: 'bg-red-500', next: null },
};

export default function OrderDetails({ order, onOrderUpdate }: OrderDetailsProps) {
 const updateOrderStatus = async (orderId: string, newStatus: string) => {
   try {
     const response = await orderApi.updateOrderStatus(orderId, newStatus);
     
     if (response.success) {
       onOrderUpdate();
     }
   } catch (error) {
     console.error('Failed to update order status:', error);
     alert('Kon order status niet updaten');
   }
 };

 const getTimeAgo = (dateString: string) => {
   const now = new Date();
   const orderTime = new Date(dateString);
   const diffMs = now.getTime() - orderTime.getTime();
   const diffMins = Math.floor(diffMs / (1000 * 60));
   
   if (diffMins < 1) return 'Nu';
   if (diffMins < 60) return `${diffMins}m geleden`;
   const diffHours = Math.floor(diffMins / 60);
   return `${diffHours}u ${diffMins % 60}m geleden`;
 };

 if (!order) {
   return (
     <div className="w-1/2 bg-gray-50 flex items-center justify-center">
       <div className="text-center text-gray-500">
         <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
         <p className="text-lg">Selecteer een order om details te bekijken</p>
       </div>
     </div>
   );
 }

 return (
   <div className="w-1/2 bg-gray-50 overflow-y-auto">
     {/* Order Header */}
     <div className="bg-white p-6 border-b">
       <div className="flex items-center justify-between mb-4">
         <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
         <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
           ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.color || 'bg-gray-500'
         }`}>
           {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label || order.status}
         </span>
       </div>

       {/* Customer Info */}
       <div className="grid grid-cols-1 gap-4 mb-4">
         <div className="flex items-center space-x-2">
           <PhoneIcon className="w-5 h-5 text-gray-400" />
           <span>{order.customerName}</span>
           <span className="text-gray-500">•</span>
           <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">
             {order.customerPhone}
           </a>
         </div>
         
         {order.deliveryAddress && (
           <div className="flex items-start space-x-2">
             <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
             <span className="text-sm">{order.deliveryAddress}</span>
           </div>
         )}
       </div>

       {/* Order Type & Time */}
       <div className="flex items-center justify-between text-sm">
         <span className={`px-3 py-1 rounded ${
           order.type === 'DELIVERY' ? 'bg-blue-100 text-blue-800' : 
           order.type === 'PICKUP' ? 'bg-green-100 text-green-800' :
           'bg-purple-100 text-purple-800'
         }`}>
           {order.type === 'DELIVERY' ? 'Bezorging' : 
            order.type === 'PICKUP' ? 'Afhalen' : 'Ter Plaatse'}
         </span>
         <span className="text-gray-500">{getTimeAgo(order.createdAt)}</span>
       </div>
     </div>

     {/* Order Items */}
     <div className="bg-white p-6 border-b">
       <h3 className="font-semibold mb-4">Bestelling details</h3>
       <div className="space-y-3">
         {order.items.map(item => (
           <div key={item.id} className="flex justify-between items-start">
             <div className="flex-1">
               <div className="flex items-center space-x-2">
                 <span className="font-medium text-lg">{item.quantity}x</span>
                 <span className="font-medium">{item.name}</span>
               </div>
               {item.notes && (
                 <p className="text-sm text-orange-600 ml-6 bg-orange-50 px-2 py-1 rounded mt-1">
                   📝 {item.notes}
                 </p>
               )}
             </div>
             <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
           </div>
         ))}
       </div>
       
       <div className="border-t mt-4 pt-4">
         <div className="flex justify-between font-bold text-lg">
           <span>Totaal</span>
           <span className="text-red-600">€{order.total.toFixed(2)}</span>
         </div>
       </div>

       {order.notes && (
         <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
           <p className="text-sm font-medium text-yellow-800">Opmerkingen:</p>
           <p className="text-sm text-yellow-700">{order.notes}</p>
         </div>
       )}
     </div>

     {/* Status Actions */}
     <div className="bg-white p-6">
       <h3 className="font-semibold mb-4">Order Acties</h3>
       
       <div className="space-y-3">
         {/* Next Status Button */}
         {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.next && (
           <button
             onClick={() => {
               const nextStatus = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.next;
               if (nextStatus) {
                 updateOrderStatus(order.id, nextStatus);
               }
             }}
             className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center"
           >
             <CheckCircleIcon className="w-5 h-5 mr-2" />
             Naar: {ORDER_STATUSES[ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.next as keyof typeof ORDER_STATUSES]?.label}
           </button>
         )}

         {/* Quick Status Buttons */}
         {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
           <div className="grid grid-cols-2 gap-2">
             {order.status !== 'READY' && (
               <button
                 onClick={() => updateOrderStatus(order.id, 'READY')}
                 className="bg-blue-600 text-white py-2 px-3 rounded font-medium hover:bg-blue-700 text-sm"
               >
                 ⚡ Direct Klaar
               </button>
             )}
             
             <button
               onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
               className="bg-red-600 text-white py-2 px-3 rounded font-medium hover:bg-red-700 text-sm"
             >
               <XCircleIcon className="w-4 h-4 inline mr-1" />
               Annuleren
             </button>
           </div>
         )}

         {/* Completed Order Actions */}
         {order.status === 'COMPLETED' && (
           <div className="text-center py-4">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
               <CheckCircleIcon className="w-8 h-8 text-green-600" />
             </div>
             <p className="text-green-600 font-medium">Order Afgerond</p>
             <p className="text-sm text-gray-500">Deze bestelling is voltooid</p>
           </div>
         )}
       </div>
     </div>

     {/* Kitchen Timer (if preparing) */}
     {order.status === 'PREPARING' && (
       <div className="bg-orange-50 border-t border-orange-200 p-4">
         <div className="flex items-center justify-center space-x-2 text-orange-800">
           <ClockIcon className="w-5 h-5" />
           <span className="font-medium">In de keuken</span>
           {order.estimatedTime && (
             <span className="bg-orange-200 px-2 py-1 rounded text-sm">
               ~{order.estimatedTime} min
             </span>
           )}
         </div>
       </div>
     )}
   </div>
 );
}