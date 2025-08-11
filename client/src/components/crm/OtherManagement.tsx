import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Settings, BarChart3, Calendar, DollarSign, Building } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";

interface OtherManagementProps {
  section: string;
  dashboardStats?: any;
  userRole?: 'admin' | 'owner';
}

export function OtherManagement({ section, dashboardStats, userRole }: OtherManagementProps) {
  const renderBookingsManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Calendar className="mx-auto h-12 w-12 mb-4" />
            <p>Bookings management functionality coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{dashboardStats?.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardStats?.totalBookings?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {userRole === 'admin' ? 'Total Facilities' : 'My Facilities'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardStats?.totalFacilities || '0'}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sports Available</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardStats?.sportsBreakdown?.length || '0'}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardStats?.monthlyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardStats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`₹${value}`, 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <p>No revenue data available yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sports Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Sports Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardStats?.sportsBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardStats.sportsBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sport" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`₹${value}`, 'Revenue']} />
                  <Bar 
                    dataKey="revenue" 
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <p>No sports data available yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Facility Performance Table */}
      {dashboardStats?.facilityPerformance?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {userRole === 'admin' ? 'Top Performing Facilities' : 'Facility Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.facilityPerformance.slice(0, 5).map((facility: any, index: number) => (
                <div key={facility.facilityId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{facility.facilityName}</h3>
                          <p className="text-sm text-gray-600">{facility.location}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="font-semibold text-gray-900">₹{facility.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Bookings</p>
                        <p className="font-semibold text-gray-900">{facility.totalBookings}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Rating</p>
                        <p className="font-semibold text-gray-900">{facility.avgRating.toFixed(1)}/5</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderEquipment = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Equipment Management</h2>
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Package className="mx-auto h-12 w-12 mb-4" />
            <p>Equipment management functionality coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Maintenance Management</h2>
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Settings className="mx-auto h-12 w-12 mb-4" />
            <p>Maintenance management functionality coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Configure general system settings</p>
            <Button data-testid="button-general-settings">Configure</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage payment configurations</p>
            <Button data-testid="button-payment-settings">Configure</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Configure system preferences</p>
            <Button data-testid="button-system-settings">Configure</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  switch (section) {
    case 'bookings':
      return renderBookingsManagement();
    case 'analytics':
      return renderAnalytics();
    case 'equipment':
      return renderEquipment();
    case 'maintenance':
      return renderMaintenance();
    case 'settings':
      return renderSettings();
    default:
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Management Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Manage equipment and inventory</p>
                <Button data-testid="button-inventory">Manage Inventory</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">View detailed analytics</p>
                <Button data-testid="button-analytics">View Analytics</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Configure system settings</p>
                <Button data-testid="button-settings">Open Settings</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
  }
}