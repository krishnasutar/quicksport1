import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertFacilitySchema, insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // CRM Auth routes
  app.post("/api/crm/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      console.log("CRM Login attempt:", { email, password: password ? "[PROVIDED]" : "[MISSING]", body: req.body });

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getCrmUserByEmail(email);
      console.log("User found:", user ? { id: user.id, email: user.email, role: user.role, isActive: user.isActive } : "NOT FOUND");
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (user.isActive !== true) {
        console.log("User is not active, isActive value:", user.isActive);
        return res.status(401).json({ message: "Account is not active" });
      }
      
      if (user.role !== 'admin' && user.role !== 'owner') {
        console.log("User role is not admin or owner:", user.role);
        return res.status(401).json({ message: "Insufficient permissions" });
      }

      console.log("Testing password...");
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log("Password valid:", isValidPassword);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = user;
      
      console.log("CRM Login successful for:", userWithoutPassword.email);
      res.json({ 
        user: userWithoutPassword, 
        token,
        message: "CRM login successful" 
      });
    } catch (error) {
      console.error("CRM Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Regular user auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Generate referral code
      const referralCode = `QC${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        referralCode
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ 
        user: userWithoutPassword, 
        token,
        message: "User registered successfully" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        user: userWithoutPassword, 
        token,
        message: "Login successful" 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Facilities routes
  app.get("/api/facilities", async (req: Request, res: Response) => {
    try {
      const { sport, city, minPrice, maxPrice, rating, page = 1, limit = 9 } = req.query;
      
      const filters = {
        sport: sport as string,
        city: city as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        rating: rating ? parseFloat(rating as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const { facilities, total } = await storage.getFacilities(filters);
      
      res.json({
        facilities,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      });
    } catch (error) {
      console.error("Get facilities error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/facilities/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log("Getting facility with ID:", id, "Type:", typeof id);
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({ message: "Invalid facility ID format" });
      }

      const facility = await storage.getFacilityById(id);
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }

      const courts = await storage.getCourtsByFacilityId(id);
      const reviews = await storage.getReviewsByFacilityId(id);

      res.json({
        ...facility,
        courts,
        reviews
      });
    } catch (error) {
      console.error("Get facility error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/facilities", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'owner' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only facility owners can create facilities" });
      }

      const facilityData = insertFacilitySchema.parse({
        ...req.body,
        ownerId: req.user.id
      });

      const facility = await storage.createFacility(facilityData);
      res.status(201).json(facility);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create facility error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bookings routes
  app.post("/api/bookings", authenticateToken, async (req: any, res: Response) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check court availability
      const isAvailable = await storage.checkCourtAvailability(
        bookingData.courtId,
        bookingData.bookingDate,
        bookingData.startTime,
        bookingData.endTime
      );

      if (!isAvailable) {
        return res.status(400).json({ message: "Court is not available for the selected time slot" });
      }

      const booking = await storage.createBooking(bookingData);
      
      // Update user's reward points
      const rewardPoints = Math.floor(parseFloat(bookingData.finalAmount.toString()) / 10);
      await storage.updateUserRewardPoints(req.user.id, rewardPoints);

      res.status(201).json({ ...booking, rewardPointsEarned: rewardPoints });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create booking error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin/Owner Dashboard Routes
  app.get("/api/admin/dashboard", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/owner/dashboard", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({ message: "Owner access required" });
      }
      const stats = await storage.getOwnerDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Owner dashboard error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/facilities", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const facilities = await storage.getAllFacilitiesAdmin();
      res.json(facilities);
    } catch (error) {
      console.error("Admin facilities error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/owner/facilities", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({ message: "Owner access required" });
      }
      const facilities = await storage.getFacilitiesByOwnerId(req.user.id);
      res.json(facilities);
    } catch (error) {
      console.error("Owner facilities error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/bookings", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { bookings, total } = await storage.getAllBookingsAdmin(req.query);
      res.json({ bookings, total });
    } catch (error) {
      console.error("Admin bookings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/owner/bookings", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({ message: "Owner access required" });
      }
      // Get bookings for facilities owned by this user
      const facilities = await storage.getFacilitiesByOwnerId(req.user.id);
      const facilityIds = facilities.map(f => f.id);
      const { bookings, total } = await storage.getAllBookingsAdmin({ ...req.query, facilityIds });
      res.json({ bookings, total });
    } catch (error) {
      console.error("Owner bookings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Users management endpoints
  app.get("/api/admin/users", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { role } = req.query;
      const users = await storage.getAllUsers(role);
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/users", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Generate referral code
      const referralCode = `QC${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        referralCode
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/bookings", authenticateToken, async (req: any, res: Response) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      
      const filters = {
        userId: req.user.id,
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const { bookings, total } = await storage.getUserBookings(filters);
      
      res.json({
        bookings,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      });
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/bookings/:id/cancel", authenticateToken, async (req: any, res: Response) => {
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to cancel this booking" });
      }

      if (booking.status !== 'confirmed') {
        return res.status(400).json({ message: "Only confirmed bookings can be cancelled" });
      }

      // Check if booking can be cancelled (e.g., at least 2 hours before start time)
      const bookingDateTime = new Date(`${booking.bookingDate} ${booking.startTime}`);
      const now = new Date();
      const timeDiff = bookingDateTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 2) {
        return res.status(400).json({ message: "Bookings can only be cancelled at least 2 hours in advance" });
      }

      const updatedBooking = await storage.updateBookingStatus(req.params.id, 'cancelled');
      res.json(updatedBooking);
    } catch (error) {
      console.error("Cancel booking error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reviews routes
  app.post("/api/reviews", authenticateToken, async (req: any, res: Response) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check if user has booked and completed a session at this facility
      const hasBooking = await storage.checkUserBookingHistory(req.user.id, reviewData.facilityId);
      if (!hasBooking) {
        return res.status(400).json({ message: "You can only review facilities you have booked" });
      }

      const review = await storage.createReview(reviewData);
      
      // Update facility rating
      await storage.updateFacilityRating(reviewData.facilityId);

      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create review error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // CRM/Admin owner routes for admin panel
  app.get("/api/admin/facilities", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const facilities = await storage.getAllFacilitiesAdmin();
      res.json(facilities);
    } catch (error) {
      console.error("Get admin facilities error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/bookings", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { page = 1, limit = 10 } = req.query;
      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const { bookings, total } = await storage.getAllBookingsAdmin(filters);
      
      res.json({
        bookings,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      });
    } catch (error) {
      console.error("Get admin bookings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/owner/facilities", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({ message: "Owner access required" });
      }

      const facilities = await storage.getFacilitiesByOwnerId(req.user.id);
      res.json(facilities);
    } catch (error) {
      console.error("Get owner facilities error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Owner dashboard routes
  app.get("/api/owner/dashboard", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({ message: "Owner access required" });
      }

      const stats = await storage.getOwnerDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Get owner dashboard error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/owner/bookings", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({ message: "Owner access required" });
      }

      const { page = 1, limit = 10 } = req.query;
      const filters = {
        ownerId: req.user.id,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const { bookings, total } = await storage.getOwnerBookings(filters);
      
      res.json({
        bookings,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      });
    } catch (error) {
      console.error("Get owner bookings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin dashboard routes
  app.get("/api/admin/dashboard", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Get admin dashboard error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/facilities/pending", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingFacilities = await storage.getPendingFacilities();
      res.json(pendingFacilities);
    } catch (error) {
      console.error("Get pending facilities error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/facilities/:id/approve", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status, comments } = req.body;
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be either 'approved' or 'rejected'" });
      }

      const facility = await storage.updateFacilityStatus(req.params.id, status, comments);
      res.json(facility);
    } catch (error) {
      console.error("Update facility status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wallet routes
  app.get("/api/wallet", authenticateToken, async (req: any, res: Response) => {
    try {
      const wallet = await storage.getUserWallet(req.user.id);
      res.json(wallet);
    } catch (error) {
      console.error("Get wallet error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/wallet/add-funds", authenticateToken, async (req: any, res: Response) => {
    try {
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      const transaction = await storage.addFundsToWallet(req.user.id, amount);
      res.json(transaction);
    } catch (error) {
      console.error("Add funds error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Coupons routes
  app.get("/api/coupons", async (req: Request, res: Response) => {
    try {
      const { facilityId } = req.query;
      const coupons = await storage.getActiveCoupons(facilityId as string);
      res.json(coupons);
    } catch (error) {
      console.error("Get coupons error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/coupons/validate", async (req: Request, res: Response) => {
    try {
      const { code, amount, facilityId } = req.body;
      const coupon = await storage.validateCoupon(code, amount, facilityId);
      
      if (!coupon) {
        return res.status(400).json({ message: "Invalid or expired coupon" });
      }

      res.json(coupon);
    } catch (error) {
      console.error("Validate coupon error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sports categories
  app.get("/api/sports", async (req: Request, res: Response) => {
    try {
      const sports = await storage.getSportsWithCounts();
      res.json(sports);
    } catch (error) {
      console.error("Get sports error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
