import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Building, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Settings,
  LogOut,
  Home,
  ChevronDown,
  Menu,
  X
} from "lucide-react";

import UsersManagement from "@/components/crm/UsersManagement";
import FacilitiesManagement from "@/components/crm/FacilitiesManagement";
import { BookingsManagement, AnalyticsPanel, SettingsPanel } from "@/components/crm/OtherManagement";

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
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setLocation('/crm');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const isAdmin = user.role === 'admin';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      action: () => setActiveSection('dashboard')
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      dropdown: [
        { label: 'All Users', action: () => setActiveSection('all-users') },
        { label: 'Owners', action: () => setActiveSection('owners') },
        { label: 'Regular Users', action: () => setActiveSection('regular-users') }
      ]
    },
    {
      id: 'facilities',
      label: 'Facilities',
      icon: Building,
      dropdown: [
        { label: 'All Facilities', action: () => setActiveSection('all-facilities') },
        { label: 'Add Facility', action: () => setActiveSection('add-facility') }
      ]
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      action: () => setActiveSection('bookings')
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      action: () => setActiveSection('analytics')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => setActiveSection('settings')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">QuickCourt</h1>
              <p className="text-xs text-gray-500">CRM Panel</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.dropdown ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                        <ChevronDown className="ml-auto h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                      {item.dropdown.map((subItem, index) => (
                        <DropdownMenuItem key={index} onClick={subItem.action}>
                          {subItem.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start text-gray-700 hover:bg-purple-50 hover:text-purple-600 ${
                      activeSection === item.id ? 'bg-purple-50 text-purple-600' : ''
                    }`}
                    onClick={item.action}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                  {isAdmin ? 'Admin' : 'Owner'}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-16">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <Building className="h-6 w-6 text-purple-600 mr-2" />
                <h1 className="text-lg font-semibold text-gray-900">QuickCourt CRM</h1>
              </div>
              <div></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeSection === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
              
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
            </div>
          )}

          {/* Users Management Sections */}
          {(activeSection === 'all-users' || activeSection === 'owners' || activeSection === 'regular-users') && (
            <UsersManagement section={activeSection} isAdmin={isAdmin} />
          )}

          {/* Facilities Management Sections */}
          {(activeSection === 'all-facilities' || activeSection === 'add-facility') && (
            <FacilitiesManagement section={activeSection} isAdmin={isAdmin} />
          )}

          {/* Other sections */}
          {activeSection === 'bookings' && <BookingsManagement isAdmin={isAdmin} />}
          {activeSection === 'analytics' && <AnalyticsPanel isAdmin={isAdmin} />}
          {activeSection === 'settings' && <SettingsPanel isAdmin={isAdmin} />}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}