import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Plus, MapPin, Star, Calendar, Users, TrendingUp,
  Filter, MoreVertical, Edit, Trash2, Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Facility {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  status: string;
  rating: number;
  totalReviews: number;
  ownerId: string;
  images: string[];
  amenities: string[];
}

interface Court {
  id: string;
  facilityId: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  isAvailable: boolean;
}

interface FacilityWithCourts extends Facility {
  courts: Court[];
  totalRevenue?: number;
  totalBookings?: number;
}

export function FacilityManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Fetch facilities 
  const { data: facilitiesResponse, isLoading: facilitiesLoading } = useQuery<{facilities: FacilityWithCourts[], pagination: any}>({
    queryKey: ['/api/facilities'],
  });
  
  const facilities = facilitiesResponse?.facilities || [];

  // Fetch sports for categories
  const { data: sportsCategories = [] } = useQuery<{sport: string, count: number}[]>({
    queryKey: ['/api/sports'],
  });

  // Get unique cities from facilities
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(facilities.map(f => f.city))];
    return uniqueCities.sort();
  }, [facilities]);

  // Filter facilities based on search and filters
  const filteredFacilities = useMemo(() => {
    return facilities.filter(facility => {
      const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          facility.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity === "all" || facility.city === selectedCity;
      const matchesSport = selectedSport === "all" || 
                          facility.courts?.some(court => court.sportType === selectedSport);
      const matchesStatus = selectedStatus === "all" || facility.status === selectedStatus;
      
      return matchesSearch && matchesCity && matchesSport && matchesStatus;
    });
  }, [facilities, searchTerm, selectedCity, selectedSport, selectedStatus]);

  // Group facilities by sport category
  const facilitiesByCategory = useMemo(() => {
    const categories: { [key: string]: FacilityWithCourts[] } = {};
    
    sportsCategories.forEach(sport => {
      categories[sport.sport] = facilities.filter(facility => 
        facility.courts?.some(court => court.sportType === sport.sport)
      );
    });
    
    return categories;
  }, [facilities, sportsCategories]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (facilitiesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading facilities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Facility Management</h2>
          <p className="text-muted-foreground">
            Manage {facilities.length} facilities across {cities.length} cities
          </p>
        </div>
        <Button 
          className="gap-2"
          onClick={() => {
            // Navigate to add facility page by updating the URL
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('section', 'add-facility');
            window.history.pushState({}, '', currentUrl.toString());
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
        >
          <Plus className="h-4 w-4" />
          Add Facility
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search facilities by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {sportsCategories.map(sport => (
                  <SelectItem key={sport.sport} value={sport.sport}>
                    {sport.sport} ({sport.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Total Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{facilities.length}</div>
                <p className="text-sm text-muted-foreground">Across {cities.length} cities</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {facilities.filter(f => f.status === 'approved').length}
                </div>
                <p className="text-sm text-muted-foreground">Active facilities</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {facilities.filter(f => f.status === 'pending').length}
                </div>
                <p className="text-sm text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sports Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sportsCategories.length}</div>
                <p className="text-sm text-muted-foreground">Different sports</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Facilities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Facilities</CardTitle>
              <CardDescription>Latest facility additions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFacilities.slice(0, 5).map((facility) => (
                  <div key={facility.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {facility.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold">{facility.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {facility.city}, {facility.state}
                          <Star className="h-3 w-3 ml-2" />
                          {facility.rating} ({facility.totalReviews})
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(facility.status)}>
                        {facility.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((facility) => (
            <Card key={facility.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{facility.name}</CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {facility.city}, {facility.state}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(facility.status)}>
                    {facility.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{facility.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({facility.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Sports Available:</p>
                    <div className="flex flex-wrap gap-1">
                      {facility.courts?.map((court, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {court.sportType}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFacilities.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No facilities match your current filters.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCity("all");
                  setSelectedSport("all");
                  setSelectedStatus("all");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}