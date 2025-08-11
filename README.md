# 🎴 MTG Deck Manager - Backend API

A comprehensive REST API for managing Magic: The Gathering deck collections built with **Clean Architecture**, **TypeScript**, and **MongoDB**.

## 🌟 Features

### ✨ Core Functionality

- **Complete CRUD operations** for MTG deck management
- **Advanced search** with keyword filtering
- **Intelligent filtering** by deck type, tier rating, game stage, and more
- **Pagination support** for large collections
- **Data validation** with comprehensive error handling
- **RESTful API design** following industry standards

### 🏗️ Architecture & Technical Stack

- **Clean Architecture** with clear separation of concerns
- **Domain-Driven Design** principles
- **TypeScript** for type safety and better developer experience
- **MongoDB** with Mongoose ODM
- **Express.js** for robust HTTP handling
- **Docker** containerization for easy deployment
- **Path aliases** for clean imports

### 🛡️ Security & Reliability

- **Input validation** with Joi schemas
- **Error handling** with structured responses
- **Health checks** for monitoring
- **Security headers** with Helmet.js
- **CORS** configuration
- **Environment-based configuration**

## 📋 Deck Model

Each deck contains the following information:

| Field              | Type    | Description                           |
| ------------------ | ------- | ------------------------------------- |
| `name`             | String  | Unique deck name                      |
| `description`      | String  | Deck description and strategy         |
| `colors`           | Array   | MTG colors (W, U, B, R, G, C)         |
| `tierRating`       | Enum    | Power level (S, A, B, C, D)           |
| `deckType`         | Enum    | Strategy type (AGGRO, COMBO, CONTROL) |
| `gameStage`        | Enum    | Optimal game phase (EARLY, MID, LATE) |
| `hasCardSleeves`   | Boolean | Protection status                     |
| `isComplete`       | Boolean | Completion status                     |
| `storageLocation`  | String  | Physical storage location             |
| `planeswalker`     | String  | Main planeswalker (optional)          |
| `descriptiveImage` | String  | Deck image URL (optional)             |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **MongoDB** 6.0 or higher (or Docker)
- **npm** or **yarn**

### 🐳 Docker Setup (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mtg-deck-manager-backend
   ```

2. **Setup environment variables**

   ```bash
   cp .env.docker.example .env.docker
   # Edit .env.docker with your configuration
   ```

3. **Run with Docker Compose**

   ```bash
   docker-compose --env-file .env.docker up --build
   ```

4. **API ready!** 🎉
   - Health check: http://localhost:3000/health
   - API documentation: http://localhost:3000/api
   - Decks endpoint: http://localhost:3000/api/decks

### 💻 Local Development Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Start MongoDB** (if not using Docker)

   ```bash
   # Using MongoDB service
   brew services start mongodb/brew/mongodb-community

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### 🏥 Health & Info

| Method | Endpoint  | Description     |
| ------ | --------- | --------------- |
| `GET`  | `/health` | Health check    |
| `GET`  | `/api`    | API information |

### 🎴 Deck Management

| Method   | Endpoint         | Description                     |
| -------- | ---------------- | ------------------------------- |
| `POST`   | `/api/decks`     | Create new deck                 |
| `GET`    | `/api/decks`     | Get all decks (with pagination) |
| `GET`    | `/api/decks/:id` | Get deck by ID                  |
| `PUT`    | `/api/decks/:id` | Update deck                     |
| `DELETE` | `/api/decks/:id` | Delete deck                     |

### 🔍 Search & Filters

| Method | Endpoint                                   | Description           |
| ------ | ------------------------------------------ | --------------------- |
| `GET`  | `/api/decks/search/keyword?keyword=dragon` | Search by keyword     |
| `GET`  | `/api/decks/filter/incomplete`             | Get incomplete decks  |
| `GET`  | `/api/decks/location/:location`            | Get decks by location |

### 📊 Query Parameters for GET /api/decks

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (name, createdAt, updatedAt, tierRating)
- `sortOrder`: Sort direction (asc, desc)
- `deckType`: Filter by type (AGGRO, COMBO, CONTROL)
- `gameStage`: Filter by stage (EARLY, MID, LATE)
- `tierRating`: Filter by tier (S, A, B, C, D)
- `isComplete`: Filter by completion (true, false)
- `hasCardSleeves`: Filter by sleeves (true, false)
- `storageLocation`: Filter by location

