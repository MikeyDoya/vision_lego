import { pgTable, text, integer, numeric, boolean, timestamp, date, primaryKey, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum('order_status', [
	'pending',      // recién creada, esperando pago
	'paid',         // pago confirmado
	'processing',   // en preparación
	'shipped',      // enviada
	'delivered',    // entregada
	'cancelled',    // cancelada
	'refunded',     // reembolsada
])

export const productCategoryEnum = pgEnum('product_category', [
	'sunglasses',   // gafas de sol
	'optical',      // monturas ópticas
])

export const expenseCategoryEnum = pgEnum('expense_category', [
	'rent',         // arriendo
	'payroll',      // nómina
	'supplier',     // proveedor
	'utilities',    // servicios
	'other',        // otro
])

// ─── Users (Better Auth compatible) ──────────────────────────────────────────

export const users = pgTable('users', {
	id:            text('id').primaryKey(),
	name:          text('name').notNull(),
	email:         text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image:         text('image'),
	role:          text('role').notNull().default('customer'), // 'customer' | 'owner' | 'staff'
	createdAt:     timestamp('created_at').notNull().defaultNow(),
	updatedAt:     timestamp('updated_at').notNull().defaultNow(),
})

export const sessions = pgTable('sessions', {
	id:             text('id').primaryKey(),
	userId:         text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	token:          text('token').notNull().unique(),
	expiresAt:      timestamp('expires_at').notNull(),
	ipAddress:      text('ip_address'),
	userAgent:      text('user_agent'),
	createdAt:      timestamp('created_at').notNull().defaultNow(),
	updatedAt:      timestamp('updated_at').notNull().defaultNow(),
})

export const accounts = pgTable('accounts', {
	id:                   text('id').primaryKey(),
	userId:               text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	accountId:            text('account_id').notNull(),
	providerId:           text('provider_id').notNull(),
	accessToken:          text('access_token'),
	refreshToken:         text('refresh_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt:timestamp('refresh_token_expires_at'),
	scope:                text('scope'),
	password:             text('password'),
	createdAt:            timestamp('created_at').notNull().defaultNow(),
	updatedAt:            timestamp('updated_at').notNull().defaultNow(),
})

export const verifications = pgTable('verifications', {
	id:         text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value:      text('value').notNull(),
	expiresAt:  timestamp('expires_at').notNull(),
	createdAt:  timestamp('created_at').notNull().defaultNow(),
	updatedAt:  timestamp('updated_at').notNull().defaultNow(),
})

// ─── Catálogo ─────────────────────────────────────────────────────────────────

export const brands = pgTable('brands', {
	id:        text('id').primaryKey(),
	name:      text('name').notNull().unique(),
	slug:      text('slug').notNull().unique(),
	logoUrl:   text('logo_url'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const products = pgTable('products', {
	id:          text('id').primaryKey(),
	name:        text('name').notNull(),
	slug:        text('slug').notNull().unique(),
	description: text('description'),
	category:    productCategoryEnum('category').notNull(),
	brandId:     text('brand_id').references(() => brands.id, { onDelete: 'set null' }),
	gender:      text('gender'),               // 'hombre' | 'mujer' | 'unisex' | 'niño'
	basePrice:   numeric('base_price', { precision: 10, scale: 2 }).notNull(),
	isActive:    boolean('is_active').notNull().default(true),
	isFeatured:  boolean('is_featured').notNull().default(false),
	createdAt:   timestamp('created_at').notNull().defaultNow(),
	updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

// Cada variante es una combinación única de color + talla + material
export const productVariants = pgTable('product_variants', {
	id:        text('id').primaryKey(),
	productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
	color:     text('color'),                  // ej: "Negro", "Carey", "Transparente"
	size:      text('size'),                   // ej: "S", "M", "L" o medidas como "52-18-140"
	material:  text('material'),               // ej: "Acetato", "Metal", "TR90"
	sku:       text('sku').unique(),
	price:     numeric('price', { precision: 10, scale: 2 }), // sobreescribe basePrice si aplica
	stock:     integer('stock').notNull().default(0),
	isActive:  boolean('is_active').notNull().default(true),
})

export const productImages = pgTable('product_images', {
	id:        text('id').primaryKey(),
	productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
	variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
	url:       text('url').notNull(),
	altText:   text('alt_text'),
	position:  integer('position').notNull().default(0), // orden de aparición
	isPrimary: boolean('is_primary').notNull().default(false),
})

// ─── Carrito ──────────────────────────────────────────────────────────────────

export const cartItems = pgTable('cart_items', {
	id:        text('id').primaryKey(),
	userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	variantId: text('variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
	quantity:  integer('quantity').notNull().default(1),
	addedAt:   timestamp('added_at').notNull().defaultNow(),
})

// ─── Lista de deseos ──────────────────────────────────────────────────────────

export const wishlistItems = pgTable('wishlist_items', {
	userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
	addedAt:   timestamp('added_at').notNull().defaultNow(),
}, (t) => [
	primaryKey({ columns: [t.userId, t.productId] }),
])

// ─── Métodos de envío ─────────────────────────────────────────────────────────

export const shippingMethods = pgTable('shipping_methods', {
	id:          text('id').primaryKey(),
	name:        text('name').notNull(),
	description: text('description'),
	cost:        numeric('cost', { precision: 10, scale: 2 }).notNull(),
	isActive:    boolean('is_active').notNull().default(true),
	createdAt:   timestamp('created_at').notNull().defaultNow(),
})

// ─── Pedidos ──────────────────────────────────────────────────────────────────

export const orders = pgTable('orders', {
	id:              text('id').primaryKey(),
	userId:          text('user_id').references(() => users.id, { onDelete: 'set null' }),

	// Datos de contacto al momento del pedido
	customerName:    text('customer_name').notNull(),
	customerEmail:   text('customer_email').notNull(),
	customerPhone:   text('customer_phone'),

	// Dirección de envío
	shippingAddress:  text('shipping_address').notNull(),
	shippingCity:     text('shipping_city').notNull(),
	shippingDept:     text('shipping_dept').notNull(),
	shippingZip:      text('shipping_zip'),
	shippingMethodId: text('shipping_method_id').references(() => shippingMethods.id, { onDelete: 'set null' }),
	shippingCost:     numeric('shipping_cost', { precision: 10, scale: 2 }).notNull().default('0'),

	status:          orderStatusEnum('status').notNull().default('pending'),
	total:           numeric('total', { precision: 10, scale: 2 }).notNull(),

	// Wompi (se llena al integrar pagos)
	wompiPaymentId:  text('wompi_payment_id'),
	wompiStatus:     text('wompi_status'),

	notes:           text('notes'),                    // notas del cliente
	createdAt:       timestamp('created_at').notNull().defaultNow(),
	updatedAt:       timestamp('updated_at').notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
	id:           text('id').primaryKey(),
	orderId:      text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
	variantId:    text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),

	// Snapshot del producto al momento de comprar
	productName:  text('product_name').notNull(),
	variantLabel: text('variant_label'),               // ej: "Negro / M / Acetato"
	unitPrice:    numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
	quantity:     integer('quantity').notNull(),
	subtotal:     numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
})

// ─── Negocio ──────────────────────────────────────────────────────────────────

export const expenses = pgTable('expenses', {
	id:          text('id').primaryKey(),
	description: text('description').notNull(),
	amount:      numeric('amount', { precision: 10, scale: 2 }).notNull(),
	category:    expenseCategoryEnum('category').notNull(),
	date:        date('date').notNull(),
	notes:       text('notes'),
	createdAt:   timestamp('created_at').notNull().defaultNow(),
})

export const receivables = pgTable('receivables', {
	id:           text('id').primaryKey(),
	customerName: text('customer_name').notNull(),
	customerPhone:text('customer_phone'),
	description:  text('description').notNull(),
	amount:       numeric('amount', { precision: 10, scale: 2 }).notNull(),
	paidAmount:   numeric('paid_amount', { precision: 10, scale: 2 }).notNull().default('0'),
	dueDate:      date('due_date'),
	isPaid:       boolean('is_paid').notNull().default(false),
	createdAt:    timestamp('created_at').notNull().defaultNow(),
	updatedAt:    timestamp('updated_at').notNull().defaultNow(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const productsRelations = relations(products, ({ one, many }) => ({
	brand:    one(brands, { fields: [products.brandId], references: [brands.id] }),
	variants: many(productVariants),
	images:   many(productImages),
}))

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
	product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
	product: one(products, { fields: [productImages.productId], references: [products.id] }),
	variant: one(productVariants, { fields: [productImages.variantId], references: [productVariants.id] }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
	user:           one(users, { fields: [orders.userId], references: [users.id] }),
	shippingMethod: one(shippingMethods, { fields: [orders.shippingMethodId], references: [shippingMethods.id] }),
	items:          many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order:   one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
	variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}))

// ─── Tipos de TypeScript ──────────────────────────────────────────────────────

export type User            = typeof users.$inferSelect
export type Session         = typeof sessions.$inferSelect
export type Brand           = typeof brands.$inferSelect
export type Product         = typeof products.$inferSelect
export type ProductVariant  = typeof productVariants.$inferSelect
export type ProductImage    = typeof productImages.$inferSelect
export type CartItem        = typeof cartItems.$inferSelect
export type WishlistItem    = typeof wishlistItems.$inferSelect
export type Order           = typeof orders.$inferSelect
export type OrderItem       = typeof orderItems.$inferSelect
export type ShippingMethod  = typeof shippingMethods.$inferSelect
export type Expense         = typeof expenses.$inferSelect
export type Receivable      = typeof receivables.$inferSelect

export type NewProduct        = typeof products.$inferInsert
export type NewProductVariant = typeof productVariants.$inferInsert
export type NewOrder          = typeof orders.$inferInsert
export type NewExpense        = typeof expenses.$inferInsert
export type NewReceivable     = typeof receivables.$inferInsert
