import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, MapPin, Clock, CreditCard, Star, Gift, Users, Trophy, Edit, Lock, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Link, useLocation } from "wouter";
import BookingSuccessPopup from "@/components/BookingSuccessPopup";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form schemas
const editProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(13, "Phone number cannot exceed 13 digits")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .optional()
    .or(z.literal("")),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function UserDashboard() {
  const { user, updateUser, logout } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Check if we're showing success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(() => {
    return new URLSearchParams(window.location.search).get('booking') === 'success';
  });

  // ✅ LAZY LOADING - Default to empty state, only load when user clicks tabs
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'profile'; // Default to profile tab (no API calls)
  });

  // Form configurations
  const editForm = useForm<z.infer<typeof editProfileSchema>>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Mutations
  const editProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof editProfileSchema>) => {
      const response = await apiRequest("PUT", `/api/users/${user?.id}`, values);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast({ title: "Profile updated successfully" });
      setShowEditDialog(false);
      editForm.reset();
    },
    onError: () => {
      toast({ 
        title: "Failed to update profile", 
        description: "Please try again",
        variant: "destructive" 
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (values: z.infer<typeof changePasswordSchema>) => {
      const response = await apiRequest("PUT", "/api/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setShowPasswordDialog(false);
      passwordForm.reset();
    },
    onError: () => {
      toast({ 
        title: "Failed to change password", 
        description: "Please check your current password and try again",
        variant: "destructive" 
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/users/${user?.id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Account deleted successfully" });
      logout();
      navigate('/');
    },
    onError: () => {
      toast({ 
        title: "Failed to delete account", 
        description: "Please try again or contact support",
        variant: "destructive" 
      });
    },
  });

  // Update tab when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && ['bookings', 'wallet', 'rewards', 'profile'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, []);
  
  if (!user) {
    navigate('/login');
    return null;
  }

  // ✅ LAZY LOADING - Only fetch when user clicks on tabs or triggers actions
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['/api/bookings'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: activeTab === 'bookings', // Only fetch when bookings tab is active
  });

  const { data: walletData, refetch: refetchWallet } = useQuery({
    queryKey: ['/api/wallet'],
    enabled: activeTab === 'wallet', // Only fetch when wallet tab is active
  });

  const bookings = (bookingsData as any)?.bookings || [];
  
  // Sort bookings by creation date (most recent first) and then by booking date
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    if (dateA !== dateB) return dateB - dateA; // Most recent creation first
    return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(); // Then by booking date
  });
  
  console.log('Dashboard bookings data:', sortedBookings?.slice(0, 3)); // Debug log
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  
  const upcomingBookings = sortedBookings.filter((booking: any) => {
    const bookingDate = new Date(booking.bookingDate);
    bookingDate.setHours(0, 0, 0, 0);
    return (booking.status === 'confirmed' || booking.status === 'pending') && bookingDate >= today;
  });
  
  const pastBookings = sortedBookings.filter((booking: any) => {
    const bookingDate = new Date(booking.bookingDate);
    bookingDate.setHours(0, 0, 0, 0);
    return booking.status === 'completed' || bookingDate < today;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profilePicture || undefined} alt={user.username} />
              <AvatarFallback className="bg-brand-indigo text-white text-xl">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-600">Ready for your next game?</p>
            </div>
            </div>
            <Button 
              onClick={() => {
                refetchBookings();
                queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
              }}
              variant="outline"
              className="text-brand-indigo border-brand-indigo hover:bg-brand-indigo hover:text-white"
            >
              Refresh Bookings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-indigo bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-brand-indigo" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-emerald bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Gift className="h-6 w-6 text-brand-emerald" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reward Points</p>
                  <p className="text-2xl font-bold text-gray-900">{user.rewardPoints || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-purple bg-opacity-10 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-brand-purple" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wallet Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{parseFloat((walletData as any)?.balance || user.walletBalance || "0").toFixed(0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-orange bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-brand-orange" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sortedBookings.filter((b: any) => {
                      const bookingDate = new Date(b.createdAt);
                      const currentDate = new Date();
                      return bookingDate.getMonth() === currentDate.getMonth() && 
                             bookingDate.getFullYear() === currentDate.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking: any) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {booking.court?.name || booking.courtName || 'Court'} at {booking.court?.facility?.name || booking.facilityName || 'Facility'}
                              </h3>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(booking.bookingDate)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {booking.court?.facility?.city || booking.facilityCity}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              ₹{parseFloat(booking.finalAmount).toFixed(0)}
                            </div>
                            {booking.status === 'confirmed' && (
                              <Button variant="outline" size="sm" className="mt-2">
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Upcoming Bookings</h3>
                    <p className="text-gray-500 mb-4">Book your next court session to see it here</p>
                    <Button asChild>
                      <Link href="/">Find Courts</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
              </CardHeader>
              <CardContent>
                {pastBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pastBookings.slice(0, 10).map((booking: any) => (
                      <div key={booking.id} className="border border-gray-100 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900">
                                {booking.court?.name || booking.courtName || 'Court'} at {booking.court?.facility?.name || booking.facilityName || 'Facility'}
                              </h3>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(booking.bookingDate)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              ₹{parseFloat(booking.finalAmount).toFixed(0)}
                            </div>
                            {booking.status === 'completed' && (
                              <Button variant="outline" size="sm" className="mt-2">
                                <Star className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No booking history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            {/* Wallet Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Digital Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ₹{parseFloat((walletData as any)?.balance || user.walletBalance || "0").toFixed(0)}
                  </div>
                  <p className="text-gray-600 mb-6">Available Balance</p>
                  <div className="flex justify-center space-x-4">
                    <Button className="gradient-bg">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                    <Button variant="outline">
                      <Clock className="h-4 w-4 mr-2" />
                      Transaction History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Add Amounts */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Add Funds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[500, 1000, 2000, 5000].map((amount) => (
                    <Button 
                      key={amount}
                      variant="outline" 
                      className="h-16 text-lg font-semibold hover:bg-brand-indigo hover:text-white transition-colors"
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {(walletData as any)?.recentTransactions && (walletData as any).recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {(walletData as any).recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'credit' ? 
                              <CreditCard className="h-5 w-5 text-green-600" /> : 
                              <Clock className="h-5 w-5 text-red-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}₹{Math.abs(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions yet</p>
                    <p className="text-sm text-gray-400">Your wallet transactions will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Rewards & Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-brand-indigo to-brand-purple rounded-xl text-white">
                    <Gift className="h-12 w-12 mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">{user.rewardPoints || 0}</div>
                    <p>Reward Points</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-brand-emerald to-brand-cyan rounded-xl text-white">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">{user.referralCode}</div>
                    <p>Your Referral Code</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.profilePicture || undefined} />
                    <AvatarFallback className="text-lg">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <p className="text-gray-900 font-medium">{user.firstName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <p className="text-gray-900 font-medium">{user.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Username</label>
                        <p className="text-gray-900">@{user.username}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <p className="text-gray-900">{user.phoneNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Student Status</label>
                        <Badge variant={user.isStudentVerified ? "default" : "secondary"}>
                          {user.isStudentVerified ? "✓ Verified Student" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive booking confirmations and updates</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Get important updates via SMS</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Student Verification</h4>
                      <p className="text-sm text-gray-600">Verify student status for discounts</p>
                    </div>
                    {user.isStudentVerified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Button variant="outline" size="sm">Verify Now</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button 
                    className="gradient-bg" 
                    onClick={() => {
                      editForm.reset({
                        firstName: user?.firstName || "",
                        lastName: user?.lastName || "",
                        phoneNumber: user?.phoneNumber || "",
                      });
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      passwordForm.reset();
                      setShowPasswordDialog(true);
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
      
      {/* Booking Success Popup */}
      {showSuccessPopup && (
        <BookingSuccessPopup
          isOpen={showSuccessPopup}
          onClose={() => {
            setShowSuccessPopup(false);
            // Clean up URL parameters
            window.history.replaceState({}, '', '/dashboard');
          }}
        />
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information. Changes will be saved to your account.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((values) => editProfileMutation.mutate(values))} className="space-y-4">
              <FormField
                control={editForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Max 13 digits)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter phone number" 
                        maxLength={13}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editProfileMutation.isPending}>
                  {editProfileMutation.isPending ? "Updating..." : "Update Profile"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit((values) => changePasswordMutation.mutate(values))} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription className="text-red-600">
              This action cannot be undone. Your account and all associated data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete your account? This will:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Delete all your bookings and history</li>
              <li>Remove your wallet balance and reward points</li>
              <li>Cancel any upcoming reservations</li>
              <li>Permanently delete your profile</li>
            </ul>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              disabled={deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
            >
              {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
