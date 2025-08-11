import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Eye, Edit, Calendar, BarChart3, Settings } from "lucide-react";

interface ManagementProps {
  isAdmin: boolean;
}

export function BookingsManagement({ isAdmin }: ManagementProps) {
  const getAuthHeaders = () => {
    const token = localStorage.getItem('crm_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const { data: bookings, isLoading } = useQuery({
    queryKey: [isAdmin ? '/api/admin/bookings' : '/api/owner/bookings'],
    queryFn: async () => {
      const endpoint = isAdmin ? '/api/admin/bookings' : '/api/owner/bookings';
      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading bookings...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bookings Management</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Bookings
          </CardTitle>
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
    </div>
  );
}

export function AnalyticsPanel({ isAdmin }: ManagementProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Analytics & Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Comprehensive analytics dashboard with charts, reports, and insights is being developed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingsPanel({ isAdmin }: ManagementProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isAdmin ? 'Platform Settings' : 'Account Settings'}
      </h2>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}