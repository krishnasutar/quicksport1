import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Settings, BarChart3, Calendar, DollarSign } from "lucide-react";

interface OtherManagementProps {
  section: string;
}

export function OtherManagement({ section }: OtherManagementProps) {
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
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <BarChart3 className="mx-auto h-12 w-12 mb-4" />
            <p>Analytics dashboard coming soon</p>
          </div>
        </CardContent>
      </Card>
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