# GearUp API Testing Summary

**Date:** July 31, 2026  
**API Base URL:** https://gearup-backend-nine-psi.vercel.app  
**Tested Using:** Postman & Thunder Client

---

## 1. Authentication Tests

### 1.1 Admin Login
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "admin@gearup.com",
    "password": "Admin@12345"
  }
  ```
- **Response Status:** 200 OK
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "user": {
        "id": "admin-id",
        "name": "GearUp Admin",
        "email": "admin@gearup.com",
        "role": "ADMIN",
        "status": "ACTIVE"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Notes:** Credentials now configurable via env variables (ADMIN_EMAIL, ADMIN_PASSWORD)

### 1.2 Provider Login
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "provider@gearup.com",
    "password": "Provider@12345"
  }
  ```
- **Response Status:** 200 OK
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "user": {
        "id": "8d40a399-6b2b-4958-89db-cebfff67b76e",
        "name": "Trailhead Rentals",
        "email": "provider@gearup.com",
        "role": "PROVIDER",
        "status": "ACTIVE"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhkNDBhMzk5LTZiMmItNDk1OC04OWRiLWNlYmZmZjY3Yjc2ZSIsImVtYWlsIjoicHJvdmlkZXJAZ2VhcnVwLmNvbSIsInJvbGUiOiJQUk9WSURFUiIsImlhdCI6MTc4NTQ3OTI2OCwiZXhwIjoxNzg2MDg0MDY4fQ.6vZfgfFCfrDyDih3WpakZ3XNRFPyrlWmv9T5jjITpbk"
    }
  }
  ```

### 1.3 Customer Registration
- **Endpoint:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Test Customer",
    "email": "customer@example.com",
    "password": "Customer@12345",
    "phone": "01700000000",
    "role": "CUSTOMER"
  }
  ```
- **Response Status:** 201 Created

---

## 2. Public Endpoints Tests

### 2.1 Get All Gear
- **Endpoint:** `GET /api/gear`
- **Authentication:** Not required
- **Response Status:** 200 OK
- **Response Sample:**
  ```json
  {
    "success": true,
    "message": "Gear items retrieved successfully",
    "data": [
      {
        "id": "seed-gear-mountain-bike",
        "name": "Trek Mountain Bike",
        "description": "All-terrain mountain bike, great for trails and rough roads.",
        "brand": "Trek",
        "pricePerDay": "15",
        "stock": 5,
        "isAvailable": true,
        "category": {
          "id": "f576bf7a-0b10-41c0-a185-e1388ac7f0f5",
          "name": "Cycling"
        },
        "provider": {
          "id": "8d40a399-6b2b-4958-89db-cebfff67b76e",
          "name": "Trailhead Rentals"
        }
      }
    ]
  }
  ```

### 2.2 Get All Categories
- **Endpoint:** `GET /api/categories`
- **Authentication:** Not required
- **Response Status:** 200 OK
- **Categories in Database:**
  - Camping: `7b1f218e-b056-49d7-8704-3fd64542c68e`
  - Cycling: `f576bf7a-0b10-41c0-a185-e1388ac7f0f5`
  - Fitness: `2c00058f-f504-4652-a89f-e6ce27590453`
  - Water Sports: `34959b5a-f0ff-4ebb-a2bb-8622f0a29e2c`

### 2.3 API Health Check
- **Endpoint:** `GET /`
- **Response Status:** 200 OK
- **Response:**
  ```json
  {
    "success": true,
    "message": "GearUp API is running",
    "data": null
  }
  ```

---

## 3. Customer Rental Flow

### 3.1 Create Rental Order
- **Endpoint:** `POST /api/rentals`
- **Authentication:** Required (Customer token)
- **Request Body:**
  ```json
  {
    "startDate": "2026-08-01",
    "endDate": "2026-08-03",
    "items": [
      {
        "gearItemId": "seed-gear-mountain-bike",
        "quantity": 1
      }
    ]
  }
  ```
- **Response Status:** 201 Created
- **Response:**
  ```json
  {
    "success": true,
    "message": "Rental order created successfully",
    "data": {
      "id": "48716ae1-aa65-466f-8b59-dfb7945ac8a7",
      "status": "PLACED",
      "startDate": "2026-08-01T00:00:00.000Z",
      "endDate": "2026-08-03T00:00:00.000Z",
      "totalAmount": "30",
      "customerId": "398062bf-c79e-4b82-9eec-5a345cb66a72",
      "items": [
        {
          "id": "855bd682-999e-48e8-aab5-9582d1eb0acf",
          "quantity": 1,
          "price": "30",
          "rentalOrderId": "48716ae1-aa65-466f-8b59-dfb7945ac8a7",
          "gearItemId": "seed-gear-mountain-bike"
        }
      ]
    }
  }
  ```

### 3.2 Create Payment Session
- **Endpoint:** `POST /api/payments/create`
- **Authentication:** Required (Customer token)
- **Request Body:**
  ```json
  {
    "rentalOrderId": "48716ae1-aa65-466f-8b59-dfb7945ac8a7"
  }
  ```
- **Response Status:** 200 OK
- **Response:** Includes payment URL for SSLCommerz redirect

### 3.3 Get User Payments
- **Endpoint:** `GET /api/payments`
- **Authentication:** Required (Customer token)
- **Response Status:** 200 OK

### 3.4 Create Review
- **Endpoint:** `POST /api/reviews`
- **Authentication:** Required (Customer token)
- **Request Body:**
  ```json
  {
    "gearItemId": "seed-gear-mountain-bike",
    "rentalOrderId": "48716ae1-aa65-466f-8b59-dfb7945ac8a7",
    "rating": 5,
    "comment": "Great experience!"
  }
  ```
- **Response Status:** 201 Created

