import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Search, Plus, MapPin, Star, MoreVertical, Edit, Trash2, Eye, 
  CheckCircle, XCircle, Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

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

interface FacilityManagementProps {
  onNavigateToAddFacility?: () => void;
}

export function FacilityManagement({ onNavigateToAddFacility }: FacilityManagementProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch facilities 
  const { data: facilitiesResponse, isLoading: facilitiesLoading, error: facilitiesError } = useQuery<{facilities: FacilityWithCourts[], pagination: any}>({
    queryKey: ['/api/facilities'],
  });
  
  // Log facility data for debugging
  React.useEffect(() => {
    if (facilitiesResponse) {
      console.log(`Loaded ${facilitiesResponse.facilities?.length || 0} facilities, total: ${facilitiesResponse.pagination?.total || 0}`);
    }
    if (facilitiesError) {
      console.error('Facilities loading error:', facilitiesError);
    }
  }, [facilitiesResponse, facilitiesError]);
  
  const facilities = facilitiesResponse?.facilities || [];

  // Fetch sports for categories
  const { data: sportsCategories = [] } = useQuery<{sport: string, count: number}[]>({
    queryKey: ['/api/sports'],
  });

  // Get unique cities from facilities
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(facilities.map(f => f.city)));
    return uniqueCities.sort();
  }, [facilities]);

  // Filter facilities based on search and filters
  const filteredFacilities = useMemo(() => {
    const filtered = facilities.filter(facility => {
      const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          facility.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity === "all" || facility.city === selectedCity;
      const matchesSport = selectedSport === "all" || 
                          facility.courts?.some(court => court.sportType === selectedSport);
      const matchesStatus = selectedStatus === "all" || facility.status === selectedStatus;
      
      const matches = matchesSearch && matchesCity && matchesSport && matchesStatus;
      
      // Debug logging
      if (!matches && facility.name) {
        console.log(`Facility ${facility.name} filtered out:`, {
          status: facility.status,
          selectedStatus,
          matchesStatus,
          matchesSearch,
          matchesCity,
          matchesSport
        });
      }
      
      return matches;
    });
    
    console.log(`Filtered ${filtered.length} facilities from ${facilities.length} total. Filter: status=${selectedStatus}`);
    return filtered;
  }, [facilities, searchTerm, selectedCity, selectedSport, selectedStatus]);

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ facilityId, status }: { facilityId: string; status: string }) => {
      const token = localStorage.getItem('crm_token');
      const response = await fetch(`/api/facilities/${facilityId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      console.log('Status updated successfully, clearing filter and invalidating cache');
      
      // FIRST: Clear the status filter to "all" 
      setSelectedStatus("all");
      
      // THEN: Invalidate the cache to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/facilities'] });
      
      toast({
        title: "Success",
        description: "Facility status updated successfully. Showing all facilities.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (facilityId: string, newStatus: string) => {
    updateStatusMutation.mutate({ facilityId, status: newStatus });
  };

  // Delete facility mutation
  const deleteFacilityMutation = useMutation({
    mutationFn: async (facilityId: string) => {
      const token = localStorage.getItem('crm_token');
      const response = await fetch(`/api/facilities/${facilityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to delete facility');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facilities'] });
      toast({
        title: "Success",
        description: "Facility deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete facility",
        variant: "destructive",
      });
    },
  });

  const handleDeleteFacility = (facilityId: string, facilityName: string) => {
    if (window.confirm(`Are you sure you want to delete "${facilityName}"? This action cannot be undone.`)) {
      deleteFacilityMutation.mutate(facilityId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': 
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      case 'pending': 
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'rejected': 
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default: 
        return <Badge variant="secondary">{status}</Badge>;
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Facilities</h2>
          <p className="text-muted-foreground">
            Manage all facilities with approval status controls
          </p>
        </div>
        <Button onClick={onNavigateToAddFacility} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by sport" />
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
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
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

      {/* Facilities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Facilities ({filteredFacilities.length})</CardTitle>
          <CardDescription>
            Click status dropdown to approve or decline facilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Sports</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFacilities.map((facility) => (
                <TableRow key={facility.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{facility.name}</div>
                      {facility.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {facility.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{facility.city}, {facility.state}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {facility.courts?.slice(0, 2).map((court, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {court.sportType}
                        </Badge>
                      )) || []}
                      {(facility.courts?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(facility.courts?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm">{facility.rating}</span>
                      <span className="text-xs text-muted-foreground">({facility.totalReviews})</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">
                      {facility.totalRevenue ? `₹${facility.totalRevenue.toLocaleString()}` : '₹0'}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8">
                          {getStatusBadge(facility.status)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(facility.id, 'approved')}
                          disabled={facility.status === 'approved'}
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(facility.id, 'pending')}
                          disabled={facility.status === 'pending'}
                        >
                          <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                          Mark Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(facility.id, 'rejected')}
                          disabled={facility.status === 'rejected'}
                        >
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  
                  <TableCell>
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
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteFacility(facility.id, facility.name)}
                          disabled={deleteFacilityMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleteFacilityMutation.isPending ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredFacilities.length === 0 && (
            <div className="py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No facilities found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or add a new facility.
              </p>
              <Button onClick={onNavigateToAddFacility}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Facility
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}