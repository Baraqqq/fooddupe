import { Request, Response, NextFunction } from 'express';
import { AppError, successResponse, generateOrderNumber } from '@fooddupe/utils';
import { CreateOrderRequest } from '@fooddupe/types';

// Mock orders storage (in memory for now)
let mockOrders: any[] = [];
let orderCounter = 1;

// Mock customers storage
let mockCustomers: any[] = [];

export class OrderController {
  
  // Create new order
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('🛒 Creating new order...');
      
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        throw new AppError('Tenant not found', 404);
      }
      
      const orderData: CreateOrderRequest = req.body;
      
      // Validation
      if (!orderData.items || orderData.items.length === 0) {
        throw new AppError('Order must contain at least one item', 400);
      }
      
      if (!orderData.customer.firstName || !orderData.customer.email || !orderData.customer.phone) {
        throw new AppError('Customer information is required', 400);
      }
      
      // Mock products for price calculation
      const mockProducts = [
        { id: '1', name: 'Margherita', price: 12.50 },
        { id: '2', name: 'Pepperoni', price: 15.00 },
        { id: '3', name: 'Spaghetti Carbonara', price: 14.50 },
        { id: '4', name: 'Coca Cola', price: 2.50 },
      ];
      
      // Calculate order totals
      let subtotal = 0;
      const orderItems = orderData.items.map(item => {
        const product = mockProducts.find(p => p.id === item.productId);
        if (!product) {
          throw new AppError(`Product not found: ${item.productId}`, 404);
        }
        
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        
        return {
          id: `item_${Date.now()}_${Math.random()}`,
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          notes: item.notes,
          total: itemTotal
        };
      });
      
      const deliveryFee = orderData.type === 'DELIVERY' ? 2.50 : 0;
      const tax = (subtotal + deliveryFee) * 0.21; // 21% BTW
      const total = subtotal + deliveryFee + tax;
      
      // Create customer if not exists
      let customer = mockCustomers.find(c => 
        c.email === orderData.customer.email && c.tenantId === tenantId
      );
      
      if (!customer) {
        customer = {
          id: `customer_${Date.now()}`,
          tenantId,
          email: orderData.customer.email,
          firstName: orderData.customer.firstName,
          lastName: orderData.customer.lastName,
          phone: orderData.customer.phone,
          address: orderData.customer.address,
          city: orderData.customer.city,
          postalCode: orderData.customer.postalCode,
          createdAt: new Date().toISOString()
        };
        mockCustomers.push(customer);
      }
      
      // Create order
      const order = {
        id: `order_${Date.now()}`,
        tenantId,
        customerId: customer.id,
        orderNumber: `${req.tenant?.subdomain?.toUpperCase()}-${String(orderCounter++).padStart(4, '0')}`,
        status: 'PENDING',
        type: orderData.type,
        source: 'WEBSITE',
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
        customerName: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
        customerEmail: orderData.customer.email,
        customerPhone: orderData.customer.phone,
        deliveryAddress: orderData.customer.address,
        deliveryCity: orderData.customer.city,
        deliveryPostal: orderData.customer.postalCode,
        deliveryNotes: orderData.notes,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentMethod === 'CASH' ? 'PENDING' : 'PENDING',
        cashAmount: orderData.cashAmount,
        estimatedTime: orderData.type === 'DELIVERY' ? 45 : 25, // minutes
        scheduledFor: orderData.scheduledFor ? new Date(orderData.scheduledFor) : null,
        items: orderItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockOrders.push(order);
      
      console.log(`✅ Order created: ${order.orderNumber} - €${order.total}`);
      
      // Emit real-time event (if Socket.IO is available)
      if (req.io) {
        req.io.to(`tenant-${tenantId}`).emit('new-order', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          type: order.type,
          estimatedTime: order.estimatedTime
        });
      }
      
      // Return order response
      const orderResponse = {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        estimatedTime: order.estimatedTime,
        customer: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone
        },
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.total
        })),
        paymentUrl: order.paymentMethod !== 'CASH' ? `/checkout/${order.id}` : null
      };
      
      res.status(201).json(successResponse(orderResponse, 'Order created successfully'));
      
    } catch (error) {
      console.error('❌ Error creating order:', error);
      next(error);
    }
  }
  
  // Get orders for tenant
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        throw new AppError('Tenant not found', 404);
      }
      
      const { status, type, limit = 20 } = req.query;
      
      let filteredOrders = mockOrders.filter(order => order.tenantId === tenantId);
      
      if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }
      
      if (type) {
        filteredOrders = filteredOrders.filter(order => order.type === type);
      }
      
      // Sort by creation date (newest first)
      filteredOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Limit results
      filteredOrders = filteredOrders.slice(0, parseInt(limit as string));
      
      console.log(`📋 Found ${filteredOrders.length} orders for tenant`);
      
      res.json(successResponse(filteredOrders));
      
    } catch (error) {
      console.error('❌ Error getting orders:', error);
      next(error);
    }
  }
  
  // Update order status
  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, estimatedTime, notes } = req.body;
      
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        throw new AppError('Tenant not found', 404);
      }
      
      const order = mockOrders.find(o => o.id === id && o.tenantId === tenantId);
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      
      // Update order
      order.status = status;
      order.updatedAt = new Date().toISOString();
      
      if (estimatedTime) {
        order.estimatedTime = estimatedTime;
      }
      
      if (notes) {
        order.notes = notes;
      }
      
      console.log(`🔄 Order ${order.orderNumber} status updated to: ${status}`);
      
      // Emit real-time event
      if (req.io) {
        req.io.to(`tenant-${tenantId}`).emit('order-status-updated', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          estimatedTime: order.estimatedTime
        });
        
        // Emit to customer tracking
        req.io.to(`order-${order.id}`).emit('status-update', {
          status: order.status,
          estimatedTime: order.estimatedTime,
          message: `Your order is now ${status.toLowerCase()}`
        });
      }
      
      res.json(successResponse(order, 'Order status updated successfully'));
      
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      next(error);
    }
  }
  
  // Get single order
  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      
      if (!tenantId) {
        throw new AppError('Tenant not found', 404);
      }
      
      const order = mockOrders.find(o => o.id === id && o.tenantId === tenantId);
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      
      res.json(successResponse(order));
      
    } catch (error) {
      next(error);
    }
  }
  
  // Track order (public endpoint for customers)
  async trackOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderNumber } = req.params;
      
      const order = mockOrders.find(o => o.orderNumber === orderNumber);
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      
      const trackingInfo = {
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedTime: order.estimatedTime,
        total: order.total,
        items: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity
        })),
        createdAt: order.createdAt
      };
      
      res.json(successResponse(trackingInfo));
      
    } catch (error) {
      next(error);
    }
  }
}