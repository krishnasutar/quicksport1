import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  Users, 
  Calendar, 
  DollarSign, 
  Package, 
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

interface CRMUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'owner';
}

export default function CRMDashboard() {
  const [_, setLocation] = useLocation();
  const [user, setUser] = useState<CRMUser | null>(null);

  useEffect(() => {
    const crmToken = localStorage.getItem('crm_token');
    const crmUser = localStorage.getItem('crm_user');
    
    if (!crmToken || !crmUser) {
      setLocation('/crm');
      return;
    }
    
    setUser(JSON.parse(crmUser));
  }, [setLocation]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('crm_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const { data: dashboardStats } = useQuery({
    queryKey: [user?.role === 'admin' ? '/api/admin/dashboard' : '/api/owner/dashboard'],
    queryFn: async () => {
      const endpoint = user?.role === 'admin' ? '/api/admin/dashboard' : '/api/owner/dashboard';
      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: facilities } = useQuery({
    queryKey: [user?.role === 'admin' ? '/api/admin/facilities' : '/api/owner/facilities'],
    queryFn: async () => {
      const endpoint = user?.role === 'admin' ? '/api/admin/facilities' : '/api/owner/facilities';
      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch facilities');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: bookings } = useQuery({
    queryKey: [user?.role === 'admin' ? '/api/admin/bookings' : '/api/owner/bookings'],
    queryFn: async () => {
      const endpoint = user?.role === 'admin' ? '/api/admin/bookings' : '/api/owner/bookings';
      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    enabled: !!user,
  });

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setLocation('/crm');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">QuickCourt CRM</h1>
                <p className="text-sm text-gray-500">
                  {isAdmin ? 'Admin Dashboard' : 'Facility Management'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? 'Admin' : 'Facility Owner'}
              </Badge>
              <span className="text-sm text-gray-700">
                {user.firstName} {user.lastName}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{dashboardStats?.totalRevenue?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? 'Total Facilities' : 'My Facilities'}
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats?.totalFacilities || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats?.totalBookings || 0}
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.totalUsers || 0}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="facilities" className="space-y-6">
          <TabsList className="grid w-full lg:w-[600px] grid-cols-5">
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="facilities" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Facility Management</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage your sports facilities and courts
                    </p>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Facility
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {facilities?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Facility
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {facilities.map((facility: any) => (
                          <tr key={facility.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                                <div className="text-sm text-gray-500">{facility.description?.substring(0, 50)}...</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{facility.city}, {facility.state}</div>
                              <div className="text-sm text-gray-500">{facility.address}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={facility.status === 'approved' ? 'default' : 
                                        facility.status === 'pending' ? 'secondary' : 'destructive'}
                              >
                                {facility.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ⭐ {facility.rating}/5 ({facility.totalReviews} reviews)
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {isAdmin && (
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No facilities found. {isAdmin ? 'Add your first facility to get started.' : 'Facilities will appear here once added.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bookings Management</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAdmin ? 'Manage all platform bookings' : 'Manage bookings for your facilities'}
                </p>
              </CardHeader>
              <CardContent>
                {bookings?.bookings?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.bookings.map((booking: any) => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{booking.id.slice(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.bookingDate}</div>
                              <div className="text-sm text-gray-500">{booking.startTime} - {booking.endTime}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{booking.totalAmount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={booking.status === 'confirmed' ? 'default' : 
                                            booking.status === 'pending' ? 'secondary' : 'destructive'}>
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {isAdmin && (
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No bookings found.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Analytics charts and insights coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Inventory Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Equipment and inventory tracking coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  {isAdmin ? 'Platform Settings' : 'Account Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-600">Receive booking updates via email</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Platform Settings</h3>
                        <p className="text-sm text-gray-600">Manage platform-wide configurations</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Security</h3>
                      <p className="text-sm text-gray-600">Update password and security settings</p>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}