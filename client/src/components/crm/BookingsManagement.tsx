import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Clock, CheckCircle, XCircle, Calendar, DollarSign, User, MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingBooking {
  id: string;
  userId: string;
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  finalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  courtName: string;
  facilityName: string;
  facilityCity: string;
  userName: string;
  userEmail: string;
}

interface Booking {
  id: string;
  userId: string;
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  finalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  courtName: string;
  facilityName: string;
  facilityCity: string;
  userName: string;
  userEmail: string;
}

export function BookingsManagement() {
  const [activeTab, setActiveTab] = useState("pending");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user to determine endpoint
  const currentUser = JSON.parse(localStorage.getItem('crm_user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  // Fetch pending bookings for approval
  const { data: pendingBookingsData, isLoading: pendingBookingsLoading } = useQuery<{bookings: PendingBooking[], total: number}>({
    queryKey: ['/api/admin/bookings/pending'],
    queryFn: async () => {
      const token = localStorage.getItem('crm_token');
      const response = await fetch('/api/admin/bookings/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch pending bookings');
      return response.json();
    },
    staleTime: 0,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  // Fetch all bookings (confirmed, cancelled, etc.)
  const { data: allBookingsData, isLoading: allBookingsLoading } = useQuery<{bookings: Booking[], total: number}>({
    queryKey: [isAdmin ? '/api/admin/bookings' : '/api/owner/bookings'],
    queryFn: async () => {
      const token = localStorage.getItem('crm_token');
      const endpoint = isAdmin ? '/api/admin/bookings' : '/api/owner/bookings';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    staleTime: 0,
  });

  const pendingBookings = pendingBookingsData?.bookings || [];
  const allBookings = allBookingsData?.bookings || [];

  // Booking approval/rejection mutations
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: 'confirmed' | 'rejected' }) => {
      const token = localStorage.getItem('crm_token');
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update booking status');
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] }); // Refresh user's booking data
      toast({
        title: "Success",
        description: `Booking ${variables.status === 'confirmed' ? 'approved' : 'rejected'} successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status",
        variant: "destructive",
      });
    },
  });

  const handleBookingAction = (bookingId: string, action: 'approve' | 'reject') => {
    const status = action === 'approve' ? 'confirmed' : 'rejected';
    updateBookingStatusMutation.mutate({ bookingId, status });
  };

  const formatBookingDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBookingTime = (time: string) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground">
            Manage booking requests and view all bookings
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Approvals
            {pendingBookings.length > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                {pendingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            All Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Bookings Approval
                <Badge className="bg-yellow-100 text-yellow-800">
                  {pendingBookings.length} pending
                </Badge>
              </CardTitle>
              <CardDescription>
                Approve or reject booking requests from customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingBookingsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-lg">Loading pending bookings...</div>
                </div>
              ) : pendingBookings.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending bookings</h3>
                  <p className="text-muted-foreground">
                    All booking requests have been processed. New bookings will appear here for approval.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Facility & Court</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.userName}</div>
                            <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.facilityName}</div>
                            <div className="text-sm text-muted-foreground">{booking.courtName}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {booking.facilityCity}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatBookingDate(booking.bookingDate)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatBookingTime(booking.startTime)} - {formatBookingTime(booking.endTime)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">₹{booking.finalAmount}</div>
                            {booking.totalAmount !== booking.finalAmount && (
                              <div className="text-sm text-muted-foreground line-through">₹{booking.totalAmount}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {booking.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleBookingAction(booking.id, 'approve')}
                              disabled={updateBookingStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBookingAction(booking.id, 'reject')}
                              disabled={updateBookingStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All Bookings
                <Badge variant="outline">
                  {allBookings.length} total
                </Badge>
              </CardTitle>
              <CardDescription>
                View all bookings across your facilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allBookingsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-lg">Loading bookings...</div>
                </div>
              ) : allBookings.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground">
                    Bookings will appear here once customers start making reservations.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Facility & Court</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.userName}</div>
                            <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.facilityName}</div>
                            <div className="text-sm text-muted-foreground">{booking.courtName}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {booking.facilityCity}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatBookingDate(booking.bookingDate)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatBookingTime(booking.startTime)} - {formatBookingTime(booking.endTime)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">₹{booking.finalAmount}</div>
                            {booking.totalAmount !== booking.finalAmount && (
                              <div className="text-sm text-muted-foreground line-through">₹{booking.totalAmount}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {booking.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}