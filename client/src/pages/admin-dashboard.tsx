import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Building, Users, Calendar, DollarSign, TrendingUp, MapPin, Star, Check, X, Eye } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [approvalComments, setApprovalComments] = useState("");

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/admin/dashboard'],
  });

  const { data: pendingFacilities } = useQuery({
    queryKey: ['/api/admin/facilities/pending'],
  });

  const approveFacilityMutation = useMutation({
    mutationFn: async ({ facilityId, status, comments }: { facilityId: string, status: string, comments: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/facilities/${facilityId}/approve`, {
        status,
        comments
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/facilities/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      setSelectedFacility(null);
      setApprovalComments("");
      toast({
        title: "Success",
        description: "Facility status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update facility status",
        variant: "destructive",
      });
    },
  });

  const stats = dashboardStats || {};
  const facilities = pendingFacilities || [];

  // Mock data for charts
  const userGrowth = [
    { month: 'Jan', users: 1200, owners: 45 },
    { month: 'Feb', users: 1500, owners: 52 },
    { month: 'Mar', users: 1800, owners: 61 },
    { month: 'Apr', users: 2100, owners: 68 },
    { month: 'May', users: 2400, owners: 75 },
    { month: 'Jun', users: 2700, owners: 82 },
  ];

  const sportDistribution = [
    { name: 'Basketball', value: 30, color: 'hsl(var(--brand-orange))' },
    { name: 'Football', value: 25, color: 'hsl(var(--brand-emerald))' },
    { name: 'Tennis', value: 20, color: 'hsl(var(--brand-cyan))' },
    { name: 'Badminton', value: 15, color: 'hsl(var(--brand-purple))' },
    { name: 'Others', value: 10, color: 'hsl(var(--brand-indigo))' },
  ];

  const handleApprovalAction = (facility: any, action: 'approved' | 'rejected') => {
    approveFacilityMutation.mutate({
      facilityId: facility.id,
      status: action,
      comments: approvalComments
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Platform overview and management</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-indigo bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-brand-indigo" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || '2,847'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-emerald bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-brand-emerald" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Facility Owners</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOwners || '89'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-purple bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-brand-purple" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings || '15,432'}</p>
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
                  <p className="text-sm text-gray-600">Active Facilities</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeFacilities || '267'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">
              Facility Approvals
              {facilities.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{facilities.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="hsl(var(--brand-indigo))" />
                      <Bar dataKey="owners" fill="hsl(var(--brand-emerald))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sport Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Active Sports</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sportDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {sportDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">New facility approved</p>
                      <p className="text-sm text-gray-600">Elite Sports Complex in Bangalore</p>
                    </div>
                    <span className="text-sm text-gray-500">2 hours ago</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">50 new user registrations</p>
                      <p className="text-sm text-gray-600">Today's sign-ups</p>
                    </div>
                    <span className="text-sm text-gray-500">1 day ago</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Record bookings</p>
                      <p className="text-sm text-gray-600">450 bookings made today</p>
                    </div>
                    <span className="text-sm text-gray-500">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Pending Facility Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {facilities.length > 0 ? (
                  <div className="space-y-6">
                    {facilities.map((facility: any) => (
                      <div key={facility.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <img
                              src={facility.images?.[0] || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'}
                              alt={facility.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{facility.name}</h3>
                              <div className="flex items-center text-gray-600 text-sm mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                {facility.address}, {facility.city}
                              </div>
                              <p className="text-sm text-gray-600">
                                Owner: {facility.owner?.firstName} {facility.owner?.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Submitted: {new Date(facility.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">Pending Review</Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{facility.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Courts</span>
                            <p className="text-lg font-semibold">{facility.courts?.length || 0}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Sports</span>
                            <p className="text-sm text-gray-600">
                              {facility.courts?.map((c: any) => c.sportType).join(', ') || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Contact</span>
                            <p className="text-sm text-gray-600">{facility.phoneNumber}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Email</span>
                            <p className="text-sm text-gray-600">{facility.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFacility(facility)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review Details
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprovalAction(facility, 'approved')}
                            disabled={approveFacilityMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleApprovalAction(facility, 'rejected')}
                            disabled={approveFacilityMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Pending Approvals</h3>
                    <p className="text-gray-500">All facility submissions have been reviewed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">User Management</h3>
                  <p className="text-gray-500">Advanced user management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Platform Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-brand-indigo to-brand-purple rounded-xl text-white">
                    <DollarSign className="h-12 w-12 mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">₹5.2M</div>
                    <p>Total Platform Revenue</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-brand-emerald to-brand-cyan rounded-xl text-white">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">23%</div>
                    <p>Monthly Growth Rate</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-brand-orange to-red-500 rounded-xl text-white">
                    <Star className="h-12 w-12 mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">4.8</div>
                    <p>Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Facility Review Dialog */}
      <Dialog open={!!selectedFacility} onOpenChange={() => setSelectedFacility(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Facility: {selectedFacility?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedFacility && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Facility Name</label>
                  <p className="text-gray-900">{selectedFacility.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Owner</label>
                  <p className="text-gray-900">{selectedFacility.owner?.firstName} {selectedFacility.owner?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact</label>
                  <p className="text-gray-900">{selectedFacility.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedFacility.email}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Address</label>
                <p className="text-gray-900">{selectedFacility.address}, {selectedFacility.city}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedFacility.description}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Comments (Optional)</label>
                <Textarea
                  placeholder="Add any comments for the facility owner..."
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFacility(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApprovalAction(selectedFacility, 'rejected')}
                  disabled={approveFacilityMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprovalAction(selectedFacility, 'approved')}
                  disabled={approveFacilityMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
