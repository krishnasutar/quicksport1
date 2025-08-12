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
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Settings,
  LogOut,
  Home,
  ChevronDown,
  Menu,
  X,
  TrendingUp,
  Activity,
  MapPin,
  Star,
  Clock,
  Target
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

import { UsersManagement } from "@/components/crm/UsersManagement";
import { FacilityManagement } from "@/components/crm/FacilityManagement";
import { BookingsManagement } from "@/components/crm/BookingsManagement";
import { CompanyManagement } from "@/components/crm/CompanyManagement";
import { AddFacilityForm } from "@/components/crm/AddFacilityForm";
import { OtherManagement } from "@/components/crm/OtherManagement";

interface CRMUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'owner';
}

export default function CRMDashboard() {
  const [_, setLocation] = useLocation();
  const [user, setUser] = useState<CRMUser | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check URL params for section
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    if (sectionParam) {
      setActiveSection(sectionParam);
    }

    // Listen for URL changes to update section
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sectionParam = urlParams.get('section');
      if (sectionParam) {
        setActiveSection(sectionParam);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Also listen for custom events for immediate URL updates
    const handleURLChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sectionParam = urlParams.get('section');
      if (sectionParam && sectionParam !== activeSection) {
        setActiveSection(sectionParam);
      }
    };

    window.addEventListener('urlchange', handleURLChange);
    
    const crmToken = localStorage.getItem('crm_token');
    const crmUser = localStorage.getItem('crm_user');
    
    if (!crmToken || !crmUser) {
      setLocation('/crm');
      return;
    }
    
    setUser(JSON.parse(crmUser));

    // Cleanup listeners
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('urlchange', handleURLChange);
    };
  }, [setLocation, activeSection]);

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
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Analytics queries for admin users
  const { data: revenueAnalytics } = useQuery({
    queryKey: ['/api/admin/analytics/revenue'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/revenue', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch revenue analytics');
      return response.json();
    },
    enabled: !!user && user.role === 'admin',
    staleTime: 10 * 60 * 1000, // Keep data fresh for 10 minutes
    refetchOnWindowFocus: false,
  });

  const { data: facilityAnalytics } = useQuery({
    queryKey: ['/api/admin/analytics/facilities'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/facilities', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch facility analytics');
      return response.json();
    },
    enabled: !!user && user.role === 'admin',
    staleTime: 10 * 60 * 1000, // Keep data fresh for 10 minutes
    refetchOnWindowFocus: false,
  });

  const { data: bookingAnalytics } = useQuery({
    queryKey: ['/api/admin/analytics/bookings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/bookings', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch booking analytics');
      return response.json();
    },
    enabled: !!user && user.role === 'admin',
    staleTime: 10 * 60 * 1000, // Keep data fresh for 10 minutes
    refetchOnWindowFocus: false,
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
      action: () => setActiveSection('dashboard'),
      roles: ['admin', 'owner'] // Available to both admin and owner
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: Building,
      action: () => setActiveSection('companies'),
      roles: ['admin'] // Admin only
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      dropdown: [
        { label: 'All Users', action: () => setActiveSection('all-users') },
        { label: 'Owners', action: () => setActiveSection('owners') },
        { label: 'Regular Users', action: () => setActiveSection('regular-users') }
      ],
      roles: ['admin'] // Admin only
    },
    {
      id: 'facilities',
      label: 'Facilities',
      icon: Building2,
      action: () => setActiveSection('all-facilities'),
      roles: ['admin', 'owner'] // Available to both admin and owner
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      action: () => setActiveSection('bookings'),
      roles: ['admin', 'owner'] // Available to both admin and owner
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      action: () => setActiveSection('analytics'),
      roles: ['admin'] // Admin only
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => setActiveSection('settings'),
      roles: ['admin'] // Admin only
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0`}>
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
        <nav className="mt-8 px-4 h-full overflow-y-auto pb-24">
          <div className="space-y-2">
            {filteredMenuItems.map((item) => (
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
                  {user.first_name[0]}{user.last_name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user.first_name} {user.last_name}
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
      <div className="flex-1 lg:ml-64">
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
        <div className="p-6 max-h-screen overflow-y-auto">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isAdmin ? 'Platform Overview' : 'Your Business Dashboard'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {isAdmin ? 'Monitor all facilities and platform performance' : 'Track your facilities and earnings'}
                  </p>
                </div>
                <Badge variant="default" className="text-xs">Live Data</Badge>
              </div>
              
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {isAdmin ? 'Total Revenue' : 'Your Revenue'}
                    </CardTitle>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{revenueAnalytics?.ytdStats?.totalRevenue?.toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">This year</p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                </Card>

                <Card className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {isAdmin ? 'Total Facilities' : 'Your Facilities'}
                    </CardTitle>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.totalFacilities || 0}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Active</p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                </Card>

                <Card className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {revenueAnalytics?.ytdStats?.totalBookings || 0}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">This year</p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                </Card>

                {isAdmin && (
                  <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Platform Users</CardTitle>
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        {dashboardStats?.totalUsers || 0}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Registered</p>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                  </Card>
                )}
              </div>

              {/* Revenue Chart - Simplified */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Revenue Trend</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueAnalytics?.monthlyRevenue || []}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                          className="text-xs"
                        />
                        <YAxis 
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                          className="text-xs"
                        />
                        <Tooltip 
                          formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                          labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#059669" 
                          fill="url(#revenueGradient)" 
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Facilities Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-purple-600" />
                      <span>{isAdmin ? 'Top Facilities' : 'Your Facilities'}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveSection('all-facilities')}
                    >
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(facilityAnalytics?.facilityPerformance || []).slice(0, 5).map((facility: any, index: number) => (
                      <div key={facility.facilityId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{facility.facilityName}</p>
                            <p className="text-sm text-gray-500">{facility.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{facility.totalRevenue?.toLocaleString() || 0}</p>
                          <p className="text-xs text-gray-500">{facility.totalBookings || 0} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span>Recent Activity</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveSection('bookings')}
                    >
                      View All Bookings
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(bookingAnalytics?.peakTimes || []).slice(0, 4).map((time: any, index: number) => (
                      <div key={time.timeSlot} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="h-3 w-3 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Peak time: {time.timeSlot}</p>
                            <p className="text-xs text-gray-500">{time.bookingCount} bookings</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">₹{time.totalRevenue?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Company Management Section */}
          {activeSection === 'companies' && <CompanyManagement />}

          {/* Users Management Sections */}
          {(activeSection === 'all-users' || activeSection === 'owners' || activeSection === 'regular-users') && (
            <UsersManagement section={activeSection} isAdmin={isAdmin} />
          )}

          {/* Facilities Management Sections */}
          {activeSection === 'all-facilities' && (
            <FacilityManagement 
              onNavigateToAddFacility={() => setActiveSection('add-facility')} 
            />
          )}
          {activeSection === 'add-facility' && <AddFacilityForm />}

          {/* Bookings Management Section */}
          {activeSection === 'bookings' && <BookingsManagement />}
          
          {/* Other sections */}
          {activeSection === 'analytics' && <OtherManagement section={activeSection} />}
          {activeSection === 'settings' && <OtherManagement section={activeSection} />}
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