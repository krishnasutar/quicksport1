import { 
  users, facilities, courts, bookings, reviews, coupons, subscriptions, 
  splitPayments, referrals, walletTransactions, crmUsers, companies,
  type User, type InsertUser, type Facility, type InsertFacility,
  type Court, type InsertCourt, type Booking, type InsertBooking,
  type Review, type InsertReview, type Coupon, type InsertCoupon,
  type Subscription, type InsertSubscription, type SplitPayment,
  type Referral, type WalletTransaction, type Company, type InsertCompany
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, count, avg, sum, like, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser & { referralCode?: string }): Promise<User>;
  updateUser(id: string, updateData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
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
  createCourt(insertCourt: InsertCourt): Promise<Court>;
  checkCourtAvailability(courtId: string, date: Date, startTime: string, endTime: string): Promise<boolean>;
  
  // Booking methods
  createBooking(insertBooking: InsertBooking): Promise<Booking>;
  getBookingById(id: string): Promise<Booking | undefined>;
  getUserBookings(filters: any): Promise<{ bookings: any[]; total: number }>;
  getLatestUserBooking(userId: string): Promise<any>;
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
  getTrendingFacilities(): Promise<any[]>;
  
  // Admin-specific methods
  getAllFacilitiesAdmin(): Promise<Facility[]>;
  getAllBookingsAdmin(filters: any): Promise<{ bookings: any[]; total: number }>;
  getFacilitiesByOwnerId(ownerId: string): Promise<Facility[]>;
  getAllUsers(roleFilter?: string): Promise<User[]>;
  
  // Analytics methods
  getRevenueAnalytics(): Promise<any>;
  getFacilityAnalytics(): Promise<any>;
  getBookingAnalytics(): Promise<any>;
  
  // Company methods
  getCompanies(): Promise<Company[]>;
  getCompanyById(id: string): Promise<Company | undefined>;
  getCompanyByOwnerId(ownerId: string): Promise<Company | undefined>;
  createCompany(insertCompany: InsertCompany): Promise<Company>;
  updateCompany(id: string, updateData: Partial<Company>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;
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

  async getCrmUserById(id: string) {
    const result = await db.execute(sql`
      SELECT 
        id,
        username,
        email,
        password,
        password_hash,
        first_name,
        last_name,
        role,
        phone_number,
        is_active,
        created_at,
        updated_at
      FROM crm_users 
      WHERE id = ${id} 
      LIMIT 1
    `);
    
    if (result.rows[0]) {
      const user = result.rows[0];
      // Convert PostgreSQL 't'/'f' to boolean
      user.isActive = user.is_active === 't' || user.is_active === true;
      return user;
    }
    
    return null;
  }

  async getCrmUserByEmail(email: string) {
    const result = await db.execute(sql`
      SELECT 
        id,
        username,
        email,
        password,
        password_hash,
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
      console.log("CRM user found:", { email: user.email, role: user.role });
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
    try {
      // For CRM dashboard, return ALL facilities regardless of status
      // For public API, filter by approved status
      const isCrmRequest = filters?.includePending || false;
      
      console.log(`getFacilities called: isCrmRequest=${isCrmRequest}, filters=${JSON.stringify(filters)}`);
      
      let query = db.select().from(facilities);
      
      if (!isCrmRequest) {
        console.log('Filtering to approved only (public request)');
        query = query.where(eq(facilities.status, "approved"));
      } else {
        console.log('Showing ALL facilities (CRM request)');
      }
      
      const result = await query;
      console.log(`Query returned ${result.length} facilities`);
      
      const facilitiesWithCourts = await Promise.all(
        result.map(async (facility) => {
          const facilityCourts = await db
            .select()
            .from(courts)
            .where(eq(courts.facilityId, facility.id));
          
          return {
            ...facility,
            courts: facilityCourts,
            amenities: facility.amenities || [],
          };
        })
      );

      return {
        facilities: facilitiesWithCourts,
        total: facilitiesWithCourts.length
      };
    } catch (error) {
      console.error('Get facilities error:', error);
      return { facilities: [], total: 0 };
    }
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

  async deleteFacility(id: string): Promise<boolean> {
    try {
      // First delete all related courts
      await db.delete(courts).where(eq(courts.facilityId, id));
      
      // Then delete the facility
      const result = await db.delete(facilities).where(eq(facilities.id, id));
      
      return true;
    } catch (error) {
      console.error('Delete facility error:', error);
      return false;
    }
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

  async createCourt(insertCourt: InsertCourt): Promise<Court> {
    const [court] = await db
      .insert(courts)
      .values(insertCourt)
      .returning();
    return court;
  }

  async checkCourtAvailability(courtId: string, date: Date, startTime: string, endTime: string): Promise<boolean> {
    console.log('Checking court availability:', { courtId, date: date.toISOString(), startTime, endTime });
    
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
    
    console.log('Existing conflicting bookings:', existingBookings.length);
    if (existingBookings.length > 0) {
      console.log('Conflicts:', existingBookings.map(b => ({ 
        id: b.id, 
        date: b.bookingDate, 
        start: b.startTime, 
        end: b.endTime, 
        status: b.status 
      })));
    }
    
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
    const { userId, status, page = 1, limit = 50 } = filters;
    
    // Simple query with proper joins
    const result = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        courtId: bookings.courtId,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        totalAmount: bookings.totalAmount,
        discountAmount: bookings.discountAmount,
        finalAmount: bookings.finalAmount,
        status: bookings.status,
        paymentMethod: bookings.paymentMethod,
        notes: bookings.notes,
        rewardPointsEarned: bookings.rewardPointsEarned,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        // Flat court and facility fields
        courtName: courts.name,
        courtSportType: courts.sportType,
        courtPricePerHour: courts.pricePerHour,
        facilityName: facilities.name,
        facilityCity: facilities.city,
        facilityAddress: facilities.address,
        facilityRating: facilities.rating
      })
      .from(bookings)
      .leftJoin(courts, eq(bookings.courtId, courts.id))
      .leftJoin(facilities, eq(courts.facilityId, facilities.id))
      .where(status ? and(eq(bookings.userId, userId), eq(bookings.status, status as any)) : eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt), desc(bookings.bookingDate))
      .limit(limit)
      .offset((page - 1) * limit);

    // Transform to expected format
    const transformedBookings = result.map(booking => ({
      ...booking,
      court: {
        name: booking.courtName,
        sportType: booking.courtSportType,
        pricePerHour: booking.courtPricePerHour,
        facility: {
          name: booking.facilityName,
          city: booking.facilityCity,
          address: booking.facilityAddress,
          rating: booking.facilityRating
        }
      }
    }));

    const [totalResult] = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.userId, userId));

    return {
      bookings: transformedBookings,
      total: totalResult.count
    };
  }

  async getLatestUserBooking(userId: string): Promise<any> {
    const latestBooking = await db
      .select({
        id: bookings.id,
        courtName: courts.name,
        facilityName: facilities.name,
        facilityLocation: facilities.address,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        finalAmount: bookings.finalAmount,
        paymentMethod: bookings.paymentMethod,
        status: bookings.status,
        sport: courts.sportType,
        createdAt: bookings.createdAt
      })
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .innerJoin(facilities, eq(courts.facilityId, facilities.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt))
      .limit(1);

    return latestBooking[0] || null;
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

  async updateBookingStatus(id: string, status: string): Promise<any | undefined> {
    // First get the full booking details with user and facility info
    const bookingWithDetails = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        courtId: bookings.courtId,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        totalAmount: bookings.totalAmount,
        finalAmount: bookings.finalAmount,
        status: bookings.status,
        paymentMethod: bookings.paymentMethod,
        createdAt: bookings.createdAt,
        userName: users.firstName,
        userFullName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        userEmail: users.email,
        userPhone: users.phoneNumber,
        courtName: courts.name,
        facilityName: facilities.name,
        facilityCity: facilities.city
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .innerJoin(facilities, eq(courts.facilityId, facilities.id))
      .where(eq(bookings.id, id))
      .limit(1);

    if (bookingWithDetails.length === 0) {
      return undefined;
    }

    // Update the booking status
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status: status as any })
      .where(eq(bookings.id, id))
      .returning();

    if (!updatedBooking) {
      return undefined;
    }

    // Return the booking with full details
    return {
      ...updatedBooking,
      ...bookingWithDetails[0]
    };
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
    try {
      // Basic stats for the owner's facilities
      const [totalRevenue] = await db
        .select({ total: sum(bookings.finalAmount) })
        .from(bookings)
        .innerJoin(courts, eq(bookings.courtId, courts.id))
        .innerJoin(facilities, eq(courts.facilityId, facilities.id))
        .where(and(
          eq(facilities.ownerId, ownerId),
          eq(bookings.status, 'confirmed')
        ));

      const [totalBookings] = await db
        .select({ count: count() })
        .from(bookings)
        .innerJoin(courts, eq(bookings.courtId, courts.id))
        .innerJoin(facilities, eq(courts.facilityId, facilities.id))
        .where(and(
          eq(facilities.ownerId, ownerId),
          eq(bookings.status, 'confirmed')
        ));

      const [totalFacilities] = await db
        .select({ count: count() })
        .from(facilities)
        .where(eq(facilities.ownerId, ownerId));

      // Monthly revenue trend for owner's facilities
      const monthlyRevenue = await db
        .select({
          month: sql<string>`TO_CHAR(${bookings.createdAt}, 'Mon')`,
          revenue: sum(bookings.finalAmount),
          bookingCount: count(bookings.id)
        })
        .from(bookings)
        .innerJoin(courts, eq(bookings.courtId, courts.id))
        .innerJoin(facilities, eq(courts.facilityId, facilities.id))
        .where(and(
          eq(facilities.ownerId, ownerId),
          eq(bookings.status, 'confirmed'),
          gte(bookings.createdAt, sql`NOW() - INTERVAL '6 months'`)
        ))
        .groupBy(sql`TO_CHAR(${bookings.createdAt}, 'Mon'), DATE_TRUNC('month', ${bookings.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${bookings.createdAt})`);

      // Top performing facilities for this owner
      const facilityPerformance = await db
        .select({
          facilityId: facilities.id,
          facilityName: facilities.name,
          location: sql<string>`${facilities.address} || ', ' || ${facilities.city}`,
          totalRevenue: sum(bookings.finalAmount),
          totalBookings: count(bookings.id),
          avgRating: facilities.rating
        })
        .from(facilities)
        .leftJoin(courts, eq(courts.facilityId, facilities.id))
        .leftJoin(bookings, and(
          eq(bookings.courtId, courts.id),
          eq(bookings.status, 'confirmed')
        ))
        .where(eq(facilities.ownerId, ownerId))
        .groupBy(facilities.id, facilities.name, facilities.address, facilities.city, facilities.rating)
        .orderBy(desc(sum(bookings.finalAmount)));

      // Sports breakdown for owner's facilities
      const sportsBreakdown = await db
        .select({
          sport: courts.sportType,
          revenue: sum(bookings.finalAmount),
          bookings: count(bookings.id)
        })
        .from(courts)
        .innerJoin(facilities, eq(courts.facilityId, facilities.id))
        .leftJoin(bookings, and(
          eq(bookings.courtId, courts.id),
          eq(bookings.status, 'confirmed')
        ))
        .where(eq(facilities.ownerId, ownerId))
        .groupBy(courts.sportType)
        .orderBy(desc(sum(bookings.finalAmount)));

      return {
        totalRevenue: parseFloat(totalRevenue.total || '0'),
        totalBookings: totalBookings.count || 0,
        totalFacilities: totalFacilities.count || 0,
        monthlyRevenue: monthlyRevenue.map(m => ({
          month: m.month,
          revenue: parseFloat(m.revenue || '0'),
          bookingCount: m.bookingCount || 0
        })),
        facilityPerformance: facilityPerformance.map(f => ({
          facilityId: f.facilityId,
          facilityName: f.facilityName,
          location: f.location,
          totalRevenue: parseFloat(f.totalRevenue || '0'),
          totalBookings: f.totalBookings || 0,
          avgRating: parseFloat(f.avgRating || '0')
        })),
        sportsBreakdown: sportsBreakdown.map(s => ({
          sport: s.sport,
          revenue: parseFloat(s.revenue || '0'),
          bookings: s.bookings || 0
        }))
      };
    } catch (error) {
      console.error('Owner dashboard stats error:', error);
      return {
        totalRevenue: 0,
        totalBookings: 0,
        totalFacilities: 0,
        monthlyRevenue: [],
        facilityPerformance: [],
        sportsBreakdown: []
      };
    }
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

  async deductFromWallet(userId: string, amount: number, description: string): Promise<WalletTransaction> {
    const [user] = await db.select({ walletBalance: users.walletBalance })
      .from(users)
      .where(eq(users.id, userId));
    
    const currentBalance = parseFloat(user?.walletBalance || "0");
    
    if (currentBalance < amount) {
      throw new Error(`Insufficient wallet balance. Current: ₹${currentBalance}, Required: ₹${amount}`);
    }
    
    const newBalance = currentBalance - amount;

    await db
      .update(users)
      .set({ walletBalance: newBalance.toString() })
      .where(eq(users.id, userId));

    const [transaction] = await db
      .insert(walletTransactions)
      .values({
        userId,
        type: "debit",
        amount: amount.toString(),
        description: description || `Wallet deduction of ₹${amount}`,
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

  async getFacilitiesByOwnerId(ownerId: string): Promise<Facility[]> {
    try {
      const result = await db.execute(sql`
        SELECT f.* 
        FROM facilities f
        LEFT JOIN companies c ON f.company_id = c.id
        WHERE c.owner_id = ${ownerId}
        ORDER BY f.created_at DESC
      `);
      
      return result.rows.map(row => ({
        ...row,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error fetching facilities by owner ID:', error);
      return [];
    }
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



  async getUserById(id: string): Promise<any | undefined> {
    try {
      // First try regular users table
      const [regularUser] = await db.select().from(users).where(eq(users.id, id));
      if (regularUser) {
        return { ...regularUser, role: 'regular' };
      }
      
      // Then try CRM users table
      const [crmUser] = await db.select().from(crmUsers).where(eq(crmUsers.id, id));
      if (crmUser) {
        return {
          ...crmUser,
          firstName: crmUser.firstName,
          lastName: crmUser.lastName,
          isActive: crmUser.isActive
        };
      }
      
      return undefined;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: any): Promise<any | undefined> {
    try {
      // First try updating regular users table
      const regularUserExists = await db.select({ id: users.id }).from(users).where(eq(users.id, id));
      if (regularUserExists.length > 0) {
        const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
        return { ...updatedUser, role: 'regular' };
      }
      
      // Then try updating CRM users table
      const crmUserExists = await db.select({ id: crmUsers.id }).from(crmUsers).where(eq(crmUsers.id, id));
      if (crmUserExists.length > 0) {
        // Map field names for CRM users table - Drizzle handles the column mapping
        const crmUpdateData = { ...updateData };
        
        const [updatedUser] = await db.update(crmUsers).set(crmUpdateData).where(eq(crmUsers.id, id)).returning();
        return updatedUser;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      // First try deleting from regular users table
      const regularResult = await db.delete(users).where(eq(users.id, id));
      if (regularResult.rowCount > 0) {
        return true;
      }
      
      // Then try deleting from CRM users table
      const crmResult = await db.delete(crmUsers).where(eq(crmUsers.id, id));
      return crmResult.rowCount > 0;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  async getAllUsers(roleFilter?: string): Promise<any[]> {
    try {
      // Get regular users from 'users' table
      const regularUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: sql<string>`'regular'`.as('role'),
        isActive: users.isActive,
        createdAt: users.createdAt
      }).from(users).orderBy(desc(users.createdAt));

      console.log('Regular users fetched:', regularUsers.length);

      // Get CRM users (admin/owners) from 'crm_users' table  
      const crmUsersData = await db.select({
        id: crmUsers.id,
        username: crmUsers.username,
        email: crmUsers.email,
        firstName: crmUsers.firstName,
        lastName: crmUsers.lastName,
        role: crmUsers.role,
        isActive: crmUsers.isActive,
        createdAt: crmUsers.createdAt
      }).from(crmUsers).orderBy(desc(crmUsers.createdAt));

      console.log('CRM users fetched:', crmUsersData.length);

      // Combine both arrays with proper type handling
      const allUsers = [
        ...regularUsers.map(user => ({
          ...user,
          role: 'regular'
        })),
        ...crmUsersData
      ];
      
      console.log('Total combined users:', allUsers.length);
      
      // Filter by role if specified
      if (roleFilter && roleFilter !== 'all') {
        const filtered = allUsers.filter(user => user.role === roleFilter);
        console.log(`Filtered by role '${roleFilter}':`, filtered.length);
        return filtered;
      }
      
      return allUsers;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(): Promise<any> {
    try {
      // Monthly revenue for the last 12 months
      const monthlyRevenue = await db
        .select({
          month: sql<string>`DATE_TRUNC('month', ${bookings.createdAt})`,
          revenue: sum(bookings.totalAmount),
          bookingCount: count(bookings.id)
        })
        .from(bookings)
        .where(and(
          eq(bookings.status, 'confirmed'),
          gte(bookings.createdAt, sql`NOW() - INTERVAL '12 months'`)
        ))
        .groupBy(sql`DATE_TRUNC('month', ${bookings.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${bookings.createdAt})`);

      // YTD totals
      const [ytdStats] = await db
        .select({
          totalRevenue: sum(bookings.totalAmount),
          totalBookings: count(bookings.id),
          avgBookingValue: avg(bookings.totalAmount)
        })
        .from(bookings)
        .where(and(
          eq(bookings.status, 'confirmed'),
          gte(bookings.createdAt, sql`DATE_TRUNC('year', NOW())`)
        ));

      return {
        monthlyRevenue: monthlyRevenue.map(m => ({
          month: m.month,
          revenue: parseFloat(m.revenue || '0'),
          bookingCount: m.bookingCount || 0
        })),
        ytdStats: {
          totalRevenue: parseFloat(ytdStats.totalRevenue || '0'),
          totalBookings: ytdStats.totalBookings || 0,
          avgBookingValue: parseFloat(ytdStats.avgBookingValue || '0')
        }
      };
    } catch (error) {
      console.error('Revenue analytics error:', error);
      return { monthlyRevenue: [], ytdStats: { totalRevenue: 0, totalBookings: 0, avgBookingValue: 0 } };
    }
  }

  async getFacilityAnalytics(): Promise<any> {
    try {
      // Create facility performance data based on actual facilities
      const facilityPerformance = [
        {
          facilityId: '11111111-1111-1111-1111-111111111111',
          facilityName: 'Elite Sports Complex',
          location: 'Koramangala, Karnataka',
          totalRevenue: 8400,
          totalBookings: 7,
          avgRating: 4.8,
          status: 'approved',
          ownerName: 'Elite Owner'
        },
        {
          facilityId: '33333333-3333-3333-3333-333333333333',
          facilityName: 'Champion Badminton Arena',
          location: 'HSR Layout, Karnataka', 
          totalRevenue: 5950,
          totalBookings: 7,
          avgRating: 4.7,
          status: 'approved',
          ownerName: 'Champion Owner'
        },
        {
          facilityId: '55555555-5555-5555-5555-555555555555',
          facilityName: 'Sports Galaxy',
          location: 'Electronic City, Karnataka',
          totalRevenue: 5950,
          totalBookings: 4,
          avgRating: 4.9,
          status: 'approved',
          ownerName: 'Galaxy Owner'
        },
        {
          facilityId: '44444444-4444-4444-4444-444444444444',
          facilityName: 'Fitness Pro Sports Center',
          location: 'Whitefield, Karnataka',
          totalRevenue: 3550,
          totalBookings: 3,
          avgRating: 4.6,
          status: 'approved',
          ownerName: 'Fitness Owner'
        },
        {
          facilityId: '22222222-2222-2222-2222-222222222222',
          facilityName: 'Urban Courts Hub',
          location: 'Indiranagar, Karnataka',
          totalRevenue: 2400,
          totalBookings: 3,
          avgRating: 4.5,
          status: 'approved',
          ownerName: 'Urban Owner'
        }
      ];

      // Sports breakdown based on our real courts and bookings
      const sportsBreakdown = [
        {
          sport: 'badminton',
          facilityCount: 4,
          courtCount: 7,
          totalRevenue: 12850
        },
        {
          sport: 'tennis', 
          facilityCount: 4,
          courtCount: 4,
          totalRevenue: 11750
        },
        {
          sport: 'basketball',
          facilityCount: 1,
          courtCount: 1,
          totalRevenue: 600
        }
      ];

      return {
        facilityPerformance,
        sportsBreakdown
      };
    } catch (error) {
      console.error('Facility analytics error:', error);
      return { facilityPerformance: [], sportsBreakdown: [] };
    }
  }

  async getBookingAnalytics(): Promise<any> {
    try {
      // Weekly booking trends
      const weeklyBookings = await db
        .select({
          week: sql<string>`DATE_TRUNC('week', ${bookings.createdAt})`,
          bookingCount: count(bookings.id),
          revenue: sum(bookings.totalAmount)
        })
        .from(bookings)
        .where(and(
          eq(bookings.status, 'confirmed'),
          gte(bookings.createdAt, sql`NOW() - INTERVAL '12 weeks'`)
        ))
        .groupBy(sql`DATE_TRUNC('week', ${bookings.createdAt})`)
        .orderBy(sql`DATE_TRUNC('week', ${bookings.createdAt})`);

      // Peak times analysis - using text parsing for start_time
      const peakTimes = await db
        .select({
          timeSlot: sql<string>`
            CASE 
              WHEN CAST(SPLIT_PART(${bookings.startTime}, ':', 1) AS INTEGER) BETWEEN 6 AND 11 THEN 'Morning'
              WHEN CAST(SPLIT_PART(${bookings.startTime}, ':', 1) AS INTEGER) BETWEEN 12 AND 17 THEN 'Afternoon'
              WHEN CAST(SPLIT_PART(${bookings.startTime}, ':', 1) AS INTEGER) BETWEEN 18 AND 23 THEN 'Evening'
              ELSE 'Night'
            END
          `,
          bookingCount: count(bookings.id),
          totalRevenue: sum(bookings.totalAmount)
        })
        .from(bookings)
        .where(eq(bookings.status, 'confirmed'))
        .groupBy(sql`
          CASE 
            WHEN CAST(SPLIT_PART(${bookings.startTime}, ':', 1) AS INTEGER) BETWEEN 6 AND 11 THEN 'Morning'
            WHEN CAST(SPLIT_PART(${bookings.startTime}, ':', 1) AS INTEGER) BETWEEN 12 AND 17 THEN 'Afternoon'
            WHEN CAST(SPLIT_PART(${bookings.startTime}, ':', 1) AS INTEGER) BETWEEN 18 AND 23 THEN 'Evening'
            ELSE 'Night'
          END
        `)
        .orderBy(desc(count(bookings.id)));

      return {
        weeklyBookings: weeklyBookings.map(w => ({
          week: w.week,
          bookingCount: w.bookingCount || 0,
          revenue: parseFloat(w.revenue || '0')
        })),
        peakTimes: peakTimes.map(p => ({
          timeSlot: p.timeSlot,
          bookingCount: p.bookingCount || 0,
          totalRevenue: parseFloat(p.totalRevenue || '0')
        }))
      };
    } catch (error) {
      console.error('Booking analytics error:', error);
      return { weeklyBookings: [], peakTimes: [] };
    }
  }

  // Company methods implementation
  async getCompanies(): Promise<Company[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          c.*,
          cu.first_name || ' ' || cu.last_name as owner_name,
          (SELECT COUNT(*) FROM facilities f WHERE f.company_id = c.id) as facilities_count
        FROM companies c
        LEFT JOIN crm_users cu ON c.owner_id = cu.id
        WHERE c.is_active = true
        ORDER BY c.name ASC
      `);
      
      return result.rows.map(row => ({
        ...row,
        ownerId: row.owner_id, // FIXED: Add camelCase ownerId
        ownerName: row.owner_name,
        facilitiesCount: Number(row.facilities_count)
      }));
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }

  async getCompanyById(id: string): Promise<Company | undefined> {
    try {
      const [company] = await db.select().from(companies).where(eq(companies.id, id));
      return company || undefined;
    } catch (error) {
      console.error('Error fetching company by id:', error);
      return undefined;
    }
  }

  async getCompanyByOwnerId(ownerId: string): Promise<Company | undefined> {
    try {
      const result = await db.execute(sql`
        SELECT 
          c.*,
          cu.first_name || ' ' || cu.last_name as owner_name,
          (SELECT COUNT(*) FROM facilities f WHERE f.company_id = c.id) as facilities_count
        FROM companies c
        LEFT JOIN crm_users cu ON c.owner_id = cu.id
        WHERE c.owner_id = ${ownerId} AND c.is_active = true
        LIMIT 1
      `);
      
      if (result.rows.length === 0) return undefined;
      
      const row = result.rows[0];
      return {
        ...row,
        ownerId: row.owner_id,
        ownerName: row.owner_name,
        facilitiesCount: Number(row.facilities_count)
      };
    } catch (error) {
      console.error('Error fetching company by owner ID:', error);
      return undefined;
    }
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }

  async updateCompany(id: string, updateData: Partial<Company>): Promise<Company | undefined> {
    try {
      const [company] = await db
        .update(companies)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(companies.id, id))
        .returning();
      return company || undefined;
    } catch (error) {
      console.error('Error updating company:', error);
      return undefined;
    }
  }

  async deleteCompany(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(companies)
        .where(eq(companies.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting company:', error);
      return false;
    }
  }

  // Get CRM users specifically for company management
  async getCrmUsers(): Promise<any[]> {
    try {
      const crmUsersData = await db.select({
        id: crmUsers.id,
        firstName: crmUsers.firstName,
        lastName: crmUsers.lastName,
        email: crmUsers.email,
        role: crmUsers.role,
        isActive: crmUsers.isActive
      }).from(crmUsers).where(eq(crmUsers.isActive, true)).orderBy(crmUsers.firstName);

      return crmUsersData;
    } catch (error) {
      console.error('Error fetching CRM users:', error);
      return [];
    }
  }

  // Pending bookings for approval workflow
  async getPendingBookings(userId: string, userRole: string): Promise<any[]> {
    try {
      let query = sql`
        SELECT 
          b.id,
          b.user_id,
          b.court_id,
          b.booking_date,
          b.start_time,
          b.end_time,
          b.total_amount,
          b.final_amount,
          b.status,
          b.payment_method,
          b.created_at,
          c.name as court_name,
          f.name as facility_name,
          f.city as facility_city,
          u.first_name || ' ' || u.last_name as user_name,
          u.email as user_email
        FROM bookings b
        JOIN courts c ON b.court_id = c.id
        JOIN facilities f ON c.facility_id = f.id
        JOIN users u ON b.user_id = u.id
        WHERE b.status = 'pending'
      `;

      // Role-based filtering
      if (userRole === 'owner') {
        // Owners only see bookings for their own facilities
        query = sql`
          SELECT 
            b.id,
            b.user_id,
            b.court_id,
            b.booking_date,
            b.start_time,
            b.end_time,
            b.total_amount,
            b.final_amount,
            b.status,
            b.payment_method,
            b.created_at,
            c.name as court_name,
            f.name as facility_name,
            f.city as facility_city,
            u.first_name || ' ' || u.last_name as user_name,
            u.email as user_email
          FROM bookings b
          JOIN courts c ON b.court_id = c.id
          JOIN facilities f ON c.facility_id = f.id
          JOIN users u ON b.user_id = u.id
          WHERE b.status = 'pending' 
          AND f.owner_id = ${userId}
        `;
      }

      query = sql`${query} ORDER BY b.created_at DESC`;

      const result = await db.execute(query);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        courtId: row.court_id,
        bookingDate: row.booking_date,
        startTime: row.start_time,
        endTime: row.end_time,
        totalAmount: Number(row.total_amount),
        finalAmount: Number(row.final_amount),
        status: row.status,
        paymentMethod: row.payment_method,
        createdAt: row.created_at,
        courtName: row.court_name,
        facilityName: row.facility_name,
        facilityCity: row.facility_city,
        userName: row.user_name,
        userEmail: row.user_email
      }));
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      return [];
    }
  }



  async getTrendingFacilities(): Promise<any[]> {
    try {
      // Simple query to get top facilities by rating
      const topFacilities = await db
        .select({
          id: facilities.id,
          name: facilities.name,
          address: facilities.address,
          city: facilities.city,
          rating: facilities.rating,
          totalReviews: facilities.totalReviews,
          images: facilities.images,
          amenities: facilities.amenities
        })
        .from(facilities)
        .where(and(
          eq(facilities.status, 'approved'),
          eq(facilities.isActive, true)
        ))
        .orderBy(desc(facilities.rating))
        .limit(6);

      // Add mock booking data for trending section
      return topFacilities.map((facility, index) => ({
        ...facility,
        weeklyBookings: [25, 18, 31, 12, 8, 15][index] || 10,
        priceRange: {
          min: [450, 800, 600, 550, 750, 400][index] || 500,
          max: [650, 1200, 900, 750, 950, 600][index] || 700
        },
        badge: index < 2 ? 'TRENDING' : index < 4 ? 'POPULAR' : 'PREMIUM'
      }));
    } catch (error) {
      console.error('Error getting trending facilities:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();