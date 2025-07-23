import { Injectable } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly ordersService: OrdersService) {}

  async getRestaurantAnalytics(tenantId: string) {
    try {
      // Get all orders for this tenant
      const allOrdersResponse = await this.ordersService.findAll(tenantId);
      const orders = allOrdersResponse.data || [];

      // Calculate date ranges
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // Filter orders by date ranges
      const todayOrders = orders.filter(order => new Date(order.createdAt) >= todayStart);
      const weekOrders = orders.filter(order => new Date(order.createdAt) >= weekStart);
      const monthOrders = orders.filter(order => new Date(order.createdAt) >= monthStart);

      // Calculate revenues
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
      const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0);
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

      // Calculate average order value
      const avgOrderValue = orders.length > 0 
        ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length 
        : 0;

      // Get top products
      const productCounts = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const key = item.name || `Product ${item.id}`;
            if (!productCounts[key]) {
              productCounts[key] = { name: key, count: 0, revenue: 0 };
            }
            productCounts[key].count += item.quantity || 1;
            productCounts[key].revenue += (item.price || 0) * (item.quantity || 1);
          });
        }
      });

      const topProducts = Object.values(productCounts)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      // Generate hourly stats for today
      const hourlyStats = [];
      for (let hour = 9; hour <= 22; hour++) {
        const hourStart = new Date(todayStart);
        hourStart.setHours(hour);
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(hour + 1);

        const hourOrders = orders.filter(order => {
          const orderTime = new Date(order.createdAt);
          return orderTime >= hourStart && orderTime < hourEnd;
        });

        hourlyStats.push({
          hour: `${hour}:00`,
          orders: hourOrders.length,
          revenue: hourOrders.reduce((sum, order) => sum + order.total, 0)
        });
      }

      return {
        success: true,
        data: {
          todayOrders: todayOrders.length,
          todayRevenue,
          weekOrders: weekOrders.length,
          weekRevenue,
          monthOrders: monthOrders.length,
          monthRevenue,
          avgOrderValue,
          topProducts,
          hourlyStats,
          recentOrders: orders.slice(0, 5)
        }
      };

    } catch (error) {
      console.error('Analytics error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPlatformAnalytics() {
    try {
      // For now, get data from pizzamario tenant as example
      // Later this will aggregate from all tenants
      const pizzamarioAnalytics = await this.getRestaurantAnalytics('pizzamario');
      
      if (!pizzamarioAnalytics.success) {
        throw new Error('Failed to get restaurant analytics');
      }

      const data = pizzamarioAnalytics.data;

      // Mock platform-wide calculations (multiply by number of tenants)
      const mockTenantCount = 15;
      const activeTenants = 12;
      const trialTenants = 3;

      return {
        success: true,
        data: {
          totalTenants: mockTenantCount,
          activeTenants,
          trialTenants,
          totalRevenue: data.monthRevenue * mockTenantCount * 3, // 3 months estimate
          monthlyRevenue: data.monthRevenue * mockTenantCount,
          totalOrders: data.monthOrders * mockTenantCount * 3,
          monthlyOrders: data.monthOrders * mockTenantCount,
          avgRevenuePerTenant: data.monthRevenue,
          growthRate: 23.5,
          churnRate: 5.2
        }
      };

    } catch (error) {
      console.error('Platform analytics error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getSalesData(period: 'today' | 'week' | 'month', tenantId: string) {
    try {
      const allOrdersResponse = await this.ordersService.findAll(tenantId);
      const orders = allOrdersResponse.data || [];

      let data = [];
      const today = new Date();

      if (period === 'today') {
        // Generate hourly data for today
        for (let hour = 9; hour <= 22; hour++) {
          const hourStart = new Date(today);
          hourStart.setHours(hour, 0, 0, 0);
          const hourEnd = new Date(hourStart);
          hourEnd.setHours(hour + 1);

          const hourOrders = orders.filter(order => {
            const orderTime = new Date(order.createdAt);
            return orderTime >= hourStart && orderTime < hourEnd;
          });

          data.push({
            time: `${hour}:00`,
            orders: hourOrders.length,
            revenue: hourOrders.reduce((sum, order) => sum + order.total, 0)
          });
        }
      } else if (period === 'week') {
        // Generate daily data for last 7 days
        const days = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);

          const dayOrders = orders.filter(order => {
            const orderTime = new Date(order.createdAt);
            return orderTime >= dayStart && orderTime <= dayEnd;
          });

          data.push({
            time: days[date.getDay()],
            orders: dayOrders.length,
            revenue: dayOrders.reduce((sum, order) => sum + order.total, 0)
          });
        }
      } else if (period === 'month') {
        // Generate weekly data for last 4 weeks
        for (let week = 3; week >= 0; week--) {
          const weekStart = new Date(today);
          weekStart.setDate(weekStart.getDate() - (week * 7 + 7));
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          const weekOrders = orders.filter(order => {
            const orderTime = new Date(order.createdAt);
            return orderTime >= weekStart && orderTime <= weekEnd;
          });

          data.push({
            time: `Week ${4 - week}`,
            orders: weekOrders.length,
            revenue: weekOrders.reduce((sum, order) => sum + order.total, 0)
          });
        }
      }

      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('Sales data error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPlatformSalesData(period: 'week' | 'month' | 'quarter') {
    try {
      // Get sales data for main tenant and multiply for platform simulation
      const salesData = await this.getSalesData(
        period === 'quarter' ? 'month' : period, 
        'pizzamario'
      );

      if (!salesData.success) {
        throw new Error('Failed to get sales data');
      }

      // Simulate platform data by multiplying single tenant data
      const mockTenantMultiplier = 15;
      
      const platformData = salesData.data.map(item => ({
        period: item.time,
        tenants: Math.min(mockTenantMultiplier, item.orders > 0 ? mockTenantMultiplier : 8),
        revenue: item.revenue * mockTenantMultiplier,
        orders: item.orders * mockTenantMultiplier
      }));

      return {
        success: true,
        data: platformData
      };

    } catch (error) {
      console.error('Platform sales data error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}