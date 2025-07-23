import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Controllers - Using PascalCase to match your convention
import { AuthController } from './controllers/AuthController';
import { OrderController } from './controllers/OrderController';
import { ProductController } from './controllers/ProductController';
import { AnalyticsController } from './controllers/AnalyticsController'; // Updated path

// Services  
import { AuthService } from './services/auth.service';
import { OrdersService } from './services/orders.service';
import { ProductsService } from './services/products.service';
import { SocketService } from './services/socket.service';

// Middleware
import { TenantResolver } from './middleware/tenant.resolver';

@Module({
  imports: [],
  controllers: [
    AppController,
    AuthController,
    OrderController,
    ProductController,
    AnalyticsController, // This stays the same
  ],
  providers: [
    AppService,
    AuthService,
    OrdersService,
    ProductsService,
    SocketService,
    TenantResolver,
  ],
})
export class AppModule {}