---

## 4. Provider Management Tests

### 4.1 Add New Gear (Provider)
- **Endpoint:** `POST /api/provider/gear`
- **Authentication:** Required (Provider token)
- **Request Body:**
  ```json
  {
    "name": "Camping Tent",
    "description": "Waterproof 2-person tent",
    "brand": "Northstar",
    "pricePerDay": 20,
    "stock": 3,
    "images": [],
    "specifications": {
      "capacity": "2 people"
    },
    "categoryId": "7b1f218e-b056-49d7-8704-3fd64542c68e"
  }
  ```
- **Response Status:** 201 Created
- **Gear ID Created:** `5015c324-9b78-4fe7-bc6c-611la1bd93`
- **Important:** Category ID must exist in database (use valid IDs from Categories endpoint)

### 4.2 Update Gear (Provider)
- **Endpoint:** `PUT /api/provider/gear/5015c324-9b78-4fe7-bc6c-611la1bd93`
- **Authentication:** Required (Provider token)
- **Request Body:**
  ```json
  {
    "pricePerDay": 25,
    "stock": 4,
    "isAvailable": true
  }
  ```
- **Response Status:** 200 OK

### 4.3 Delete Gear (Provider)
- **Endpoint:** `DELETE /api/provider/gear/5015c324-9b78-4fe7-bc6c-611la1bd93`
- **Authentication:** Required (Provider token)
- **Response Status:** 200 OK

### 4.4 Get Provider Orders
- **Endpoint:** `GET /api/provider/orders`
- **Authentication:** Required (Provider token)
- **Response Status:** 200 OK
- **Returns:** All rental orders for the provider's gear items

### 4.5 Update Order Status (Provider)
- **Endpoint:** `PATCH /api/provider/orders/48716ae1-aa65-466f-8b59-dfb7945ac8a7`
- **Authentication:** Required (Provider token)
- **Request Body:**
  ```json
  {
    "status": "CONFIRMED"
  }
  ```
- **Valid Status Values:**
  - CONFIRMED
  - PICKED_UP
  - RETURNED
  - CANCELLED
- **Response Status:** 200 OK

---

## 5. Admin Management Tests

### 5.1 Get All Users (Admin)
- **Endpoint:** `GET /api/admin/users`
- **Authentication:** Required (Admin token)
- **Response Status:** 200 OK
- **Returns:** All users in the system

### 5.2 Update User Status (Admin)
- **Endpoint:** `PATCH /api/admin/users/<user-id>`
- **Authentication:** Required (Admin token)
- **Request Body:**
  ```json
  {
    "status": "ACTIVE"
  }
  ```
- **Response Status:** 200 OK

### 5.3 Get All Gear (Admin)
- **Endpoint:** `GET /api/admin/gear`
- **Authentication:** Required (Admin token)
- **Response Status:** 200 OK

### 5.4 Get All Rentals (Admin)
- **Endpoint:** `GET /api/admin/rentals`
- **Authentication:** Required (Admin token)
- **Response Status:** 200 OK

### 5.5 Create Category (Admin)
- **Endpoint:** `POST /api/admin/categories`
- **Authentication:** Required (Admin token)
- **Request Body:**
  ```json
  {
    "name": "Snow Sports"
  }
  ```
- **Response Status:** 201 Created

---

## 6. Error Handling Tests

### 6.1 Invalid Category ID
- **Error Response:**
  ```json
  {
    "success": false,
    "message": "Invalid `prisma.gearItem.create()` invocation: Foreign key constraint violated on the constraint: `gear_items_categoryId_fkey`",
    "errorDetails": {
      "modelName": "GearItem",
      "constraint": "gear_items_categoryId_fkey"
    }
  }
  ```
- **Solution:** Use valid category IDs from `/api/categories`

### 6.2 Missing Authorization
- **Error Response:**
  ```json
  {
    "success": false,
    "message": "You do not have permission to perform this action",
    "errorDetails": null
  }
  ```
- **Solution:** Use correct role token (provider for provider routes, admin for admin routes)

### 6.3 Gear Not Found
- **Error Response:**
  ```json
  {
    "success": false,
    "message": "One or more gear items were not found",
    "errorDetails": null
  }
  ```
- **Solution:** Verify gear IDs exist before creating rental

---

## 7. Test Summary

| Module | Endpoints Tested | Status |
|--------|------------------|--------|
| Authentication | 3 | ✅ Passed |
| Public APIs | 3 | ✅ Passed |
| Customer Rentals | 4 | ✅ Passed |
| Provider Management | 5 | ✅ Passed |
| Admin Management | 5 | ✅ Passed |
| **Total** | **20** | ✅ **All Passed** |

---

## 8. Important Notes

1. **Admin Credentials:** Now configurable via environment variables
   - `ADMIN_EMAIL` (default: admin@gearup.com)
   - `ADMIN_PASSWORD` (default: Admin@12345)

2. **Category IDs:** Must be verified before creating gear items
   - Valid categories are seeded on first database run
   - Use `/api/categories` to get current list

3. **Tokens:** Expire after 7 days by default
   - Store and reuse for multiple requests
   - Format: `Authorization: Bearer <token>`

4. **Payment Integration:** SSLCommerz sandbox mode active
   - No real charges occur
   - Test payment flows work end-to-end

5. **Postman Collection:** Available in `postman/` folder
   - Can be imported for team collaboration
   - Public documentation: https://documenter.getpostman.com/ (link pending)

---

## 9. Testing Tools Used

- **Postman Desktop:** Full collection management and testing
- **Thunder Client:** VS Code extension for quick API testing
- **cURL:** Command-line verification of live endpoints

---

**Last Updated:** July 31, 2026  
**Tested By:** Tahsan  
**Status:** Production Ready ✅
