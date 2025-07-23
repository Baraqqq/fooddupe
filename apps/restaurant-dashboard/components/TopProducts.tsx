'use client';

interface TopProductsProps {
  products: {
    name: string;
    count: number;
    revenue: number;
  }[];
}

export default function TopProducts({ products }: TopProductsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Producten</h3>
      
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">#{index + 1}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">{product.count}x verkocht</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">€{product.revenue.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}