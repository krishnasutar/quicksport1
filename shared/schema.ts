import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "owner", "admin"]);
export const sportTypeEnum = pgEnum("sport_type", ["basketball", "football", "tennis", "volleyball", "badminton", "swimming", "cricket", "table_tennis"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "cancelled", "completed"]);
export const facilityStatusEnum = pgEnum("facility_status", ["pending", "approved", "rejected", "suspended"]);

// Web portal users table (customers only)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Original password for visibility
  password_hash: text("password_hash").notNull(), // Hashed password for authentication
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  profilePicture: text("profile_picture"),
  isStudentVerified: boolean("is_student_verified").default(false),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0"),
  rewardPoints: integer("reward_points").default(0),
  referralCode: text("referral_code").unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Define CRM role enum first
export const crmRoleEnum = pgEnum("crm_role", ["admin", "owner"]);

// CRM users table (admin and facility owners)
export const crmUsers = pgTable("crm_users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Original password for visibility
  password_hash: text("password_hash").notNull(), // Hashed password for authentication
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  role: crmRoleEnum("role").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Companies table for admin to manage multiple companies with owners
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  website: text("website"),
  ownerId: uuid("owner_id").notNull().references(() => crmUsers.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Facilities table
export const facilities = pgTable("facilities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  ownerId: uuid("owner_id").notNull().references(() => crmUsers.id),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  phoneNumber: text("phone_number"),
  email: text("email"),
  images: text("images").array(),
  amenities: text("amenities").array(),
  status: facilityStatusEnum("status").default("pending"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Courts table
export const courts = pgTable("courts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id").notNull().references(() => facilities.id),
  name: text("name").notNull(),
  sportType: sportTypeEnum("sport_type").notNull(),
  description: text("description"),
  pricePerHour: decimal("price_per_hour", { precision: 8, scale: 2 }).notNull(),
  images: text("images").array(),
  operatingHoursStart: text("operating_hours_start").notNull(),
  operatingHoursEnd: text("operating_hours_end").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  courtId: uuid("court_id").notNull().references(() => courts.id),
  bookingDate: timestamp("booking_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  totalAmount: decimal("total_amount", { precision: 8, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 8, scale: 2 }).default("0"),
  finalAmount: decimal("final_amount", { precision: 8, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").default("pending"),
  paymentMethod: text("payment_method").notNull().default("wallet"), // wallet, stripe
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID
  transactionId: text("transaction_id"),
  notes: text("notes"),
  rewardPointsEarned: integer("reward_points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Split payments table
export const splitPayments = pgTable("split_payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  payerUserId: uuid("payer_user_id").references(() => users.id),
  payerUpiId: text("payer_upi_id"),
  payerName: text("payer_name").notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").default(false),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  courtId: uuid("court_id").notNull().references(() => courts.id),
  name: text("name").notNull(),
  frequency: text("frequency").notNull(), // weekly, monthly
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coupons table
export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id").references(() => facilities.id),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: decimal("discount_value", { precision: 8, scale: 2 }).notNull(),
  minAmount: decimal("min_amount", { precision: 8, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 8, scale: 2 }),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id").notNull().references(() => facilities.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  bookingId: uuid("booking_id").references(() => bookings.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow()
});

// Referrals table
export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: uuid("referrer_id").notNull().references(() => users.id),
  refereeId: uuid("referee_id").notNull().references(() => users.id),
  bonusPointsAwarded: integer("bonus_points_awarded").default(0),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

// Wallet transactions table
export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // credit, debit
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  referenceId: text("reference_id"), // booking id, payment id, etc.
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  facilities: many(facilities),
  bookings: many(bookings),
  reviews: many(reviews),
  referralsMade: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referee" }),
  walletTransactions: many(walletTransactions),
  subscriptions: many(subscriptions),
  splitPayments: many(splitPayments)
}));

export const facilitiesRelations = relations(facilities, ({ one, many }) => ({
  owner: one(users, {
    fields: [facilities.ownerId],
    references: [users.id]
  }),
  courts: many(courts),
  reviews: many(reviews),
  coupons: many(coupons)
}));

export const courtsRelations = relations(courts, ({ one, many }) => ({
  facility: one(facilities, {
    fields: [courts.facilityId],
    references: [facilities.id]
  }),
  bookings: many(bookings),
  subscriptions: many(subscriptions)
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id]
  }),
  court: one(courts, {
    fields: [bookings.courtId],
    references: [courts.id]
  }),
  splitPayments: many(splitPayments),
  review: one(reviews)
}));

export const splitPaymentsRelations = relations(splitPayments, ({ one }) => ({
  booking: one(bookings, {
    fields: [splitPayments.bookingId],
    references: [bookings.id]
  }),
  payerUser: one(users, {
    fields: [splitPayments.payerUserId],
    references: [users.id]
  })
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  }),
  court: one(courts, {
    fields: [subscriptions.courtId],
    references: [courts.id]
  })
}));

export const couponsRelations = relations(coupons, ({ one }) => ({
  facility: one(facilities, {
    fields: [coupons.facilityId],
    references: [facilities.id]
  })
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  facility: one(facilities, {
    fields: [reviews.facilityId],
    references: [facilities.id]
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id]
  })
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer"
  }),
  referee: one(users, {
    fields: [referrals.refereeId],
    references: [users.id],
    relationName: "referee"
  })
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  walletBalance: true,
  rewardPoints: true,
  referralCode: true,
  isActive: true,
  password_hash: true  // Don't require password_hash in the form input
});

export const insertCrmUserSchema = createInsertSchema(crmUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  password_hash: true  // Don't require password_hash in the form input
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true
});

export const insertFacilitySchema = createInsertSchema(facilities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  rating: true,
  totalReviews: true,
  isActive: true
});

export const insertCourtSchema = createInsertSchema(courts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  rewardPointsEarned: true
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  usedCount: true,
  isActive: true
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCrmUser = z.infer<typeof insertCrmUserSchema>;
export type CrmUser = typeof crmUsers.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type Facility = typeof facilities.$inferSelect;
export type InsertCourt = z.infer<typeof insertCourtSchema>;
export type Court = typeof courts.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type SplitPayment = typeof splitPayments.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
