import { Request, Response, NextFunction } from 'express';
import { AppError, successResponse } from '@fooddupe/utils';

export class AnalyticsController {
  // Get restaurant analytics (for restaurant dashboard)
  static async getRestaurantAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const tenant = req.headers['x-tenant'] || tenantId || 'pizzamario';
      
      console.log('🔍 Analytics request for tenant:', tenant);
      
      // Mock analytics data - same structure as before
      const analyticsData = {
        todayOrders: 23,
        todayRevenue: 567.50,
        weekOrders: 156,
        weekRevenue: 3842.75,
        monthOrders: 689,
        monthRevenue: 15234.25,
        avgOrderValue: 24.65,
        topProducts: [
          { name: 'Margherita', count: 45, revenue: 562.50 },
          { name: 'Pepperoni', count: 32, revenue: 480.00 },
          { name: 'Carbonara', count: 28, revenue: 406.00 }
        ],
        recentOrders: [],
        hourlyStats: [
          { hour: '9:00', orders: 2, revenue: 45.50 },
          { hour: '10:00', orders: 5, revenue: 123.75 },
          { hour: '11:00', orders: 8, revenue: 198.25 },
          { hour: '12:00', orders: 15, revenue: 367.50 },
          { hour: '13:00', orders: 12, revenue: 294.75 },
          { hour: '14:00', orders: 6, revenue: 147.50 },
          { hour: '15:00', orders: 3, revenue: 73.25 },
          { hour: '16:00', orders: 4, revenue: 98.50 },
          { hour: '17:00', orders: 9, revenue: 215.75 },
          { hour: '18:00', orders: 18, revenue: 442.50 },
          { hour: '19:00', orders: 21, revenue: 516.75 },
          { hour: '20:00', orders: 16, revenue: 394.25 },
        ]
      };

      return successResponse(res, analyticsData, 'Restaurant analytics retrieved successfully');
    } catch (error) {
      console.error('Analytics error:', error);
      next(new AppError('Failed to get restaurant analytics', 500));
    }
  }

  // Get platform analytics (for super admin)
  static async getPlatformAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('🔍 Platform analytics request');
      
      const platformData = {
        totalTenants: 15,
        activeTenants: 12,
        trialTenants: 3,
        totalRevenue: 45672.30,
        monthlyRevenue: 15234.50,
        totalOrders: 2847,
        monthlyOrders: 756,
        avgRevenuePerTenant: 3044.82,
        growthRate: 23.5,
        churnRate: 5.2
      };

      return successResponse(res, platformData, 'Platform analytics retrieved successfully');
    } catch (error) {
      console.error('Platform analytics error:', error);
      next(new AppError('Failed to get platform analytics', 500));
    }
  }

  // Get sales data for charts
  static async getSalesData(req: Request, res: Response, next: NextFunction) {
    try {
      const { period } = req.params;
      const tenant = req.headers['x-tenant'] || 'pizzamario';
      
      console.log('🔍 Sales data request for period:', period, 'tenant:', tenant);
      
      const mockData = {
        today: [
          { time: '09:00', orders: 2, revenue: 45.50 },
          { time: '10:00', orders: 5, revenue: 123.75 },
          { time: '11:00', orders: 8, revenue: 198.25 },
          { time: '12:00', orders: 15, revenue: 367.50 },
          { time: '13:00', orders: 12, revenue: 294.75 },
          { time: '14:00', orders: 6, revenue: 147.50 },
          { time: '15:00', orders: 3, revenue: 73.25 },
          { time: '16:00', orders: 4, revenue: 98.50 },
          { time: '17:00', orders: 9, revenue: 215.75 },
          { time: '18:00', orders: 18, revenue: 442.50 },
          { time: '19:00', orders: 21, revenue: 516.75 },
          { time: '20:00', orders: 16, revenue: 394.25 },
        ],
        week: [
          { time: 'Ma', orders: 45, revenue: 1123.50 },
          { time: 'Di', orders: 52, revenue: 1287.75 },
          { time: 'Wo', orders: 38, revenue: 945.25 },
          { time: 'Do', orders: 61, revenue: 1512.50 },
          { time: 'Vr', orders: 78, revenue: 1934.75 },
          { time: 'Za', orders: 89, revenue: 2205.25 },
          { time: 'Zo', orders: 67, revenue: 1658.75 },
        ],
        month: [
          { time: 'Week 1', orders: 234, revenue: 5789.50 },
          { time: 'Week 2', orders: 198, revenue: 4912.75 },
          { time: 'Week 3', orders: 267, revenue: 6618.25 },
          { time: 'Week 4', orders: 189, revenue: 4681.50 },
        ]
      };
      
      const data = mockData[period as keyof typeof mockData] || mockData.today;
      
      return successResponse(res, data, `Sales data for ${period} retrieved successfully`);
    } catch (error) {
      console.error('Sales data error:', error);
      next(new AppError('Failed to get sales data', 500));
    }
  }

  // Get platform sales data for charts
  static async getPlatformSalesData(req: Request, res: Response, next: NextFunction) {
    try {
      const { period } = req.params;
      
      console.log('🔍 Platform sales data request for period:', period);
      
      const mockData = {
        week: [
          { period: 'Ma', tenants: 12, revenue: 2145.30, orders: 87 },
          { period: 'Di', revenue: 2387.50, tenants: 13, orders: 95 },
          { period: 'Wo', revenue: 2156.75, tenants: 12, orders: 89 },
          { period: 'Do', revenue: 2634.20, tenants: 14, orders: 102 },
          { period: 'Vr', revenue: 3245.80, tenants: 15, orders: 126 },
          { period: 'Za', revenue: 3856.40, tenants: 15, orders: 145 },
          { period: 'Zo', revenue: 2987.65, tenants: 14, orders: 118 }
        ],
        month: [
          { period: 'Week 1', tenants: 8, revenue: 12456.30, orders: 487 },
          { period: 'Week 2', tenants: 11, revenue: 16789.50, orders: 634 },
          { period: 'Week 3', tenants: 13, revenue: 18967.75, orders: 756 },
          { period: 'Week 4', tenants: 15, revenue: 21234.80, orders: 847 }
        ],
        quarter: [
          { period: 'Jan', tenants: 8, revenue: 34567.30, orders: 1456 },
          { period: 'Feb', tenants: 11, revenue: 42389.50, orders: 1789 },
          { period: 'Mar', tenants: 15, revenue: 51234.75, orders: 2156 }
        ]
      };

      const data = mockData[period as keyof typeof mockData] || mockData.month;
      
      return successResponse(res, data, `Platform sales data for ${period} retrieved successfully`);
    } catch (error) {
      console.error('Platform sales data error:', error);
      next(new AppError('Failed to get platform sales data', 500));
    }
  }
}