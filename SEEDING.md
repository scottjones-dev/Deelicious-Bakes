# 🧁 Salisbury Bakery Database Seeding Guide

Welcome to the **deelicious** database seeding guide! This document explains how to populate your local or remote database with premium categories, menu items, realistic customers, and mock order histories to help you develop and test both the administrator panel and storefront.

---

## 🚀 How to Run the Seed

You can reset and reseed your database at any time using your package manager.

```bash
# Clean, sync schema structures, and seed all mock data
npm run db:push && npm run db:seed

# Or if using pnpm
pnpm db:push && pnpm db:seed

# Or if using Bun directly
bun run src/db/seed.ts
```

---

## 🔑 Test Customer Sign-In Credentials

To test the storefront experience, order history views, and account dashboards from a customer's perspective, you can sign in to the site using any of the following pre-verified accounts:

* **Global Password:** `password123`

| Customer Name | Email Address | Mock Order Count | Default Salisbury Address |
| :--- | :--- | :---: | :--- |
| **Eleanor Vance** | `eleanor@example.com` | **2 Orders** | 42 Salisbury High Street, SP1 2NL |
| **Luke Sanders** | `luke@example.com` | **1 Order** | 12 Salisbury High Street, SP1 2NL |
| **Sophia Reed** | `sophia@example.com` | **1 Order** | 77 Salisbury High Street, SP1 2NL |
| **Oliver Grey** | `oliver@example.com` | **1 Order** | 3 Salisbury High Street, SP1 2NL |
| **Emma Watson** | `emma@example.com` | **1 Order** | Guest profile (No default address) |

---

## 🍰 Seeded Categories & Menu Items

The database is populated with gourmet confectionery categories and priced bakes typical of a premium local bakery:

### 1. Cupcakes (`cat_cupcakes`)
* **Vanilla Bean Classic Cupcakes**
  * *Box of 6:* £15.00 (`cup-van-06`)
  * *Box of 12:* £28.00 (`cup-van-12`)
* **Double Chocolate Fudge Cupcakes**
  * *Box of 6:* £18.00 (`cup-choc-06`)
  * *Box of 12:* £32.00 (`cup-choc-12`)
* **Salted Caramel Pretzel Cupcakes** (Thurs-Sun availability)
  * *Box of 6:* £18.00 (`cup-car-06`)
  * *Box of 12:* £34.00

### 2. Celebration Cakes (`cat_celebration`)
* **Salisbury Strawberry Victoria Sponge** (Feeds up to 14)
  * *6" Sponge:* £35.00 (`cake-vic-06`)
  * *8" Sponge:* £50.00 (`cake-vic-08`)
* **Bespoke Celebration Cake** (Deposit)
  * *Standard Deposit:* £120.00 (`cake-wedding-dep`)

### 3. Brownies & Traybakes (`cat_brownies`)
* **Triple Chocolate Fudge Brownies**
  * *Box of 6:* £12.00 (`tb-bro-06`)
  * *Box of 12:* £22.00 (`tb-bro-12`)
* **Lotus Biscoff Rocky Road**
  * *Box of 6:* £14.00 (`tb-bis-06`)

### 4. French Macarons (`cat_macarons`)
* **Gourmet Macarons Assortment**
  * *Box of 12:* £20.00 (`mac-ass-12`)
  * *Box of 24:* £38.00 (`mac-ass-24`)

---

## 📦 Seeded Orders & Receipts

The database seeds **10 realistic mock orders** capturing both guest checkouts and registered customers. This lets you play with order lists, filters, status pills, and detail receipt cards:

* **Status Mix:** Orders are distributed across various stages of fulfillment:
  * `pending` — unpaid draft order
  * `paid` — paid order waiting for bakes
  * `processing` — baking in progress
  * `ready_for_collection` — cooling and boxed on the Salisbury pick-up rack
  * `completed` — hand-delivered or picked up
  * `refunded` — cancelled or voided order
* **Confectionery Notes:** Orders include mock customizations, such as:
  * *Piping request: "Happy 30th Eleanor!"*
  * *Allergy Alert: Strictly nut-free, double check macarons.*
* **Fulfillment Mix:** Simulates both local Salisbury Deliveries and in-bakery collections.

---

## 🛡️ Administrative Protection & Safety

To protect your live environment during iterations, the seed script incorporates several **operations guards**:

1. **Sparing Administrative Users:**
   When clearing old mock users to avoid key collisions, the script specifically **spares any user with the `admin` role** or profile. This guarantees your administrative credentials are never overwritten or deleted, preventing lockout.
2. **Cascade Safety:**
   Cleans old data recursively using precise database table ordering (`orderItems` -> `orders` -> `addresses` -> `stocks` -> `variants` -> `products` -> `categories` -> `customers` -> `user`), ensuring Neon or local Postgres engines never trigger a foreign-key error.
3. **Trigger.dev Compatibility:**
   All mock Stripe Customer IDs are prefixed with `cus_mock_` to prevent any conflict with real-world Stripe webhook sync pipelines.
