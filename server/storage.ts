import { 
  users, facilities, courts, bookings, reviews, coupons, subscriptions, 
  splitPayments, referrals, walletTransactions, crmUsers,
  type User, type InsertUser, type Facility, type InsertFacility,
  type Court, type InsertCourt, type Booking, type InsertBooking,
  type Review, type InsertReview, type Coupon, type InsertCoupon,
  type Subscription, type InsertSubscription, type SplitPayment,
  type Referral, type WalletTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, count, avg, sum, like, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser & { referralCode?: string }): Promise<User>;
  updateUserRewardPoints(userId: string, points: number): Promise<void>;
  
  // CRM User methods
  getCrmUserByEmail(email: string): Promise<any>;
  
  // Facility methods
  getFacilities(filters: any): Promise<{ facilities: any[]; total: number }>;
  getFacilityById(id: string): Promise<Facility | undefined>;
  createFacility(insertFacility: InsertFacility): Promise<Facility>;
  updateFacilityStatus(id: string, status: string, comments?: string): Promise<Facility | undefined>;
  updateFacilityRating(facilityId: string): Promise<void>;
  getPendingFacilities(): Promise<Facility[]>;
  
  // Court methods
  getCourtsByFacilityId(facilityId: string): Promise<Court[]>;
  checkCourtAvailability(courtId: string, date: Date, startTime: string, endTime: string): Promise<boolean>;
  
  // Booking methods
  createBooking(insertBooking: InsertBooking): Promise<Booking>;
  getBookingById(id: string): Promise<Booking | undefined>;
  getUserBookings(filters: any): Promise<{ bookings: any[]; total: number }>;
  getOwnerBookings(filters: any): Promise<{ bookings: any[]; total: number }>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  checkUserBookingHistory(userId: string, facilityId: string): Promise<boolean>;
  
  // Review methods
  createReview(insertReview: InsertReview): Promise<Review>;
  getReviewsByFacilityId(facilityId: string): Promise<Review[]>;
  
  // Dashboard methods
  getOwnerDashboardStats(ownerId: string): Promise<any>;
  getAdminDashboardStats(): Promise<any>;
  
  // Wallet methods
  getUserWallet(userId: string): Promise<any>;
  addFundsToWallet(userId: string, amount: number): Promise<WalletTransaction>;
  
  // Coupon methods
  getActiveCoupons(facilityId?: string): Promise<Coupon[]>;
  validateCoupon(code: string, amount: number, facilityId?: string): Promise<Coupon | null>;
  
  // Other methods
  getSportsWithCounts(): Promise<any[]>;
  
  // Admin-specific methods
  getAllFacilitiesAdmin(): Promise<Facility[]>;
  getAllBookingsAdmin(filters: any): Promise<{ bookings: any[]; total: number }>;
  getFacilitiesByOwnerId(ownerId: string): Promise<Facility[]>;
  getAllUsers(roleFilter?: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getCrmUserByEmail(email: string) {
    const result = await db.execute(sql`
      SELECT 
        id,
        username,
        email,
        password,
        first_name,
        last_name,
        role,
        phone_number,
        is_active,
        created_at,
        updated_at
      FROM crm_users 
      WHERE email = ${email} 
      LIMIT 1
    `);
    
    if (result.rows[0]) {
      const user = result.rows[0];
      // Convert PostgreSQL 't'/'f' to boolean
      user.isActive = user.is_active === 't' || user.is_active === true;
      console.log("CRM user found:", { email: user.email, isActive: user.isActive, raw_is_active: user.is_active });
      return user;
    }
    
    return null;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { referralCode?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserRewardPoints(userId: string, points: number): Promise<void> {
    await db
      .update(users)
      .set({ rewardPoints: points })
      .where(eq(users.id, userId));
  }

  async getFacilities(filters: any): Promise<{ facilities: any[]; total: number }> {
    const { sport, city, minPrice, maxPrice, rating, page = 1, limit = 9 } = filters;
    
    let query = db.select({
      id: facilities.id,
      name: facilities.name,
      description: facilities.description,
      address: facilities.address,
      city: facilities.city,
      state: facilities.state,
      images: facilities.images,
      rating: facilities.rating,
      totalReviews: facilities.totalReviews,
    }).from(facilities)
      .where(eq(facilities.status, "approved"));

    // Add filters
    const conditions = [];
    if (city) conditions.push(ilike(facilities.city, `%${city}%`));
    if (rating) conditions.push(gte(facilities.rating, rating.toString()));

    if (conditions.length > 0) {
      const query2 = db.select({
        id: facilities.id,
        name: facilities.name,
        description: facilities.description,
        address: facilities.address,
        city: facilities.city,
        state: facilities.state,
        images: facilities.images,
        rating: facilities.rating,
        totalReviews: facilities.totalReviews,
      }).from(facilities).where(and(eq(facilities.status, "approved"), ...conditions));
      query = query2;
    }

    const result = await query
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalResult] = await db
      .select({ count: count() })
      .from(facilities)
      .where(eq(facilities.status, "approved"));

    return {
      facilities: result,
      total: totalResult.count
    };
  }

  async getFacilityById(id: string): Promise<Facility | undefined> {
    const [facility] = await db.select().from(facilities).where(eq(facilities.id, id));
    return facility || undefined;
  }

  async createFacility(insertFacility: InsertFacility): Promise<Facility> {
    const [facility] = await db
      .insert(facilities)
      .values(insertFacility)
      .returning();
    return facility;
  }

  async updateFacilityStatus(id: string, status: string, comments?: string): Promise<Facility | undefined> {
    const [facility] = await db
      .update(facilities)
      .set({ status: status as any })
      .where(eq(facilities.id, id))
      .returning();
    return facility || undefined;
  }

  async updateFacilityRating(facilityId: string): Promise<void> {
    const [result] = await db
      .select({ 
        avgRating: avg(reviews.rating),
        totalReviews: count(reviews.id)
      })
      .from(reviews)
      .where(eq(reviews.facilityId, facilityId));

    await db
      .update(facilities)
      .set({ 
        rating: result.avgRating?.toString() || "0",
        totalReviews: result.totalReviews || 0
      })
      .where(eq(facilities.id, facilityId));
  }

  async getPendingFacilities(): Promise<Facility[]> {
    return await db.select().from(facilities).where(eq(facilities.status, "pending"));
  }

  async getCourtsByFacilityId(facilityId: string): Promise<Court[]> {
    return await db.select().from(courts).where(eq(courts.facilityId, facilityId));
  }

  async checkCourtAvailability(courtId: string, date: Date, startTime: string, endTime: string): Promise<boolean> {
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, courtId),
          eq(bookings.bookingDate, date),
          or(
            and(
              lte(bookings.startTime, startTime),
              gte(bookings.endTime, startTime)
            ),
            and(
              lte(bookings.startTime, endTime),
              gte(bookings.endTime, endTime)
            ),
            and(
              gte(bookings.startTime, startTime),
              lte(bookings.endTime, endTime)
            )
          ),
          or(
            eq(bookings.status, "confirmed"),
            eq(bookings.status, "pending")
          )
        )
      );
    
    return existingBookings.length === 0;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getUserBookings(filters: any): Promise<{ bookings: any[]; total: number }> {
    const { userId, status, page = 1, limit = 10 } = filters;
    
    let query = db.select().from(bookings).where(eq(bookings.userId, userId));
    
    if (status) {
      const query2 = db.select().from(bookings).where(and(eq(bookings.userId, userId), eq(bookings.status, status as any)));
      query = query2;
    }

    const result = await query
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalResult] = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.userId, userId));

    return {
      bookings: result,
      total: totalResult.count
    };
  }

  async getOwnerBookings(filters: any): Promise<{ bookings: any[]; total: number }> {
    const { ownerId, page = 1, limit = 10 } = filters;
    
    const result = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        courtId: bookings.courtId,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        createdAt: bookings.createdAt
      })
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .innerJoin(facilities, eq(courts.facilityId, facilities.id))
      .where(eq(facilities.ownerId, ownerId))
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalResult] = await db
      .select({ count: count() })
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .innerJoin(facilities, eq(courts.facilityId, facilities.id))
      .where(eq(facilities.ownerId, ownerId));

    return {
      bookings: result,
      total: totalResult.count
    };
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ status: status as any })
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  async checkUserBookingHistory(userId: string, facilityId: string): Promise<boolean> {
    const userBookings = await db
      .select()
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .where(
        and(
          eq(bookings.userId, userId),
          eq(courts.facilityId, facilityId),
          eq(bookings.status, "completed")
        )
      )
      .limit(1);
    
    return userBookings.length > 0;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async getReviewsByFacilityId(facilityId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.facilityId, facilityId));
  }

  async getOwnerDashboardStats(ownerId: string): Promise<any> {
    const [totalRevenue] = await db
      .select({ total: sum(bookings.finalAmount) })
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .innerJoin(facilities, eq(courts.facilityId, facilities.id))
      .where(eq(facilities.ownerId, ownerId));

    const [totalBookings] = await db
      .select({ count: count() })
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .innerJoin(facilities, eq(courts.facilityId, facilities.id))
      .where(eq(facilities.ownerId, ownerId));

    const [totalFacilities] = await db
      .select({ count: count() })
      .from(facilities)
      .where(eq(facilities.ownerId, ownerId));

    return {
      totalRevenue: totalRevenue.total || 0,
      totalBookings: totalBookings.count || 0,
      totalFacilities: totalFacilities.count || 0
    };
  }

  async getAdminDashboardStats(): Promise<any> {
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalFacilities] = await db.select({ count: count() }).from(facilities);
    const [totalBookings] = await db.select({ count: count() }).from(bookings);
    const [totalRevenue] = await db.select({ total: sum(bookings.finalAmount) }).from(bookings);

    return {
      totalUsers: totalUsers.count || 0,
      totalFacilities: totalFacilities.count || 0,
      totalBookings: totalBookings.count || 0,
      totalRevenue: totalRevenue.total || 0
    };
  }

  async getUserWallet(userId: string): Promise<any> {
    const [user] = await db.select({ walletBalance: users.walletBalance, rewardPoints: users.rewardPoints })
      .from(users)
      .where(eq(users.id, userId));
    
    const transactions = await db.select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(10);

    return {
      balance: user?.walletBalance || 0,
      rewardPoints: user?.rewardPoints || 0,
      recentTransactions: transactions
    };
  }

  async addFundsToWallet(userId: string, amount: number): Promise<WalletTransaction> {
    const [user] = await db.select({ walletBalance: users.walletBalance })
      .from(users)
      .where(eq(users.id, userId));
    
    const currentBalance = parseFloat(user?.walletBalance || "0");
    const newBalance = currentBalance + amount;

    await db
      .update(users)
      .set({ walletBalance: newBalance.toString() })
      .where(eq(users.id, userId));

    const [transaction] = await db
      .insert(walletTransactions)
      .values({
        userId,
        type: "credit",
        amount: amount.toString(),
        description: "Wallet top-up",
        balanceAfter: newBalance.toString()
      })
      .returning();

    return transaction;
  }

  async getActiveCoupons(facilityId?: string): Promise<Coupon[]> {
    let query = db.select().from(coupons)
      .where(and(
        eq(coupons.isActive, true),
        lte(coupons.validFrom, new Date()),
        gte(coupons.validUntil, new Date())
      ));

    if (facilityId) {
      const query2 = db.select().from(coupons).where(and(
        eq(coupons.facilityId, facilityId),
        eq(coupons.isActive, true),
        lte(coupons.validFrom, new Date()),
        gte(coupons.validUntil, new Date())
      ));
      query = query2;
    }

    return await query;
  }

  async validateCoupon(code: string, amount: number, facilityId?: string): Promise<Coupon | null> {
    let query = db.select().from(coupons)
      .where(and(
        eq(coupons.code, code),
        eq(coupons.isActive, true),
        lte(coupons.validFrom, new Date()),
        gte(coupons.validUntil, new Date())
      ));

    if (facilityId) {
      const query2 = db.select().from(coupons).where(and(
        eq(coupons.code, code),
        eq(coupons.facilityId, facilityId),
        eq(coupons.isActive, true),
        lte(coupons.validFrom, new Date()),
        gte(coupons.validUntil, new Date())
      ));
      query = query2;
    }

    const [coupon] = await query;
    
    if (!coupon) return null;
    
    // Check minimum amount and usage limit
    if (coupon.minAmount && amount < parseFloat(coupon.minAmount)) return null;
    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) return null;

    return coupon;
  }

  async getSportsWithCounts(): Promise<any[]> {
    const result = await db
      .select({
        sport: courts.sportType,
        count: count(courts.id)
      })
      .from(courts)
      .innerJoin(facilities, eq(courts.facilityId, facilities.id))
      .where(eq(facilities.status, "approved"))
      .groupBy(courts.sportType)
      .orderBy(desc(count(courts.id)));

    return result;
  }

  async getAllFacilitiesAdmin(): Promise<Facility[]> {
    return await db.select().from(facilities).orderBy(desc(facilities.createdAt));
  }

  async getAllBookingsAdmin(filters: any): Promise<{ bookings: any[]; total: number }> {
    const { page = 1, limit = 10 } = filters;
    
    const result = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        courtId: bookings.courtId,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        createdAt: bookings.createdAt
      })
      .from(bookings)
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalResult] = await db
      .select({ count: count() })
      .from(bookings);

    return {
      bookings: result,
      total: totalResult.count
    };
  }

  async getFacilitiesByOwnerId(ownerId: string): Promise<Facility[]> {
    return await db.select().from(facilities).where(eq(facilities.ownerId, ownerId)).orderBy(desc(facilities.createdAt));
  }

  async getAllUsers(roleFilter?: string): Promise<User[]> {
    // Since users table now only contains web portal users (no role column), ignore roleFilter
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
}

export const storage = new DatabaseStorage();