## 📖 Usage Examples

### Create a Deck

```bash
curl -X POST http://localhost:3000/api/decks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lightning Aggro",
    "description": "Fast red aggro deck with lightning bolts",
    "colors": ["R"],
    "tierRating": "A",
    "hasCardSleeves": true,
    "isComplete": true,
    "deckType": "AGGRO",
    "gameStage": "EARLY",
    "storageLocation": "Red Box #1",
    "planeswalker": "Chandra"
  }'
```

### Get Decks with Filters

```bash
# Get S-tier aggro decks, sorted by name
curl "http://localhost:3000/api/decks?tierRating=S&deckType=AGGRO&sortBy=name&sortOrder=asc"
```

### Search Decks

```bash
# Search for decks containing "dragon"
curl "http://localhost:3000/api/decks/search/keyword?keyword=dragon"
```

## 🏗️ Project Structure

```
src/
├── domain/                # Domain layer (entities, interfaces)
│   ├── entities/          # Domain entities
│   └── repositories/      # Repository interfaces
│   └── types/             # Types
├── application/           # Application layer (use cases)
│   └── dto/               # DTOs
│   └── use-cases/         # Business logic
├── infrastructure/        # Infrastructure layer (external concerns)
│   ├── config/            # Database configuration
│   ├── database/          # Database schemas
│   └── repositories/      # Repository implementations
├── presentation/          # Presentation layer (HTTP)
│   ├── controllers/       # HTTP controllers
│   ├── routes/            # Route definitions
│   └── middlewares/       # Express middlewares
├── shared/                # Shared utilities
└── main.ts                # Application entry point
```

## 🛠️ Available Scripts

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start development server with hot reload |
| `npm run build`      | Build for production                     |
| `npm run start`      | Start production server                  |
| `npm run lint`       | Run ESLint                               |
| `npm run type-check` | Check TypeScript types                   |

## 🐳 Docker Commands

| Command                                              | Description        |
| ---------------------------------------------------- | ------------------ |
| `docker-compose --env-file .env.docker up`           | Start all services |
| `docker-compose --env-file .env.docker up --build`   | Rebuild and start  |
| `docker-compose --env-file .env.docker down`         | Stop all services  |
| `docker-compose --env-file .env.docker logs api`     | View API logs      |
| `docker-compose --env-file .env.docker logs mongodb` | View MongoDB logs  |

## 🔧 Environment Variables

### Required Variables (.env.docker)

```bash
# Application
NODE_ENV=production
API_PORT=3000
CORS_ORIGIN=http://localhost:4200

# Database
MONGO_DATABASE=mtg-deck-manager
MONGO_PORT=27017

# Logging
LOG_LEVEL=info
```

### Optional Variables

```bash
# Security
JWT_SECRET=your-secret-key
BCRYPT_ROUNDS=12

# File Upload
MAX_FILE_SIZE=5MB
UPLOAD_PATH=./uploads
```

## 🧪 Testing the API

Test manually:

```bash
# Health check
curl http://localhost:3000/health

# Create a deck
curl -X POST http://localhost:3000/api/decks \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Deck","description":"Test","colors":["R"],"tierRating":"A","hasCardSleeves":true,"isComplete":true,"deckType":"AGGRO","gameStage":"EARLY","storageLocation":"Test Box"}'

# Get all decks
curl http://localhost:3000/api/decks
```

## 📋 API Documentation

The API follows OpenAPI 3.0 specification. See `api-contract.yaml` for complete documentation.

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": { ... }  // Only for paginated endpoints
}
```

### Error Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": [ ... ]     // Only for validation errors
}
```

## 🚀 Deployment

### Production Checklist

- [ ] Set secure environment variables
- [ ] Configure MongoDB with authentication
- [ ] Set up reverse proxy (nginx)
- [ ] Configure SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Set up automated backups

### Cloud Deployment Options

- **AWS**: ECS, Lambda, or EC2
- **Google Cloud**: Cloud Run or GKE
- **Azure**: Container Instances or AKS
- **DigitalOcean**: App Platform or Droplets
- **Heroku**: Container deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Magic: The Gathering® is a trademark of Wizards of the Coast LLC
- Built with love for the MTG community
- Inspired by Clean Architecture principles

---

**Made with ❤️ by Dennisse Cannobbio for Magic: The Gathering players**

For questions or support, please open an issue or contact [dennissecannobbio@gmail.com]
