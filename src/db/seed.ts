import "./env-loader";
import { eq, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  addresses,
  auditLogs,
  categories,
  customers,
  ingredients,
  orderItems,
  orders,
  products,
  productVariants,
  stocks,
  user as userTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  type BundleCompositionSchema,
  toOrderItemCustomizations,
} from "@/lib/validations/cart";
import { generateId } from "@/utils/id";

async function main() {
  console.log("🥞 Starting Salisbury Bakery Seed Process...");

  try {
    // =========================================================================
    // 1. CLEAN EXISTING DATA (Safe Ordering to Avoid Foreign Key Violations)
    // =========================================================================
    console.log("🧹 Cleaning old mock data (sparing admin users)...");

    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(addresses);
    await db.delete(stocks);
    await db.delete(productVariants);
    await db.delete(products);
    await db.delete(auditLogs);
    await db.delete(ingredients);
    await db.delete(categories);
    await db.delete(customers);

    // Spares any admin users so the developer/wife is never locked out of the panel!
    await db.delete(userTable).where(ne(userTable.role, "admin"));

    console.log("✅ Database reset complete.");

    // =========================================================================
    // 2. SEED CATEGORIES
    // =========================================================================
    console.log("🏷️  Seeding gourmet categories...");

    const seededCategories = await db
      .insert(categories)
      .values([
        {
          id: "cat_cupcakes",
          name: "Cupcakes",
          slug: "cupcakes",
          description:
            "Freshly-baked delicate sponges topped with fluffy gourmet buttercreams.",
          image:
            "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=400",
        },
        {
          id: "cat_celebration",
          name: "Celebration Cakes",
          slug: "celebration-cakes",
          description:
            "Stunning bespoke multi-tiered sponge cakes crafted for Salisbury wedding consults, birthdays, and parties.",
          image:
            "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&q=80&w=400",
        },
        {
          id: "cat_brownies",
          name: "Brownies & Traybakes",
          slug: "brownies-traybakes",
          description:
            "Fudgy triple-chocolate brownies, chewy rocky roads, and gooey sweet bars.",
          image:
            "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400",
        },
        {
          id: "cat_macarons",
          name: "French Macarons",
          slug: "macarons",
          description:
            "Elegant, gluten-free almond meringue cookies filled with silky ganaches and curds.",
          image:
            "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=400",
        },
      ])
      .returning();

    console.log(`✅ Seeded ${seededCategories.length} categories.`);

    // =========================================================================
    // 2.5 SEED INGREDIENTS
    // =========================================================================
    console.log("🧾 Seeding ingredient costing catalog...");

    const seededIngredients = await db
      .insert(ingredients)
      .values([
        {
          id: "ing_plain_flour",
          name: "Plain Flour",
          slug: "plain-flour",
          baseUnit: "g",
          purchaseUnit: "kg",
          purchaseQuantity: "16.000",
          purchasePrice: "18.40",
          costPerBaseUnit: "0.00115000",
          supplier: "Booker Wholesale",
        },
        {
          id: "ing_caster_sugar",
          name: "Caster Sugar",
          slug: "caster-sugar",
          baseUnit: "g",
          purchaseUnit: "kg",
          purchaseQuantity: "25.000",
          purchasePrice: "22.50",
          costPerBaseUnit: "0.00090000",
          supplier: "Makro",
        },
        {
          id: "ing_unsalted_butter",
          name: "Unsalted Butter",
          slug: "unsalted-butter",
          baseUnit: "g",
          purchaseUnit: "kg",
          purchaseQuantity: "5.000",
          purchasePrice: "39.95",
          costPerBaseUnit: "0.00799000",
          supplier: "Brakes",
        },
        {
          id: "ing_double_cream",
          name: "Double Cream",
          slug: "double-cream",
          baseUnit: "ml",
          purchaseUnit: "l",
          purchaseQuantity: "12.000",
          purchasePrice: "34.20",
          costPerBaseUnit: "0.00285000",
          supplier: "Booker Wholesale",
        },
        {
          id: "ing_dark_chocolate",
          name: "Dark Chocolate 70%",
          slug: "dark-chocolate-70",
          baseUnit: "g",
          purchaseUnit: "kg",
          purchaseQuantity: "10.000",
          purchasePrice: "78.00",
          costPerBaseUnit: "0.00780000",
          supplier: "Callebaut UK",
        },
        {
          id: "ing_milk_chocolate",
          name: "Milk Chocolate",
          slug: "milk-chocolate",
          baseUnit: "g",
          purchaseUnit: "kg",
          purchaseQuantity: "10.000",
          purchasePrice: "71.00",
          costPerBaseUnit: "0.00710000",
          supplier: "Callebaut UK",
        },
        {
          id: "ing_eggs",
          name: "Eggs",
          slug: "eggs",
          baseUnit: "g",
          purchaseUnit: "kg",
          purchaseQuantity: "12.000",
          purchasePrice: "27.60",
          costPerBaseUnit: "0.00230000",
          supplier: "Salisbury Farm Produce",
        },
        {
          id: "ing_vanilla_extract",
          name: "Vanilla Extract",
          slug: "vanilla-extract",
          baseUnit: "ml",
          purchaseUnit: "l",
          purchaseQuantity: "1.000",
          purchasePrice: "22.00",
          costPerBaseUnit: "0.02200000",
          supplier: "Sous Chef",
        },
        {
          id: "ing_biscoff_spread",
          name: "Biscoff Spread",
          slug: "biscoff-spread",
          baseUnit: "g",
          purchaseUnit: "kg",
          purchaseQuantity: "6.000",
          purchasePrice: "31.20",
          costPerBaseUnit: "0.00520000",
          supplier: "Lotus Biscoff Trade",
        },
        {
          id: "ing_almond_flour",
          name: "Almond Flour",
          slug: "almond-flour",
          baseUnit: "g",
          purchaseUnit: "kg",
          purchaseQuantity: "5.000",
          purchasePrice: "44.50",
          costPerBaseUnit: "0.00890000",
          supplier: "Wholefood Wholesale",
        },
      ])
      .returning();

    console.log(`✅ Seeded ${seededIngredients.length} ingredients.`);

    // =========================================================================
    // 3. SEED PRODUCTS & VARIANTS & STOCKS
    // =========================================================================
    console.log("🍰 Seeding gourmet products and price variants...");
    const standardDeliveryOptions = [
      "Weekdays - All Day",
      "Orders under £50 — £5.95",
      "Orders over £50 — FREE",
      "",
      "Weekdays - Mornings",
      "All orders — £8.95",
      "",
      "Weekends - All Day",
      "Orders under £50 — £6.99",
      "Orders over £50 — FREE",
      "",
      "Weekends - Mornings",
      "All orders — £25",
      "",
      "Every Day - Multiple Time Slots",
      "Orders within local radius. Delivered by courier on guaranteed day of your choice.",
      "£10.99 - £17.99",
    ].join("\n");

    // Helper to generate a product + its variants and stocks
    const createProductWithVariants = async (
      productData: typeof products.$inferInsert,
      variantsData: Array<
        Omit<typeof productVariants.$inferInsert, "productId">
      >,
    ) => {
      const [prod] = await db.insert(products).values(productData).returning();

      for (const vData of variantsData) {
        const [variant] = await db
          .insert(productVariants)
          .values({
            ...vData,
            productId: prod.id,
          })
          .returning();

        // Feed stocks count
        await db.insert(stocks).values({
          id: `stk_${variant.id.substring(4)}`,
          productVariantId: variant.id,
          quantity: Math.floor(Math.random() * 80) + 20, // 20 - 99 stock
          lowStockThreshold: 10,
        });
      }
      return prod;
    };

    // Product A: Vanilla Bean Classic
    await createProductWithVariants(
      {
        id: "prod_vanilla_classic",
        name: "Vanilla Bean Classic Cupcakes",
        slug: "vanilla-bean-classic",
        description:
          "Fluffy Madagascar vanilla sponge topped with our signature whipped vanilla buttercream, pearls, and edible glitter.",
        sku: "PROD-VANILLA-CLASSIC",
        dietaryInfo:
          "Contains: Wheat (Gluten), Milk, Eggs, Soya. Made in a kitchen that handles Nuts.",
        ingredientsInfo:
          "Vanilla sponge (wheat flour, eggs, sugar, butter, milk), vanilla buttercream, edible pearls.",
        sizesAndServes: "Box of 6 serves 6-8.\nBox of 12 serves 12-16.",
        shelfLifeStorage:
          "Best enjoyed within 3 days. Store in a cool, dry place away from direct sunlight.",
        arrivalInfo:
          "Arrives in a protective bakery box with support inserts to keep decorations secure.",
        deliveryOptions: standardDeliveryOptions,
        categoryId: "cat_cupcakes",
        status: "active",
        leadTimeDays: 1,
        isCollectionOnly: false,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
      },
      [
        {
          id: "var_vanilla_6",
          name: "Box of 6",
          price: "15.00",
          sku: "cup-van-06",
          position: 0,
        },
        {
          id: "var_vanilla_12",
          name: "Box of 12",
          price: "28.00",
          sku: "cup-van-12",
          position: 1,
        },
      ],
    );

    // Product B: Double Chocolate Fudge
    await createProductWithVariants(
      {
        id: "prod_double_choc",
        name: "Double Chocolate Fudge Cupcakes",
        slug: "double-chocolate-fudge",
        description:
          "Rich Belgian chocolate sponge filled with molten fudge sauce, topped with silky dark chocolate buttercream and cocoa dust.",
        sku: "PROD-DOUBLE-CHOC",
        dietaryInfo:
          "Contains: Wheat (Gluten), Milk, Eggs, Soya. Made in a kitchen that handles Nuts.",
        ingredientsInfo:
          "Chocolate sponge (wheat flour, cocoa, eggs, sugar, butter), fudge filling, chocolate buttercream.",
        sizesAndServes: "Box of 6 serves 6-8.\nBox of 12 serves 12-16.",
        shelfLifeStorage:
          "Best enjoyed within 3 days. Store in a cool, dry place.",
        arrivalInfo:
          "Packed in a secure cupcake transit box to maintain shape and finish.",
        deliveryOptions: standardDeliveryOptions,
        categoryId: "cat_cupcakes",
        status: "active",
        leadTimeDays: 1,
        isCollectionOnly: false,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
      },
      [
        {
          id: "var_choc_6",
          name: "Box of 6",
          price: "18.00",
          sku: "cup-choc-06",
          position: 0,
        },
        {
          id: "var_choc_12",
          name: "Box of 12",
          price: "32.00",
          sku: "cup-choc-12",
          position: 1,
        },
      ],
    );

    // Product C: Salted Caramel Pretzel
    await createProductWithVariants(
      {
        id: "prod_caramel_pretzel",
        name: "Salted Caramel Pretzel Cupcakes",
        slug: "salted-caramel-pretzel",
        description:
          "Brown sugar sponge with a gooey salted caramel core, frosted with caramel buttercream and finished with a crunchy pretzel.",
        sku: "PROD-SALTED-CARAMEL-PRETZEL",
        dietaryInfo:
          "Contains: Wheat (Gluten), Milk, Eggs. May contain traces of Nuts and Soya.",
        ingredientsInfo:
          "Brown sugar sponge, salted caramel filling, caramel buttercream, pretzel topping.",
        sizesAndServes: "Box of 6 serves 6-8.\nBox of 12 serves 12-16.",
        shelfLifeStorage: "Best enjoyed within 2-3 days. Keep cool and dry.",
        arrivalInfo:
          "Delivered in reinforced packaging to protect caramel and pretzel decoration.",
        deliveryOptions: standardDeliveryOptions,
        categoryId: "cat_cupcakes",
        status: "active",
        leadTimeDays: 2,
        isCollectionOnly: false,
        availableDays: [4, 5, 6, 0], // Thursday - Sunday availability
      },
      [
        {
          id: "var_caramel_6",
          name: "Box of 6",
          price: "18.00",
          sku: "cup-car-06",
          position: 0,
        },
        {
          id: "var_caramel_12",
          name: "Box of 12",
          price: "34.00",
          position: 1,
        },
      ],
    );

    // Product D: Wedding/Consultation Bespoke Cake
    await db.insert(products).values({
      id: "prod_bespoke_wedding",
      name: "Bespoke Multi-Tier Celebration Cake",
      slug: "bespoke-wedding-cake",
      description:
        "A gorgeous, fully customized multi-tier cake. Price varies based on consultation, sizing, and design requirements.",
      sku: "PROD-BESPOKE-WEDDING",
      dietaryInfo:
        "Allergen profile depends on final design and flavours. Confirmed in writing after consultation.",
      ingredientsInfo:
        "Made-to-order with premium sponge, fillings, and buttercream selected during consultation.",
      sizesAndServes:
        "Tiering and servings are bespoke and confirmed during consultation.",
      shelfLifeStorage:
        "Storage instructions are provided per design and finish at collection.",
      arrivalInfo:
        "Collection only. Tiered components are boxed securely with handling guidance.",
      deliveryOptions:
        "Collection only from our Salisbury bakery by appointment.\nNo courier delivery available for this item.",
      categoryId: "cat_celebration",
      status: "active",
      leadTimeDays: 14, // 2 weeks lead time for celebration cakes!
      isCollectionOnly: true, // Salisbury local pick-up only
      availableDays: [5, 6], // Fridays and Saturdays only
    });

    // Variant for Bespoke Cake
    await db.insert(productVariants).values({
      id: "var_wedding_base",
      productId: "prod_bespoke_wedding",
      name: "Standard Double-Tier Consultation Deposit",
      price: "120.00",
      sku: "cake-wedding-dep",
      position: 0,
    });

    await db.insert(stocks).values({
      id: "stk_wedding_base",
      productVariantId: "var_wedding_base",
      quantity: 5, // limited wedding deposits
    });

    // Product E: Victoria Sponge
    await createProductWithVariants(
      {
        id: "prod_victoria_sponge",
        name: "Salisbury Strawberry Victoria Sponge",
        slug: "salisbury-victoria-sponge",
        description:
          "Traditional English Victoria sponge layered with locally-sourced Salisbury strawberries, raspberry preserve, and fresh vanilla bean cream.",
        sku: "PROD-VICTORIA-SPONGE",
        dietaryInfo:
          "Contains: Wheat (Gluten), Milk, Eggs. Made in a kitchen that handles Nuts.",
        ingredientsInfo:
          "Vanilla sponge, strawberry preserve, fresh cream, seasonal strawberries.",
        sizesAndServes: "6 inch serves 8.\n8 inch serves 14.",
        shelfLifeStorage:
          "Consume within 2 days due to fresh cream. Keep refrigerated and bring to room temperature before serving.",
        arrivalInfo:
          "Shipped chilled with insulated packaging to preserve freshness.",
        deliveryOptions: standardDeliveryOptions,
        categoryId: "cat_celebration",
        status: "active",
        leadTimeDays: 3,
        isCollectionOnly: false,
        availableDays: [2, 3, 4, 5, 6, 0],
      },
      [
        {
          id: "var_vic_6inch",
          name: '6" Sponge (Feeds 8)',
          price: "35.00",
          sku: "cake-vic-06",
          position: 0,
        },
        {
          id: "var_vic_8inch",
          name: '8" Sponge (Feeds 14)',
          price: "50.00",
          sku: "cake-vic-08",
          position: 1,
        },
      ],
    );

    // Product F: Triple Chocolate Brownies
    await createProductWithVariants(
      {
        id: "prod_brownies_box",
        name: "Triple Chocolate Fudge Brownies",
        slug: "triple-chocolate-brownies",
        description:
          "Decadent, rich Belgian chocolate brownies studded with white, milk, and dark chocolate chunks. Crisp top with a molten center.",
        sku: "PROD-TRIPLE-BROWNIES",
        dietaryInfo:
          "Contains: Wheat (Gluten), Milk, Eggs, Soya. May contain Nuts.",
        ingredientsInfo:
          "Belgian chocolate brownie batter, mixed chocolate chunks, cocoa.",
        sizesAndServes: "Box of 6 serves 6.\nBox of 12 serves 12.",
        shelfLifeStorage:
          "Best within 5 days. Store airtight at room temperature.",
        arrivalInfo:
          "Brownies are wrapped and boxed to keep texture fudgy during transit.",
        deliveryOptions: standardDeliveryOptions,
        categoryId: "cat_brownies",
        status: "active",
        leadTimeDays: 1,
        isCollectionOnly: false,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
      },
      [
        {
          id: "var_brownies_6",
          name: "Box of 6",
          price: "12.00",
          sku: "tb-bro-06",
          position: 0,
        },
        {
          id: "var_brownies_12",
          name: "Box of 12",
          price: "22.00",
          sku: "tb-bro-12",
          position: 1,
        },
      ],
    );

    // Product G: Lotus Biscoff Rocky Road
    await createProductWithVariants(
      {
        id: "prod_rocky_road",
        name: "Lotus Biscoff Rocky Road",
        slug: "biscoff-rocky-road",
        description:
          "Gooey marshmallows, crunchy Biscoff cookies, white chocolate swirls, and cookie butter spread.",
        sku: "PROD-BISCOFF-ROCKY-ROAD",
        dietaryInfo: "Contains: Wheat (Gluten), Milk, Soya. May contain Nuts.",
        ingredientsInfo:
          "Cookie crumb base, marshmallows, Biscoff spread, white chocolate drizzle.",
        sizesAndServes: "Box of 6 serves 6.",
        shelfLifeStorage:
          "Best within 5 days. Store in an airtight container in a cool place.",
        arrivalInfo:
          "Packed in individual liners within a rigid bakery box to avoid sticking.",
        deliveryOptions: standardDeliveryOptions,
        categoryId: "cat_brownies",
        status: "active",
        leadTimeDays: 1,
        isCollectionOnly: false,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
      },
      [
        {
          id: "var_rocky_6",
          name: "Box of 6",
          price: "14.00",
          sku: "tb-bis-06",
          position: 0,
        },
      ],
    );

    // Product H: French Macarons Box
    await createProductWithVariants(
      {
        id: "prod_macarons_assorted",
        name: "Gourmet Macarons Assortment",
        slug: "french-macarons-assorted",
        description:
          "Delicate Parisian macaron shells containing raspberry white chocolate, pistachio buttercream, and espresso caramel fillings.",
        sku: "PROD-MACARONS-ASSORTED",
        dietaryInfo:
          "Contains: Nuts (Almond, Pistachio), Milk, Eggs. Gluten-free recipe.",
        ingredientsInfo:
          "Almond meringue shells with assorted ganache and buttercream fillings.",
        sizesAndServes: "Box of 12 serves 6-12.\nBox of 24 serves 12-24.",
        shelfLifeStorage: "Refrigerate on arrival and consume within 4 days.",
        arrivalInfo:
          "Packed in compartmented trays to protect shells and filling structure.",
        deliveryOptions: standardDeliveryOptions,
        categoryId: "cat_macarons",
        status: "active",
        leadTimeDays: 2,
        isCollectionOnly: false,
        availableDays: [3, 4, 5, 6],
      },
      [
        {
          id: "var_mac_12",
          name: "Box of 12",
          price: "20.00",
          sku: "mac-ass-12",
          position: 0,
        },
        {
          id: "var_mac_24",
          name: "Box of 24",
          price: "38.00",
          sku: "mac-ass-24",
          position: 1,
        },
      ],
    );

    console.log("🏷️ Catalog items and inventory successfully synchronized!");

    // =========================================================================
    // CREATE CUSTOMERS & BETTER AUTH USERS
    // =========================================================================
    const mockCustomers = [
      {
        id: "cust_eleanor_vance",
        name: "Eleanor Vance",
        email: "eleanor@example.com",
        phone: "+44 7700 900077",
        marketing: true,
      },
      {
        id: "cust_luke_sanders",
        name: "Luke Sanders",
        email: "luke@example.com",
        phone: "+44 7700 900142",
        marketing: false,
      },
      {
        id: "cust_sophia_reed",
        name: "Sophia Reed",
        email: "sophia@example.com",
        phone: "+44 7700 900223",
        marketing: true,
      },
      {
        id: "cust_oliver_grey",
        name: "Oliver Grey",
        email: "oliver@example.com",
        phone: "+44 7700 900311",
        marketing: true,
      },
      {
        id: "cust_emma_watson",
        name: "Emma Watson",
        email: "emma@example.com",
        phone: null,
        marketing: false,
      },
    ];

    for (const c of mockCustomers) {
      // 1. Create a Better Auth User using Better Auth API
      const result = await auth.api.createUser({
        body: {
          email: c.email,
          password: "password123", // Set a simple predictable password for testing
          name: c.name,
          role: "user",
          data: {
            marketingConsent: c.marketing,
          },
        },
      });

      if (!result || !result.user) {
        throw new Error(`Failed to create user ${c.email} in Better Auth`);
      }

      const createdUser = result.user;

      // Better Auth creates the user. Now let's auto-verify them in the db
      await db
        .update(userTable)
        .set({
          emailVerified: true,
          stripeCustomerId: `cus_mock_${createdUser.id}`,
        })
        .where(eq(userTable.id, createdUser.id));

      // 2. Create the CRM customer profile linked to the User
      await db.insert(customers).values({
        id: c.id,
        userId: createdUser.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        marketingConsent: c.marketing,
        stripeCustomerId: `cus_mock_${createdUser.id}`,
      });

      // 3. Create default home addresses for some customers
      if (c.phone) {
        await db.insert(addresses).values({
          id: `adr_${c.id.substring(5)}`,
          customerId: c.id,
          type: "delivery",
          label: "Home",
          line1: `${Math.floor(Math.random() * 80) + 1} Salisbury High Street`,
          line2: "City Centre",
          city: "Salisbury",
          postalCode: "SP1 2NL",
          country: "GB",
          phone: c.phone,
          isDefault: true,
        });
      }
    }

    console.log(
      `👤 Seeded ${mockCustomers.length} Better Auth users & Customer CRM profiles.`,
    );

    // =========================================================================
    // SEED FAKE ORDERS
    // =========================================================================
    console.log("📦 Seeding realistic mock orders...");

    interface SeedOrderItem {
      productId: string;
      productVariantId?: string | null;
      variantId?: string | null;
      productName: string;
      variantName?: string | null;
      sku?: string | null;
      unitPrice: string;
      quantity: number;
      lineTotal: string;
      customizations?: Record<string, unknown> | null;
      bundleComposition?: BundleCompositionSchema | null;
    }

    interface SeedOrder {
      id: string;
      customerId: string;
      name: string;
      email: string;
      phone: string | null;
      status:
        | "pending"
        | "paid"
        | "processing"
        | "ready_for_collection"
        | "completed"
        | "cancelled"
        | "refunded";
      fulfillmentMethod: "collection" | "delivery";
      note: string | null;
      fulfillmentDate: Date;
      timeSlot: string;
      subtotal: string;
      total: string;
      items: SeedOrderItem[];
    }

    const mockOrders: SeedOrder[] = [
      {
        id: "ord_000000000001",
        customerId: "cust_eleanor_vance",
        name: "Eleanor Vance",
        email: "eleanor@example.com",
        phone: "+44 7700 900077",
        status: "completed",
        fulfillmentMethod: "collection",
        note: "Piping request: 'Happy 30th Eleanor!'",
        fulfillmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        timeSlot: "Morning (09:00 - 12:00)",
        subtotal: "35.00",
        total: "35.00",
        items: [
          {
            productId: "prod_victoria_sponge",
            variantId: "var_vic_6inch",
            productName: "Salisbury Strawberry Victoria Sponge",
            variantName: '6" Sponge (Feeds 8)',
            sku: "cake-vic-06",
            unitPrice: "35.00",
            quantity: 1,
            lineTotal: "35.00",
          },
        ],
      },
      {
        id: "ord_000000000002",
        customerId: "cust_luke_sanders",
        name: "Luke Sanders",
        email: "luke@example.com",
        phone: "+44 7700 900142",
        status: "paid",
        fulfillmentMethod: "delivery",
        note: "Delivery instruct: Please drop off at Salisbury High Street cafe.",
        fulfillmentDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // in 2 days
        timeSlot: "Afternoon (12:00 - 15:00)",
        subtotal: "42.00",
        total: "42.00",
        items: [
          {
            productId: "prod_vanilla_classic",
            variantId: "var_vanilla_12",
            productName: "Vanilla Bean Classic Cupcakes",
            variantName: "Box of 12",
            sku: "cup-van-12",
            unitPrice: "28.00",
            quantity: 1,
            lineTotal: "28.00",
          },
          {
            productId: "prod_rocky_road",
            variantId: "var_rocky_6",
            productName: "Lotus Biscoff Rocky Road",
            variantName: "Box of 6",
            sku: "tb-bis-06",
            unitPrice: "14.00",
            quantity: 1,
            lineTotal: "14.00",
          },
        ],
      },
      {
        id: "ord_000000000003",
        customerId: "cust_sophia_reed",
        name: "Sophia Reed",
        email: "sophia@example.com",
        phone: "+44 7700 900223",
        status: "processing",
        fulfillmentMethod: "collection",
        note: "Allergy Alert: Strictly nut-free, double check macarons (No Macarons ordered, but general kitchen safety requested).",
        fulfillmentDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // Tomorrow
        timeSlot: "Late Pick-up (15:00 - 17:00)",
        subtotal: "30.00",
        total: "30.00",
        items: [
          {
            productId: "prod_double_choc",
            variantId: "var_choc_6",
            productName: "Double Chocolate Fudge Cupcakes",
            variantName: "Box of 6",
            sku: "cup-choc-06",
            unitPrice: "18.00",
            quantity: 1,
            lineTotal: "18.00",
          },
          {
            productId: "prod_brownies_box",
            variantId: "var_brownies_6",
            productName: "Triple Chocolate Fudge Brownies",
            variantName: "Box of 6",
            sku: "tb-bro-06",
            unitPrice: "12.00",
            quantity: 1,
            lineTotal: "12.00",
          },
        ],
      },
      {
        id: "ord_000000000004",
        customerId: "cust_oliver_grey",
        name: "Oliver Grey",
        email: "oliver@example.com",
        phone: "+44 7700 900311",
        status: "pending",
        fulfillmentMethod: "collection",
        note: "Wedding Deposit for Consultation.",
        fulfillmentDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // in 10 days
        timeSlot: "Morning (09:00 - 12:00)",
        subtotal: "120.00",
        total: "120.00",
        items: [
          {
            productId: "prod_caramel_pretzel", // placeholder link
            productVariantId: "var_vanilla_12", // placeholder variant
            productName: "Bespoke Wedding Cake Deposit",
            variantName: "Deposit Booking",
            sku: "wedding-deposit",
            unitPrice: "120.00",
            quantity: 1,
            lineTotal: "120.00",
          },
        ],
      },
      {
        id: "ord_000000000005",
        customerId: "cust_emma_watson",
        name: "Emma Watson",
        email: "emma@example.com",
        phone: null,
        status: "refunded",
        fulfillmentMethod: "collection",
        note: "Cancelled order refund request processed.",
        fulfillmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // 20 days ago
        timeSlot: "Morning (09:00 - 12:00)",
        subtotal: "20.00",
        total: "20.00",
        items: [
          {
            productId: "prod_macarons_assorted",
            productVariantId: "var_mac_12",
            productName: "Gourmet Macarons Assortment",
            variantName: "Box of 12",
            sku: "mac-ass-12",
            unitPrice: "20.00",
            quantity: 1,
            lineTotal: "20.00",
          },
        ],
      },
      {
        id: "ord_000000000006",
        customerId: "cust_eleanor_vance",
        name: "Eleanor Vance",
        email: "eleanor@example.com",
        phone: "+44 7700 900077",
        status: "ready_for_collection",
        fulfillmentMethod: "collection",
        note: "Early collection requested.",
        fulfillmentDate: new Date(), // Today!
        timeSlot: "Morning (09:00 - 12:00)",
        subtotal: "30.00",
        total: "30.00",
        items: [
          {
            productId: "prod_vanilla_classic",
            productVariantId: "var_vanilla_6",
            productName: "Vanilla Bean Classic Cupcakes",
            variantName: "Box of 6",
            sku: "cup-van-06",
            unitPrice: "15.00",
            quantity: 2,
            lineTotal: "30.00",
          },
        ],
      },
    ];

    // Additional random guest checkouts to make up 10 total orders
    const firstNames = [
      "James",
      "Sophia",
      "Chloe",
      "William",
      "Jessica",
      "Jack",
      "Amelia",
      "Charlotte",
    ];
    const lastNames = [
      "Smith",
      "Taylor",
      "Miller",
      "Brown",
      "Jones",
      "Wilson",
      "Davies",
      "Evans",
    ];

    for (let i = 7; i <= 10; i++) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${fName} ${lName}`;
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
      const id = `ord_guest_00000${i}`;
      const customerId = `cust_guest_${i}`;

      // Insert guest customer
      await db.insert(customers).values({
        id: customerId,
        userId: null, // guest checkout
        name,
        email,
        phone: "+44 7700 900450",
        marketingConsent: false,
      });

      mockOrders.push({
        id,
        customerId,
        name,
        email,
        phone: "+44 7700 900450",
        status: "completed",
        fulfillmentMethod: "delivery",
        note: "Regular guest delivery",
        fulfillmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * i),
        timeSlot: "Afternoon (12:00 - 15:00)",
        subtotal: "32.00",
        total: "32.00",
        items: [
          {
            productId: "prod_double_choc",
            variantId: "var_choc_6",
            productName: "Double Chocolate Fudge Cupcakes",
            variantName: "Box of 6",
            sku: `cup-choc-06-guest-${i}`,
            unitPrice: "18.00",
            quantity: 1,
            lineTotal: "18.00",
          },
          {
            productId: "prod_rocky_road",
            variantId: "var_rocky_6",
            productName: "Lotus Biscoff Rocky Road",
            variantName: "Box of 6",
            sku: `bar-rocky-06-${i}`,
            unitPrice: "14.00",
            quantity: 1,
            lineTotal: "14.00",
          },
        ],
      });
    }

    // Insert orders and orderItems
    for (const ord of mockOrders) {
      await db.insert(orders).values({
        id: ord.id,
        customerId: ord.customerId,
        status: ord.status,
        fulfillmentMethod: ord.fulfillmentMethod,
        name: ord.name,
        email: ord.email,
        phone: ord.phone,
        note: ord.note,
        fulfillmentDate: ord.fulfillmentDate,
        fulfillmentTimeSlot: ord.timeSlot,
        subtotal: ord.subtotal,
        total: ord.total,
        currency: "gbp",
      });

      // Insert line items
      for (const item of ord.items) {
        await db.insert(orderItems).values({
          id: `item_${generateId()}`,
          orderId: ord.id,
          productId: item.productId,
          productVariantId: item.productVariantId || item.variantId || null,
          productName: item.productName,
          variantName: item.variantName || null,
          sku: item.sku || null,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
          customizations: toOrderItemCustomizations({
            customizations: item.customizations ?? null,
            bundleComposition: item.bundleComposition ?? null,
          }),
        });
      }
    }

    console.log(
      `📦 Seeded ${mockOrders.length} realistic customer order receipts & line bakes.`,
    );
    console.log(
      "\n✨ Salisbury Bakery database seeding complete! Happy developing! 🧁",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal error during seed:", error);
    process.exit(1);
  }
}

main();
