# Wholesale Catalogue & Ordering Platform

<div align="center">

### Full-Stack B2B Catalogue and Order Management System

A modern wholesale catalogue and ordering platform that enables customers to browse products across multiple agencies, manage a shopping cart, place orders, and optionally forward orders to WhatsApp. A secure owner dashboard provides complete catalogue and order management.

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Customer Flow](#-customer-flow)
- [Owner Dashboard](#-owner-dashboard)
- [Order Management](#-order-management)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Backend Architecture](#-backend-architecture)
- [Frontend Architecture](#-frontend-architecture)
- [Security](#-security)
- [Database Design](#-database-design)
- [API Reference](#-api-reference)
- [Environment Configuration](#-environment-configuration)
- [Local Development](#-local-development)
- [Running the Application](#-running-the-application)
- [Production Build](#-production-build)
- [Docker](#-docker)
- [Deployment](#-deployment)
- [PWA and Mobile](#-pwa-and-mobile)
- [Git and Secret Management](#-git-and-secret-management)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)
- [Author](#-author)

---

# 📖 Overview

This project is a full-stack **B2B wholesale catalogue and ordering platform** designed to digitize the traditional product ordering process used by wholesale distribution businesses.

The application provides two primary experiences.

### Customer

Customers can access the catalogue without creating an account. They can:

- Browse agencies
- Browse products
- Search products
- Select product variants
- Set quantities
- Add products to a cart
- Enter shop information
- Place orders
- Forward orders to WhatsApp

### Owner

The owner has a dedicated secured dashboard protected using **JWT authentication and Spring Security**.

The owner can:

- Manage agencies
- Manage products
- Manage product variants
- View incoming orders
- Update order status
- Change the owner password

The application follows a clean separation between the frontend and backend, allowing the REST API to support the web application, Progressive Web App, and future mobile clients.

---

# 🎯 Problem Statement

Traditional wholesale ordering processes often depend on:

- Phone calls
- WhatsApp messages
- Manual product lists
- Paper-based catalogues
- Repeated product inquiries
- Manual order processing

This can make it difficult to:

- Find products quickly
- Maintain a centralized catalogue
- Manage multiple agencies
- Track incoming orders
- Maintain product variants
- Reduce repetitive communication

---

# 💡 Solution

The platform provides a centralized digital catalogue where customers can:

```text
Browse Agencies
      ↓
Browse Products
      ↓
Search Products
      ↓
Select Variant
      ↓
Set Quantity
      ↓
Add to Cart
      ↓
Checkout
      ↓
Place Order
      ↓
WhatsApp Notification
```

The owner can then manage the complete catalogue and order workflow from a secured dashboard.

---

# ✨ Key Features

## 👤 Customer Features

- No customer registration required
- Browse products across multiple agencies
- Filter products by agency
- Search products across all agencies
- Debounced product search
- Product variant selection
- Quantity management
- Persistent shopping cart
- Cart item count
- One-step checkout
- Shop name collection
- Customer phone number collection
- Order creation through REST API
- WhatsApp pre-filled order message
- Responsive mobile-friendly interface
- Progressive Web App support

---

## 🔐 Owner Features

- Dedicated owner login
- JWT authentication
- Spring Security authorization
- BCrypt password hashing
- Role-based access control
- Agency CRUD operations
- Product CRUD operations
- Product variant CRUD operations
- Soft delete/deactivation
- Order management
- Order status management
- Owner password change
- Responsive admin dashboard
- Mobile navigation drawer
- Toast notifications
- Confirmation dialogs

---

# 🛒 Customer Flow

```text
                    ┌───────────────────┐
                    │   Open Website    │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Browse Agencies   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Browse Products   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Search / Filter   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Select Variant    │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Select Quantity   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    Add to Cart    │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │     Checkout      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    Place Order    │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
             ┌─────────────┐     ┌─────────────┐
             │    MySQL    │     │  WhatsApp   │
             │   Storage   │     │ Notification│
             └─────────────┘     └─────────────┘
```

---

# 👨‍💼 Owner Dashboard

The owner dashboard provides centralized management for the entire catalogue.

## Agency Management

The owner can:

- Create agencies
- Update agencies
- Deactivate agencies
- View active agencies

## Product Management

The owner can:

- Create products
- Assign products to agencies
- Update product information
- Deactivate products

## Product Variant Management

The owner can:

- Create variants
- Define sizes
- Define units
- Define MRP
- Update variants
- Deactivate variants

## Order Management

The owner can:

- View incoming orders
- View order items
- View customer shop information
- Update order status
- Process orders through their lifecycle

---

# 📦 Order Management

Orders follow a controlled lifecycle:

```text
             ┌─────────┐
             │   NEW   │
             └────┬────┘
                  │
          ┌───────┴────────┐
          ▼                ▼
     ┌──────────┐    ┌──────────┐
     │ ACCEPTED │    │ REJECTED │
     └────┬─────┘    └──────────┘
          │
          ▼
     ┌───────────┐
     │ COMPLETED │
     └───────────┘
```

Orders older than **10 days** are automatically removed using a scheduled cleanup process.

---

# 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Programming Language | Java 21 |
| Backend Framework | Spring Boot 3.5.5 |
| Security | Spring Security |
| Authentication | JWT |
| Password Hashing | BCrypt |
| Persistence | Spring Data JPA |
| ORM | Hibernate |
| Database | MySQL 8 |
| API | REST |
| Frontend | React 18 |
| Build Tool | Vite 5 |
| Styling | HTML5, CSS3 |
| Mobile | Capacitor 6 |
| PWA | Service Worker + Web Manifest |
| Containerization | Docker |
| Version Control | Git / GitHub |
| Frontend Deployment | Netlify |
| Backend Deployment | Render |
| Database Hosting | Managed MySQL |

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      Customer        │
                         │  Browser / PWA / App │
                         └──────────┬───────────┘
                                    │
                                    │ HTTPS / JSON
                                    ▼
                         ┌──────────────────────┐
                         │     React Frontend   │
                         │                      │
                         │  Components         │
                         │  Product Catalogue   │
                         │  Search              │
                         │  Cart                │
                         │  Checkout            │
                         │  Owner Dashboard     │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                    ┌───────────────────────────────┐
                    │       Spring Boot API         │
                    │                               │
                    │ Controllers                   │
                    │ Services                      │
                    │ Repositories                  │
                    │ Spring Security               │
                    │ JWT Authentication            │
                    │ Exception Handling             │
                    └──────────────┬────────────────┘
                                   │
                                   │ JPA / Hibernate
                                   ▼
                          ┌──────────────────┐
                          │      MySQL       │
                          │     Database     │
                          └──────────────────┘
```

---

# 📁 Project Structure

```text
project-root/
│
├── backend/
│   │
│   └── shop-catalogue-backend/
│       │
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── ...
│       │   │   │
│       │   │   └── resources/
│       │   │       ├── application.properties
│       │   │       └── application-example.properties
│       │   │
│       │   └── test/
│       │
│       ├── Dockerfile
│       ├── pom.xml
│       └── ...
│
├── frontend/
│   │
│   ├── public/
│   │   ├── manifest
│   │   ├── icons
│   │   └── service worker
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── .gitignore
├── README.md
└── ...
```

---

# ⚙️ Backend Architecture

The backend follows a layered architecture:

```text
Controller
     ↓
Service
     ↓
Repository
     ↓
Database
```

## Controller Layer

Responsible for:

- HTTP requests
- Request validation
- API responses
- Endpoint routing

Main controllers include:

```text
AuthController
CatalogueController
OrderController
OwnerController
OwnerOrderController
```

## Service Layer

Responsible for:

- Business logic
- Authentication
- Catalogue operations
- Order processing
- Owner operations
- Data initialization
- Scheduled cleanup

Main services include:

```text
AuthService
OrderService
DataInitializer
OrderCleanupService
```

## Repository Layer

Uses Spring Data JPA to communicate with MySQL.

## Entity Layer

Main entities include:

```text
User
Agency
Product
ProductVariant
ShopOrder
OrderItem
```

## DTO Layer

Data Transfer Objects are used to separate API request/response models from database entities.

---

# 🖥️ Frontend Architecture

The React frontend communicates with the Spring Boot backend using REST APIs.

```text
React Application
       │
       ├── Home
       ├── Agency Catalogue
       ├── Product Search
       ├── Cart
       ├── Checkout
       ├── Owner Login
       └── Owner Dashboard
                │
                ▼
          REST API Client
                │
                ▼
        Spring Boot Backend
```

The frontend uses:

- React components
- JavaScript
- REST API integration
- State management
- Custom CSS
- Responsive layouts
- PWA functionality

---

# 🔐 Security

Security is implemented using **Spring Security and JWT**.

## Authentication Flow

```text
Owner
  │
  ▼
Login
  │
  ▼
Spring Security
  │
  ▼
Validate Credentials
  │
  ▼
BCrypt Password Verification
  │
  ▼
Generate JWT
  │
  ▼
Frontend
  │
  ▼
JWT Sent With Protected Requests
  │
  ▼
JWT Filter
  │
  ▼
ROLE_OWNER Authorization
```

## Security Rules

| Endpoint | Access |
|---|---|
| `POST /api/auth/login` | Public |
| `/api/catalogue/**` | Public |
| `POST /api/orders` | Public |
| `/api/owner/**` | JWT + `ROLE_OWNER` |

All owner-side write operations are authorized on the backend.

Frontend button visibility is only a user-interface feature and is not used as the actual security mechanism.

---

# 🔑 Password Security

Owner passwords are stored using BCrypt hashing.

Passwords are never returned in API responses.

Sensitive configuration such as:

```text
DB_PASSWORD
JWT_SECRET
OWNER_PASSWORD
```

is supplied through environment variables rather than committed to source control.

---

# 🗄️ Database Design

## User

Stores the owner account.

```text
User
├── id
├── email
├── password
├── name
├── phone
└── role
```

## Agency

Represents a distributor or brand.

```text
Agency
├── id
├── name
└── active
```

## Product

Belongs to an agency.

```text
Product
├── id
├── name
├── description
├── image
├── active
└── agency_id
```

## ProductVariant

Represents product size, unit and MRP options.

```text
ProductVariant
├── id
├── size
├── unit
├── mrp
├── active
└── product_id
```

## ShopOrder

Stores customer order information.

```text
ShopOrder
├── id
├── shopName
├── phone
├── status
└── createdAt
```

## OrderItem

Stores individual products within an order.

```text
OrderItem
├── id
├── productName
├── size
├── unit
├── quantity
├── mrp
└── order_id
```

Order items snapshot important product information so historical orders remain meaningful even if the catalogue changes later.

---

# 📡 API Reference

## Authentication

### Owner Login

```http
POST /api/auth/login
```

Used by the owner to authenticate and receive a JWT.

---

# 📚 Public Catalogue APIs

### Get Agencies

```http
GET /api/catalogue/agencies
```

### Get All Products

```http
GET /api/catalogue/products
```

### Get Products by Agency

```http
GET /api/catalogue/agencies/{agencyId}/products
```

### Get Product Variants

```http
GET /api/catalogue/products/{productId}/variants
```

### Search Products

```http
GET /api/catalogue/search?q={query}
```

---

# 🛒 Order API

### Place Order

```http
POST /api/orders
```

Customer orders can be submitted without authentication.

---

# 👨‍💼 Owner APIs

All endpoints under `/api/owner/**` require:

```http
Authorization: Bearer <JWT>
```

### Change Password

```http
PUT /api/owner/account/password
```

### Create Agency

```http
POST /api/owner/agencies
```

### Update Agency

```http
PUT /api/owner/agencies/{id}
```

### Delete / Deactivate Agency

```http
DELETE /api/owner/agencies/{id}
```

### Create Product

```http
POST /api/owner/products
```

### Update Product

```http
PUT /api/owner/products/{id}
```

### Delete / Deactivate Product

```http
DELETE /api/owner/products/{id}
```

### Create Product Variant

```http
POST /api/owner/products/{productId}/variants
```

### Update Product Variant

```http
PUT /api/owner/variants/{id}
```

### Delete / Deactivate Product Variant

```http
DELETE /api/owner/variants/{id}
```

### Get Orders

```http
GET /api/owner/orders
```

### Update Order Status

```http
PUT /api/owner/orders/{id}/status
```

---

# 🌎 Environment Configuration

The application is designed to keep sensitive configuration outside the source code.

## Backend Environment Variables

| Variable | Description |
|---|---|
| `DB_URL` | MySQL JDBC connection URL |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `PORT` | Application server port |
| `JWT_SECRET` | JWT signing secret |
| `WHATSAPP_NUMBER` | WhatsApp number receiving orders |
| `OWNER_EMAIL` | Initial owner email |
| `OWNER_PASSWORD` | Initial owner password |
| `OWNER_NAME` | Owner name |
| `OWNER_SHOP_NAME` | Shop/business name |
| `OWNER_PHONE` | Owner phone number |

---

## Frontend Environment Variables

Create a local frontend environment file:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:8080
```

For production:

```env
VITE_API_URL=https://your-backend-domain
```

Never put database credentials, JWT secrets, or owner passwords inside frontend environment variables.

---

# 🛠️ Local Development

## Prerequisites

Install:

```text
Java 21
MySQL 8
Node.js 18+
npm
Maven
Git
```

Verify Java:

```bash
java -version
```

Verify Node.js:

```bash
node -v
```

Verify npm:

```bash
npm -v
```

Verify Maven:

```bash
mvn -version
```

---

# 🗃️ Database Setup

Start MySQL and create the database:

```sql
CREATE DATABASE shop_catalogue;
```

The application uses Hibernate/JPA for database table creation and updates.

---

# 🔧 Backend Setup

Navigate to:

```bash
cd backend/shop-catalogue-backend
```

Configure the required environment variables.

Example:

```env
DB_URL=jdbc:mysql://localhost:3306/shop_catalogue?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_database_password

WHATSAPP_NUMBER=your_whatsapp_number

OWNER_EMAIL=owner@example.com
OWNER_PASSWORD=your_owner_password
OWNER_NAME=Shop Owner
OWNER_SHOP_NAME=Your Shop
OWNER_PHONE=your_phone_number

JWT_SECRET=your_long_random_secret
```

Run the backend:

```bash
mvn spring-boot:run
```

The backend will normally be available at:

```text
http://localhost:8080
```

---

# 💻 Frontend Setup

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🏭 Production Build

## Backend

Create the production JAR:

```bash
mvn clean package
```

The generated JAR will be available inside:

```text
target/
```

Run it using:

```bash
java -jar target/<application-name>.jar
```

## Frontend

Create the production build:

```bash
npm run build
```

The generated files will be placed in:

```text
dist/
```

Preview the production build:

```bash
npm run preview
```

---

# 🐳 Docker

The backend supports Docker deployment.

Build the image:

```bash
docker build -t shop-catalogue-backend .
```

Run the container:

```bash
docker run -p 8080:8080 shop-catalogue-backend
```

Production environment variables should be supplied externally.

Example:

```bash
docker run \
  -p 8080:8080 \
  -e DB_URL="your_database_url" \
  -e DB_USERNAME="your_database_username" \
  -e DB_PASSWORD="your_database_password" \
  -e JWT_SECRET="your_jwt_secret" \
  shop-catalogue-backend
```

Never hardcode production credentials inside the Dockerfile.

---

# ☁️ Deployment

The application can be deployed using a separated frontend/backend architecture.

```text
                 INTERNET
                     │
                     ▼
          ┌────────────────────┐
          │      Netlify       │
          │   React Frontend   │
          └─────────┬──────────┘
                    │
                    │ HTTPS
                    ▼
          ┌────────────────────┐
          │      Render        │
          │  Spring Boot API   │
          │      Docker        │
          └─────────┬──────────┘
                    │
                    │ JDBC
                    ▼
          ┌────────────────────┐
          │   Managed MySQL    │
          │      Database      │
          └────────────────────┘
```

## Deployment Components

| Layer | Service |
|---|---|
| Frontend | Netlify |
| Backend | Render |
| Backend Container | Docker |
| Database | Managed MySQL |
| Authentication | JWT |

---

# 🚀 Production Environment Variables

Configure these variables through the hosting provider's environment-variable settings:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
PORT
JWT_SECRET
WHATSAPP_NUMBER
OWNER_EMAIL
OWNER_PASSWORD
OWNER_NAME
OWNER_SHOP_NAME
OWNER_PHONE
```

Do not commit actual values to GitHub.

---

# 📱 Progressive Web App

The frontend supports Progressive Web App functionality.

Features include:

- Installable web application
- Web app manifest
- Application icons
- Service worker
- Offline application shell
- Responsive mobile design

---

# 📲 Android Support

The frontend can be packaged as an Android application using Capacitor.

Before creating the Android build, configure:

```env
VITE_API_URL=https://your-backend-domain
```

The backend must be accessible from the Android device.

Do not use:

```text
http://localhost:8080
```

as the production backend URL for Android because `localhost` refers to the Android device itself.

---

# 🧹 Automatic Order Cleanup

A scheduled backend process automatically removes orders older than 10 days.

```text
New Order
    ↓
Database
    ↓
Order Processing
    ↓
10+ Days
    ↓
Scheduled Cleanup
    ↓
Order Removed
```

This prevents unnecessary accumulation of old order records.

---

# 📲 WhatsApp Integration

After an order is placed, the application can generate a pre-filled WhatsApp message containing order information.

A typical message can contain:

```text
Shop Name
Customer Phone
Order Items
Product Name
Variant
Quantity
MRP
```

The WhatsApp destination number is configured using:

```env
WHATSAPP_NUMBER=your_whatsapp_number
```

---

# 🔎 Product Search

The application provides product search across agencies.

Example:

```text
Customer searches:
"shampoo"

        ↓

Backend Search API

        ↓

Matching Products
```

The frontend uses debouncing to reduce unnecessary API requests while the user is typing.

---

# 📦 Product Variant Management

Products can have multiple variants.

Example:

```text
Product:
Shampoo

Variants:
100 ml
200 ml
500 ml
1 L
```

Each variant can contain:

```text
Size
Unit
MRP
Active Status
```

Customers select the required variant before adding the product to the cart.

---

# 🛡️ Data Protection

The application follows several security practices:

- JWT authentication
- BCrypt password hashing
- Server-side authorization
- DTO-based API responses
- Environment-based secrets
- No production credentials in source code
- Protected owner endpoints
- Database credentials kept outside Git
- `.env` files excluded from Git

---

# 🚫 GitHub Secret Management

The following files should never be committed:

```text
.env
.env.*
*.env
application.properties
```

Generated files should also be ignored:

```text
target/
node_modules/
dist/
build/
.idea/
*.iml
```

Recommended `.gitignore`:

```gitignore
# Environment variables
.env
.env.*
*.env

# Spring Boot
application.properties
application-*.properties
target/
*.class
*.log

# Node / React
node_modules/
dist/
build/

# IntelliJ
.idea/
*.iml

# VS Code
.vscode/

# Operating System
.DS_Store
Thumbs.db
```

---

# 🔄 Git Workflow

Clone the repository:

```bash
git clone https://github.com/<your-username>/<your-repository>.git
```

Check changes:

```bash
git status
```

Stage changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Describe your changes"
```

Push:

```bash
git push
```

Before every push, verify that sensitive files are not staged:

```bash
git status
```

---

# 🧪 Testing

Automated testing can be expanded using:

```text
JUnit
Spring Boot Test
MockMvc
Mockito
```

Recommended test coverage includes:

- Authentication tests
- JWT validation tests
- Agency CRUD tests
- Product CRUD tests
- Product variant tests
- Order creation tests
- Order status tests
- Security authorization tests

---

# 🗺️ Future Enhancements

- [ ] Customer order tracking
- [ ] Order lookup using phone number
- [ ] Customer order history
- [ ] Product image upload
- [ ] Agency reactivation
- [ ] Product reactivation
- [ ] Variant reactivation
- [ ] Advanced product filtering
- [ ] Pagination
- [ ] Dashboard analytics
- [ ] Sales reports
- [ ] Automated email notifications
- [ ] Automated backend tests
- [ ] JUnit test coverage
- [ ] MockMvc API testing
- [ ] Push notifications
- [ ] Improved mobile application

---

# 📊 Project Highlights

| Area | Implementation |
|---|---|
| Architecture | Full Stack |
| Backend | Spring Boot REST API |
| Frontend | React + Vite |
| Database | MySQL |
| Authentication | JWT |
| Authorization | Spring Security |
| Password Security | BCrypt |
| API | REST |
| Containerization | Docker |
| Mobile | Capacitor |
| PWA | Supported |
| Order Management | Supported |
| WhatsApp Orders | Supported |
| Environment Configuration | Supported |
| Deployment Ready | Yes |

---

# 🎓 Skills Demonstrated

## Backend

- Java
- Spring Boot
- Spring MVC
- Spring Security
- JWT
- REST APIs
- Spring Data JPA
- Hibernate
- MySQL
- Exception Handling
- Scheduled Tasks
- DTO Architecture

## Frontend

- React
- JavaScript
- HTML5
- CSS3
- Vite
- REST API Integration
- Responsive Design
- State Management
- PWA

## DevOps

- Git
- GitHub
- Docker
- Environment Variables
- Cloud Deployment
- Netlify
- Render
- Managed MySQL

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👤 Author

## Sandeep Vankayala

**Full Stack Developer**

### Technical Focus

```text
Java
Spring Boot
Spring Security
REST APIs
React
JavaScript
MySQL
Git
Docker
Cloud Deployment
```

---

<div align="center">

### ⭐ Thank You for Visiting

If you find this project useful, consider giving the repository a ⭐.

**Built with Java, Spring Boot, React, MySQL and modern web technologies.**

</div>
