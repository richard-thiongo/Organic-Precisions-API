# Organic Precisions API - Shop Management Documentation

This document outlines the features and architectural design of the Organic Precisions backend. The system is built for high-traffic scalability and strict data integrity.

## Core Features & Purpose

### 1. Unified Product Creation
- **Endpoint**: `POST /api/products`
- **Purpose**: To streamline inventory setup and ensure data consistency.
- **Business Benefit**: Allows you to create a product and all its variants (sizes, weights, prices) in a single operation.
- **Implementation**: Uses **SQL Transactions**. If any variant fails to save, the system "rolls back" the entire request, preventing partial or corrupt product entries.

### 2. Shopping Cart / Sale Processing
- **Endpoint**: `POST /api/products/sell`
- **Purpose**: To handle multi-item transactions safely.
- **Business Benefit**: Automatically manages inventory during a sale. It ensures you never sell more than you have in stock.
- **Implementation**: 
    - **Availability Check**: Verifies stock for *all* items in the cart before processing.
    - **Atomic Updates**: Uses atomic decrements (`stock - quantity`) within a transaction to prevent race conditions during busy hours.

### 3. Intelligent Stock Replenishment
- **Endpoint**: `PATCH /api/products/stock`
- **Purpose**: To simplify daily inventory updates.
- **Business Benefit**: When new shipments arrive, you simply tell the system how much was added. No manual math is required, reducing human error.
- **Implementation**: Uses increment logic to safely add to existing stock levels.

### 4. Dynamic Product Editing
- **Endpoint**: `PUT /api/products/:id`
- **Purpose**: To provide total flexibility for inventory management.
- **Business Benefit**: Update product names, categories, or prices, and even add new variants to existing products in one step.
- **Implementation**: Smart detection that updates existing variants or creates new ones as needed.

### 5. Inventory Listing
- **Endpoint**: `GET /api/products`
- **Purpose**: To provide a real-time overview of your entire shop's inventory.
- **Business Benefit**: Instantly see what's in stock, what's running low, and the current value of your goods.
- **Implementation**: Uses a complex SQL query with `json_agg` to return products and their variants in a nested, frontend-friendly format.

### 6. Permanent Product Removal
- **Endpoint**: `DELETE /api/products/:id`
- **Purpose**: To remove discontinued or obsolete inventory.
- **Business Benefit**: Keep your dashboard clean and focused only on active items.
- **Implementation**: Leverages database **CASCADE** deletes to safely remove a product and all its associated variants in one atomic step.

## Technical Standards

### Domain-Driven Design (DDD)
The codebase is organized by business domain (`modules/product`) rather than technical type. This makes the system easier to navigate and scale as more features (Users, Orders, Suppliers) are added.

### High-Traffic Engineering
- **Connection Pooling**: Configured to handle up to 50 concurrent database clients for maximum throughput.
- **Defensive Validation**: Uses **Joi** schemas to validate every request, ensuring only clean data reaches your database.
- **Global Error Handling**: A centralized system that catches all errors and provides consistent, professional JSON responses.

---

## Example Sale Request Body (Shopping Cart)

```json
{
  "items": [
    { "variant_id": 1, "quantity": 2 },
    { "variant_id": 5, "quantity": 1 }
  ]
}
```
