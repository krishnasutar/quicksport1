import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Calendar, Building, Users, DollarSign, TrendingUp, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  if (!user || user.role !== 'owner') {
    navigate('/');
    return null;
  }

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/owner/dashboard'],
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['/api/owner/bookings'],
  });

  const { data: facilitiesData } = useQuery({
    queryKey: ['/api/facilities', { ownerId: user.id }],
  });

  const stats = dashboardStats || {
    totalRevenue: 0,
    totalBookings: 0,
    totalFacilities: 0,
    monthlyRevenue: [],
    facilityPerformance: [],
    sportsBreakdown: []
  };
  const bookings = bookingsData?.bookings || [];
  const facilities = facilitiesData?.facilities || [];

  // Use real data from backend analytics
  const bookingTrends = stats.monthlyRevenue || [];
  
  // Transform sports breakdown for charts
  const sportsChartData = (stats.sportsBreakdown || []).map(item => ({
    sport: item.sport.charAt(0).toUpperCase() + item.sport.slice(1),
    revenue: item.revenue,
    bookings: item.bookings
  }));

  // Create facility performance data
  const facilityChartData = (stats.facilityPerformance || []).map(facility => ({
    name: facility.facilityName.split(' ').slice(0, 2).join(' '), // Shorten names for charts
    revenue: facility.totalRevenue,
    bookings: facility.totalBookings,
    rating: facility.avgRating
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-600">Manage your facilities and track performance</p>
          </div>
          <Button className="gradient-bg">
            Add New Facility
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-indigo bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-brand-indigo" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Facilities</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFacilities || facilities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-emerald bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-brand-emerald" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings || bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-purple bg-opacity-10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-brand-purple" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-orange bg-opacity-10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-brand-orange" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sports Offered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.sportsBreakdown?.length || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={bookingTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--brand-indigo))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      No revenue data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sports Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Sports Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {sportsChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={sportsChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sport" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="hsl(var(--brand-emerald))" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      No sports data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Facility Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Facility Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {facilityChartData.length > 0 ? (
                  <div className="space-y-4">
                    {stats.facilityPerformance.map((facility, index) => (
                      <div key={facility.facilityId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{facility.facilityName}</h3>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Rating: {facility.avgRating.toFixed(1)}/5</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{facility.location}</div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-gray-900">₹{facility.totalRevenue.toLocaleString()}</span>
                            <span className="text-sm text-gray-600 ml-2">Revenue</span>
                          </div>
                          <div>
                            <span className="text-lg font-bold text-gray-900">{facility.totalBookings}</span>
                            <span className="text-sm text-gray-600 ml-2">Bookings</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No facility performance data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 10).map((booking: any) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {booking.court?.name} - {booking.user?.firstName} {booking.user?.lastName}
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
                                <Users className="h-4 w-4 mr-1" />
                                {booking.user?.email}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              ₹{parseFloat(booking.finalAmount).toFixed(0)}
                            </div>
                            <Button variant="outline" size="sm" className="mt-2">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Bookings Yet</h3>
                    <p className="text-gray-500">Bookings will appear here once customers start booking your facilities</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facilities">
            <Card>
              <CardHeader>
                <CardTitle>Your Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                {facilities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {facilities.map((facility: any) => (
                      <div key={facility.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <img
                            src={facility.images?.[0] || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'}
                            alt={facility.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{facility.name}</h3>
                              <Badge className={getStatusColor(facility.status)}>
                                {facility.status}
                              </Badge>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              {facility.city}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{facility.courts?.length || 0} Courts</span>
                              <span>★ {parseFloat(facility.rating || "0").toFixed(1)}</span>
                              <span>{facility.totalReviews} Reviews</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Manage Courts
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Facilities Yet</h3>
                    <p className="text-gray-500 mb-4">Add your first facility to start receiving bookings</p>
                    <Button className="gradient-bg">
                      Add New Facility
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Send Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Message Title
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Special offer on weekend bookings!"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Message Content
                    </label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                      placeholder="Get 20% off on all weekend bookings this month..."
                    />
                  </div>
                  <Button className="gradient-bg">
                    Send to All Customers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}
