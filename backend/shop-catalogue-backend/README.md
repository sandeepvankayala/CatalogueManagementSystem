# Shop Catalogue Backend

Backend for the shop's B2B catalogue/order application.

## Stack

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA / Hibernate
- MySQL
- Spring Security + JWT

## Current features

1. Customer registration
2. Owner approval/rejection
3. Customer login after approval
4. Owner login
5. Agencies with display order (15 or more)
6. Products under agencies
7. Multiple size/unit/MRP variants under one product
8. Customer catalogue APIs
9. Orders without totals/prices
10. WhatsApp `wa.me` link generation
11. Automatic order deletion after 10 days
12. Owner order status management

## Setup

### 1. Create MySQL database

```sql
CREATE DATABASE shop_catalogue;
```

### 2. Edit `src/main/resources/application.properties`

Change:

```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
shop.whatsapp.number=YOUR_WHATSAPP_NUMBER
```

Use WhatsApp number with country code and no `+`, spaces or dashes.

Example:

```properties
shop.whatsapp.number=919966343377
```

Also change the initial owner password:

```properties
shop.owner.password=ChangeMe123!
```

### 3. Run

In Eclipse:

- Right-click project
- Run As → Spring Boot App

Or terminal:

```bash
mvnw.cmd spring-boot:run
```

## Initial owner

The application creates the owner account automatically if it does not exist:

```text
Email: owner@shop.com
Password: ChangeMe123!
```

Change these values in `application.properties` before real use.

## Important API endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Owner

```text
GET  /api/owner/customers/pending
PUT  /api/owner/customers/{id}/approve
PUT  /api/owner/customers/{id}/reject

POST /api/owner/agencies
PUT  /api/owner/agencies/{id}
DELETE /api/owner/agencies/{id}

POST /api/owner/products
PUT  /api/owner/products/{id}
DELETE /api/owner/products/{id}

POST /api/owner/products/{productId}/variants
PUT  /api/owner/variants/{id}
DELETE /api/owner/variants/{id}

GET /api/owner/orders
PUT /api/owner/orders/{id}/status?status=COMPLETED
```

### Customer catalogue

```text
GET /api/catalogue/agencies
GET /api/catalogue/agencies/{agencyId}/products
GET /api/catalogue/products/{productId}/variants
```

### Customer order

```text
POST /api/orders
```

Example body:

```json
{
  "items": [
    {
      "variantId": 1,
      "quantity": 2
    },
    {
      "variantId": 7,
      "quantity": 3
    }
  ]
}
```

The response contains a `whatsappUrl`. The React frontend can open that URL when the customer clicks the WhatsApp button.

## WhatsApp format

The generated message is:

```text
New order — Sri Anuradha Agencies

Shop: vani fancy
Phone: 9966344377
Date: 8 Sept 2026

Items:
1. ujala liquid (25ml) — 2 Dozen
2. exo soap (75gms) — 3 Dozen
```

No price or order total is sent.

## Note about images

This first backend stores an `imageUrl` for each agency/product. We can add secure image upload/storage later.

## Security

Do not use the sample owner password or JWT secret in production. Change them before deploying.
