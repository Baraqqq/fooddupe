'use client';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  type: string;
  createdAt: string;
}

interface RecentOrdersProps {
  orders: Order[];
}

const ORDER_STATUSES = {
  PENDING: { label: 'Nieuw', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Bevestigd', color: 'bg-blue-100 text-blue-800' },
  PREPARING: { label: 'In Bereiding', color: 'bg-orange-100 text-orange-800' },
  READY: { label: 'Klaar', color: 'bg-green-100 text-green-800' },
  COMPLETED: { label: 'Afgerond', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: 'Geannuleerd', color: 'bg-red-100 text-red-800' },
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Recente Orders</h3>
      </div>
      
      <div className="divide-y">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>Geen recente orders</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label || order.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.type === 'DELIVERY' ? 'bg-blue-100 text-blue-800' : 
                    order.type === 'PICKUP' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {order.type === 'DELIVERY' ? 'Bezorging' : 
                     order.type === 'PICKUP' ? 'Afhalen' : 'Ter Plaatse'}
                  </span>
                  </div>
               <div className="text-right">
                 <p className="font-bold text-green-600">€{order.total.toFixed(2)}</p>
                 <p className="text-sm text-gray-500">{getTimeAgo(order.createdAt)}</p>
               </div>
             </div>
           </div>
         ))
       )}
     </div>
     
     {orders.length > 0 && (
       <div className="p-4 border-t bg-gray-50">
         <button className="w-full text-center text-red-600 hover:text-red-700 font-medium">
           Alle orders bekijken
         </button>
       </div>
     )}
   </div>
 );
}