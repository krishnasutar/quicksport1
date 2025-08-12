import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertFacilitySchema, insertBookingSchema, insertReviewSchema, insertCompanySchema, courts, facilities } from "@shared/schema";
import { z } from "zod";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

// Database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// Initialize Stripe (only if key is provided)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-11-20.acacia",
  });
}

// Middleware to verify JWT token
const authenticateToken = (req: any, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header:', authHeader);
  console.log('Extracted token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
  
  if (authHeader === 'Bearer null' || token === 'null') {
    console.log('Received null token, treating as missing token');
    return res.status(401).json({ message: "Access token required" });
  }

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log('JWT verification error:', err.message);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    console.log('JWT verified successfully for user:', user.id);
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

      const isValidPassword = await bcrypt.compare(password, user.password_hash as string);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = user;
      
      console.log(`CRM Login successful: ${userWithoutPassword.first_name} ${userWithoutPassword.last_name} (${userWithoutPassword.role})`);
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
        password: userData.password, // Keep original password for visibility
        password_hash: hashedPassword, // Store hashed password for authentication
        referralCode
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
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

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
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
  app.get("/api/facilities", async (req: any, res: Response) => {
    try {
      const { sport, city, minPrice, maxPrice, rating, page = 1, limit = 9 } = req.query;
      
      // Check if request has CRM token - if so, show ALL facilities regardless of status
      const token = req.headers.authorization?.split(' ')[1];
      let isCrmUser = false;
      
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          const user = await storage.getCrmUserById(decoded.id);
          isCrmUser = user && (user.role === 'admin' || user.role === 'owner');
          console.log(`CRM Token Detection: user=${user?.email}, role=${user?.role}, isCrmUser=${isCrmUser}`);
        } catch (err) {
          console.log('Token verification failed:', err.message);
        }
      }
      
      const filters = {
        sport: sport as string,
        city: city as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        rating: rating ? parseFloat(rating as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        includePending: isCrmUser // Include all facilities for CRM users
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

  // Get trending facilities (most booked this week) - must be before /:id route
  app.get("/api/facilities/trending", async (req: Request, res: Response) => {
    try {
      const trendingFacilities = await storage.getTrendingFacilities();
      res.json(trendingFacilities);
    } catch (error) {
      console.error("Get trending facilities error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/facilities/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log("Getting facility with ID:", id, "Type:", typeof id);
      
      // Basic UUID format validation - allowing repeating patterns for test data
      if (!id || typeof id !== 'string' || id.length !== 36) {
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

      const { courts, ...facilityData } = req.body;
      
      console.log('Creating facility with data:', facilityData);
      console.log('Courts data:', courts);
      
      // Create facility first
      const facility = await storage.createFacility(facilityData);
      
      // Create courts for the facility - FIXED validation issue
      const createdCourts = [];
      if (courts && courts.length > 0) {
        for (const court of courts) {
          console.log('Creating court:', court.name, 'for facility:', facility.id);
          
          const createdCourt = await storage.createCourt({
            ...court,
            facilityId: facility.id
          });
          createdCourts.push(createdCourt);
        }
      }
      
      res.status(201).json({ 
        ...facility, 
        courts: createdCourts,
        message: "Facility created successfully with courts" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", error.errors);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        });
      }
      console.error("Create facility error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Image upload endpoint for facilities  
  app.post("/api/facilities/upload-image", authenticateToken, async (req: any, res: Response) => {
    try {
      if (!['admin', 'owner'].includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      // FIXED: Use ES6 import instead of require
      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      
      res.json({ 
        uploadURL,
        method: "PUT"
      });
    } catch (error) {
      console.error("Generate upload URL error:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Update facility status
  app.patch("/api/facilities/:id/status", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can update facility status" });
      }

      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be pending, approved, or rejected" });
      }

      const facility = await storage.updateFacilityStatus(id, status);
      
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }

      res.json({ 
        ...facility,
        message: `Facility status updated to ${status}` 
      });
    } catch (error) {
      console.error("Update facility status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete facility
  app.delete("/api/facilities/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can delete facilities" });
      }

      const { id } = req.params;

      const facility = await storage.deleteFacility(id);
      
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }

      res.json({ 
        message: "Facility deleted successfully" 
      });
    } catch (error) {
      console.error("Delete facility error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });



  // Create Stripe Payment Intent
  app.post("/api/create-payment-intent", authenticateToken, async (req: any, res: Response) => {
    console.log('Payment intent request received:', {
      userId: req.user.id,
      body: req.body
    });
    
    try {
      if (!stripe) {
        console.log('Stripe not configured');
        return res.status(500).json({ 
          message: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." 
        });
      }

      const { amount, courtId, bookingDate, startTime, endTime } = req.body;
      console.log('Parsed request data:', { amount, courtId, bookingDate, startTime, endTime });
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      // Check court availability before creating payment intent
      console.log('Checking court availability...');
      const isAvailable = await storage.checkCourtAvailability(
        courtId,
        new Date(bookingDate),
        startTime,
        endTime
      );

      console.log('Court availability result:', isAvailable);
      if (!isAvailable) {
        console.log('Court not available, returning 409');
        return res.status(409).json({ 
          message: "Court is not available for the selected time slot",
          error: "COURT_UNAVAILABLE"
        });
      }

      console.log('Creating Stripe payment intent...');
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "inr",
        metadata: {
          userId: req.user.id,
          courtId,
          bookingDate,
          startTime,
          endTime
        }
      });

      console.log('Payment intent created successfully:', paymentIntent.id);
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Create payment intent error:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Bookings routes
  app.post("/api/bookings", authenticateToken, async (req: any, res: Response) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id,
        bookingDate: new Date(req.body.bookingDate)
      });

      // Handle different payment methods
      if (bookingData.paymentMethod === 'wallet') {
        // Wallet balance validation for wallet payments
        const userWallet = await storage.getUserWallet(req.user.id);
        const walletBalance = parseFloat(userWallet.balance || '0');
        const requiredAmount = parseFloat(bookingData.finalAmount.toString());

        if (walletBalance < requiredAmount) {
          return res.status(400).json({
            message: "Insufficient wallet balance for this booking",
            error: "INSUFFICIENT_WALLET_BALANCE",
            details: {
              walletBalance: walletBalance.toFixed(2),
              requiredAmount: requiredAmount.toFixed(2),
              shortfall: (requiredAmount - walletBalance).toFixed(2)
            }
          });
        }
      } else if (bookingData.paymentMethod === 'stripe') {
        // Mock Stripe payment verification - always succeeds
        if (!bookingData.paymentIntentId) {
          return res.status(400).json({ 
            message: "Payment intent ID is required for Stripe payments" 
          });
        }
        
        console.log('Mock Stripe payment verification successful for:', bookingData.paymentIntentId);
      }

      // Check court availability
      const isAvailable = await storage.checkCourtAvailability(
        bookingData.courtId,
        bookingData.bookingDate,
        bookingData.startTime,
        bookingData.endTime
      );

      if (!isAvailable) {
        return res.status(409).json({ 
          message: "Court is not available for the selected time slot",
          error: "COURT_UNAVAILABLE",
          details: "This time slot is already booked. Please select a different time."
        });
      }

      const booking = await storage.createBooking(bookingData);
      
      // Deduct wallet balance if wallet payment was used
      if (bookingData.paymentMethod === 'wallet') {
        const requiredAmount = parseFloat(bookingData.finalAmount.toString());
        await storage.deductFromWallet(req.user.id, requiredAmount, `Booking payment for court booking #${booking.id}`);
      }
      
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

  // Enhanced admin analytics endpoints
  app.get("/api/admin/analytics/revenue", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const analytics = await storage.getRevenueAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Revenue analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/analytics/facilities", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const analytics = await storage.getFacilityAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Facility analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/analytics/bookings", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const analytics = await storage.getBookingAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Booking analytics error:", error);
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

  // Create new user (admin only)
  app.post("/api/admin/users", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userData = req.body;
      console.log('Creating new user:', userData);
      
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
      
      let user;
      
      // Create user based on role
      if (userData.role === 'regular') {
        // Create in users table for regular users
        const referralCode = `QC${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        user = await storage.createUser({
          ...userData,
          password: hashedPassword,
          referralCode
        });
      } else {
        // Create in crm_users table for admin/owner roles
        const crmUserData = {
          ...userData,
          password: userData.password, // Keep original password visible
          password_hash: hashedPassword // Store hashed version for auth
        };
        
        const [newCrmUser] = await db.insert(crmUsers).values(crmUserData).returning();
        user = newCrmUser;
      }

      const { password: _, password_hash, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single user by ID (admin only)
  app.get("/api/admin/users/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const user = await storage.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user (admin only)
  app.put("/api/admin/users/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      const updateData = req.body;
      
      // If password is being updated, hash it
      if (updateData.password) {
        updateData.password_hash = await bcrypt.hash(updateData.password, 10);
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
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

  // Get latest booking for success popup
  app.get("/api/bookings/latest", authenticateToken, async (req: any, res: Response) => {
    try {
      const latestBooking = await storage.getLatestUserBooking(req.user.id);
      
      if (!latestBooking) {
        return res.status(404).json({ message: "No bookings found" });
      }

      res.json(latestBooking);
    } catch (error) {
      console.error("Get latest booking error:", error);
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

  // Courts route - Get court by ID for booking
  app.get("/api/courts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log("Getting court with ID:", id, "Type:", typeof id);
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({ message: "Invalid court ID format" });
      }

      // Get court data with facility info
      const [court] = await db
        .select({
          id: courts.id,
          facilityId: courts.facilityId,
          name: courts.name,
          sportType: courts.sportType,
          description: courts.description,
          pricePerHour: courts.pricePerHour,
          images: courts.images,
          operatingHoursStart: courts.operatingHoursStart,
          operatingHoursEnd: courts.operatingHoursEnd,
          isActive: courts.isActive,
          facilityName: facilities.name,
          facilityAddress: facilities.address,
          facilityCity: facilities.city,
          facilityPhone: facilities.phoneNumber,
          facilityEmail: facilities.email
        })
        .from(courts)
        .innerJoin(facilities, eq(courts.facilityId, facilities.id))
        .where(eq(courts.id, id));

      if (!court) {
        return res.status(404).json({ message: "Court not found" });
      }

      res.json(court);
    } catch (error) {
      console.error("Get court error:", error);
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
      if (!['admin', 'owner'].includes(req.user.role)) {
        return res.status(403).json({ message: "Admin or Owner access required" });
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

  // Company routes
  app.get("/api/companies", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Get companies error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/companies/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const company = await storage.getCompanyById(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/companies", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error: any) {
      console.error("Create company error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/companies/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(req.params.id, validatedData);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error: any) {
      console.error("Update company error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/companies/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const success = await storage.deleteCompany(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json({ message: "Company deleted successfully" });
    } catch (error) {
      console.error("Delete company error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // CRM Users route for company management
  app.get("/api/crm/users", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get only CRM users (from crm_users table) with admin and owner roles
      const users = await storage.getCrmUsers();
      res.json(users);
    } catch (error) {
      console.error("Get CRM users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get owner's assigned company
  app.get("/api/owner/company", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({ message: "Owner access required" });
      }

      const company = await storage.getCompanyByOwnerId(req.user.id);
      if (!company) {
        return res.status(404).json({ message: "No company assigned to this owner" });
      }

      res.json(company);
    } catch (error) {
      console.error("Get owner company error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get owner's facilities
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

  // Pending bookings approval API for admin/owner
  app.get("/api/admin/bookings/pending", authenticateToken, async (req: any, res: Response) => {
    try {
      if (!['admin', 'owner'].includes(req.user.role)) {
        return res.status(403).json({ message: "Admin or owner access required" });
      }

      const pendingBookings = await storage.getPendingBookings(req.user.id, req.user.role);
      res.json({ bookings: pendingBookings, total: pendingBookings.length });
    } catch (error) {
      console.error("Get pending bookings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update booking status (approve/reject)
  app.patch("/api/admin/bookings/:bookingId/status", authenticateToken, async (req: any, res: Response) => {
    try {
      if (!['admin', 'owner'].includes(req.user.role)) {
        return res.status(403).json({ message: "Admin or owner access required" });
      }

      const { status } = req.body;
      if (!['confirmed', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'confirmed' or 'rejected'" });
      }

      const updatedBooking = await storage.updateBookingStatus(req.params.bookingId, status, req.user.id, req.user.role);
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found or unauthorized" });
      }

      res.json({ message: `Booking ${status} successfully`, booking: updatedBooking });
    } catch (error) {
      console.error("Update booking status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
