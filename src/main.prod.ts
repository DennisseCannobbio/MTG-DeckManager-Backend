import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Infrastructure - usando rutas relativas para producción
import { DatabaseConnection } from './infrastructure/config/database';
import { MongoDeckRepository } from './infrastructure/repositories/MongoDeckRepository';

// Application
import { DeckUseCases } from './application/use-cases/DeckUseCases';

// Presentation
import { DeckController } from './presentation/controllers/DeckController';
import { createDeckRoutes } from './presentation/routes/deckRoutes';
import { errorHandler } from './presentation/middlewares/validationMiddleware';

// Load environment variables
dotenv.config();

class Server {
  private app: Application;
  private port: number;
  private database: DatabaseConnection;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.database = DatabaseConnection.getInstance();
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealth = await this.database.healthCheck();
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          database: dbHealth
        });
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Database connection failed'
        });
      }
    });

    // API info endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'MTG Deck Manager API',
        version: '1.0.0',
        description: 'REST API for managing Magic: The Gathering deck collections',
        endpoints: {
          health: '/health',
          docs: '/api-docs',
          decks: '/api/decks'
        },
        documentation: '/api-docs'
      });
    });

    // Initialize dependency injection and routes
    this.setupDependencyInjection();

    // 404 handler for unknown routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        error: 'NOT_FOUND'
      });
    });
  }

  private setupDependencyInjection(): void {
    // 🔧 DEPENDENCY INJECTION - Where the magic happens!
    
    // 1️⃣ Infrastructure Layer - Repository Implementation
    const deckRepository = new MongoDeckRepository();
    
    // 2️⃣ Application Layer - Use Cases (Business Logic)
    const deckUseCases = new DeckUseCases(deckRepository);
    
    // 3️⃣ Presentation Layer - Controllers
    const deckController = new DeckController(deckUseCases);
    
    // 4️⃣ Routes - HTTP endpoints
    const deckRoutes = createDeckRoutes(deckController);
    
    // 5️⃣ Mount routes on the app
    this.app.use('/api/decks', deckRoutes);

    console.log('✅ Dependency injection configured successfully');
    console.log('🔧 Layers connected: Infrastructure → Application → Presentation');
  }

  private initializeErrorHandling(): void {
    // Global error handler (must be last middleware)
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database first
      console.log('🔄 Connecting to database...');
      await this.database.connect();
      
      // Start the server
      this.app.listen(this.port, () => {
        console.log('');
        console.log('🚀 MTG Deck Manager API Server Started! (Docker Mode)');
        console.log('==========================================');
        console.log(`📡 Server running on: http://localhost:${this.port}`);
        console.log(`🏥 Health check: http://localhost:${this.port}/health`);
        console.log(`📚 API info: http://localhost:${this.port}/api`);
        console.log(`🎴 Decks API: http://localhost:${this.port}/api/decks`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🗄️ Database: ${process.env.MONGODB_URI}`);
        console.log('==========================================');
        console.log('');
      });

    } catch (error: any) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      console.log('🔄 Shutting down server...');
      await this.database.disconnect();
      console.log('✅ Server shut down successfully');
    } catch (error: any) {
      console.error('❌ Error during shutdown:', error.message);
    }
  }
}

// Server instance
const server = new Server();

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('📡 SIGTERM received, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📡 SIGINT received, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
server.start().catch((error) => {
  console.error('💥 Failed to start server:', error);
  process.exit(1);
});

export default server;