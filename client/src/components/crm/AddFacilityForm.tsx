import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Plus, X, Building2, MapPin, Phone, Mail, Star, 
  Camera, Users, Wifi, Car, ShowerHead, Coffee, Upload
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ui/ObjectUploader";
import type { UploadResult } from "@uppy/core";

interface Company {
  id: string;
  name: string;
  ownerId: string;
  ownerName?: string;
}

interface Court {
  name: string;
  sportType: string;
  pricePerHour: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  isAvailable: boolean;
}

const sportTypes = [
  "badminton", "tennis", "basketball", "football", "volleyball", 
  "swimming", "cricket", "table_tennis"
];

const amenityOptions = [
  { id: "parking", label: "Parking", icon: Car },
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "changing_rooms", label: "Changing Rooms", icon: Users },
  { id: "showers", label: "Showers", icon: ShowerHead },
  { id: "cafeteria", label: "Cafeteria", icon: Coffee },
  { id: "equipment_rental", label: "Equipment Rental", icon: Star },
];

interface AddFacilityFormProps {
  onCancel?: () => void;
}

export function AddFacilityForm({ onCancel }: AddFacilityFormProps = {}) {
  const [facilityData, setFacilityData] = useState({
    companyId: "",
    ownerId: "",
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phoneNumber: "",
    email: "",
    amenities: [] as string[],
    images: [] as string[]
  });

  const [courts, setCourts] = useState<Court[]>([]);
  const [newCourt, setNewCourt] = useState<Court>({
    name: "",
    sportType: "",
    pricePerHour: 0,
    operatingHoursStart: "06:00",
    operatingHoursEnd: "22:00",
    isAvailable: true
  });

  // Removed imageUrl state as we only support file uploads now

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user first to determine if we should fetch companies
  const currentUser = JSON.parse(localStorage.getItem('crm_user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  // Fetch companies for admins, or owner's company for owners
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const token = localStorage.getItem('crm_token');
      const endpoint = isAdmin ? '/api/companies' : '/api/owner/company';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();
      // For owners, wrap single company in array for consistency
      return isAdmin ? data : (data ? [data] : []);
    },
  });

  // Current user already defined above

  // For owners, find their company automatically
  const ownerCompany = companies.find(c => c.ownerId === currentUser.id);
  
  // Filter owner based on selected company
  const selectedCompany = companies.find(c => c.id === facilityData.companyId);

  // Create facility mutation
  const createFacilityMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('crm_token');
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create facility');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facilities'] });
      toast({
        title: "Success",
        description: "Facility created successfully!",
      });
      // Reset form
      setFacilityData({
        companyId: "",
        ownerId: "",
        name: "",
        description: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phoneNumber: "",
        email: "",
        amenities: [],
        images: []
      });
      setCourts([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create facility",
        variant: "destructive",
      });
    },
  });

  // Auto-select company and owner for owners, or owner when company is selected for admins
  useEffect(() => {
    if (!isAdmin && ownerCompany) {
      // For owners, automatically assign their company
      setFacilityData(prev => ({
        ...prev,
        companyId: ownerCompany.id,
        ownerId: ownerCompany.ownerId
      }));
    } else if (isAdmin && selectedCompany) {
      // For admins, set owner when company is selected
      setFacilityData(prev => ({
        ...prev,
        ownerId: selectedCompany.ownerId
      }));
    }
  }, [selectedCompany, ownerCompany, isAdmin]);

  const handleAddCourt = () => {
    if (!newCourt.name || !newCourt.sportType || !newCourt.pricePerHour) {
      toast({
        title: "Error",
        description: "Please fill all court details",
        variant: "destructive",
      });
      return;
    }

    setCourts([...courts, newCourt]);
    setNewCourt({
      name: "",
      sportType: "",
      pricePerHour: 0,
      operatingHoursStart: "06:00",
      operatingHoursEnd: "22:00",
      isAvailable: true
    });
  };

  const removeCourt = (index: number) => {
    setCourts(courts.filter((_, i) => i !== index));
  };

  // Removed handleAddImage as we only support file uploads now

  const removeImage = (index: number) => {
    setFacilityData({
      ...facilityData,
      images: facilityData.images.filter((_, i) => i !== index)
    });
  };

  // Upload functionality handlers
  const handleGetUploadParameters = async () => {
    const token = localStorage.getItem('crm_token');
    const response = await fetch('/api/facilities/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }
    
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    console.log('Upload completed:', result);
    
    // Add uploaded image URLs to facility data
    const uploadedUrls = (result.successful || []).map(file => file.uploadURL).filter(Boolean) as string[];
    setFacilityData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));
    
    toast({
      title: "Success",
      description: `${(result.successful || []).length} image(s) uploaded successfully!`,
    });
  };

  const toggleAmenity = (amenityId: string) => {
    const updatedAmenities = facilityData.amenities.includes(amenityId)
      ? facilityData.amenities.filter(a => a !== amenityId)
      : [...facilityData.amenities, amenityId];
    
    setFacilityData({
      ...facilityData,
      amenities: updatedAmenities
    });
  };

  const handleSubmit = () => {
    if (!facilityData.companyId || !facilityData.name || !facilityData.address || courts.length === 0) {
      toast({
        title: "Error",
        description: "Please fill required fields: Company, Name, Address, and at least one court",
        variant: "destructive",
      });
      return;
    }

    // FIXED: Auto-set owner ID from selected company if missing
    const selectedCompanyData = companies.find(c => c.id === facilityData.companyId);
    const finalOwnerId = facilityData.ownerId || selectedCompanyData?.ownerId;

    console.log('Validation check:', {
      companyId: facilityData.companyId,
      selectedCompany: selectedCompanyData,
      facilityOwnerId: facilityData.ownerId,
      finalOwnerId,
      companies
    });

    if (!finalOwnerId) {
      toast({
        title: "Error",
        description: !isAdmin 
          ? "You need to be assigned to a company before creating facilities. Please contact an administrator."
          : `Owner ID is missing. Company: ${selectedCompanyData?.name || 'none'}, Owner: ${selectedCompanyData?.ownerId || 'missing'}`,
        variant: "destructive",
      });
      return;
    }

    const facilityPayload = {
      ...facilityData,
      ownerId: finalOwnerId,
      courts: courts
    };

    console.log('Creating facility with payload:', facilityPayload);
    createFacilityMutation.mutate(facilityPayload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add New Facility</h2>
        <p className="text-muted-foreground">
          Create a new sports facility and assign it to a company
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              {isAdmin ? (
                <Select 
                  value={facilityData.companyId} 
                  onValueChange={(value) => setFacilityData({...facilityData, companyId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} - {company.ownerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-gray-50 border rounded-md">
                  <p className="text-sm font-medium">
                    {ownerCompany ? ownerCompany.name : 'No company assigned'}
                  </p>
                  {!ownerCompany && (
                    <p className="text-sm text-red-500 mt-1">
                      You need to be assigned to a company before creating facilities. Please contact an administrator.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                value={selectedCompany?.ownerName || "Select company first"}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Facility Name *</Label>
              <Input
                id="name"
                value={facilityData.name}
                onChange={(e) => setFacilityData({...facilityData, name: e.target.value})}
                placeholder="Enter facility name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={facilityData.description}
                onChange={(e) => setFacilityData({...facilityData, description: e.target.value})}
                placeholder="Describe the facility"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={facilityData.address}
                onChange={(e) => setFacilityData({...facilityData, address: e.target.value})}
                placeholder="Complete address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={facilityData.city}
                  onChange={(e) => setFacilityData({...facilityData, city: e.target.value})}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={facilityData.state}
                  onChange={(e) => setFacilityData({...facilityData, state: e.target.value})}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={facilityData.pincode}
                onChange={(e) => setFacilityData({...facilityData, pincode: e.target.value})}
                placeholder="123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={facilityData.phoneNumber}
                onChange={(e) => setFacilityData({...facilityData, phoneNumber: e.target.value})}
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={facilityData.email}
                onChange={(e) => setFacilityData({...facilityData, email: e.target.value})}
                placeholder="facility@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Courts Management */}
        <Card>
          <CardHeader>
            <CardTitle>Courts & Sports</CardTitle>
            <CardDescription>Add courts and their pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Court Form */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Add Court</h4>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Court name"
                  value={newCourt.name}
                  onChange={(e) => setNewCourt({...newCourt, name: e.target.value})}
                />
                <Select 
                  value={newCourt.sportType} 
                  onValueChange={(value) => setNewCourt({...newCourt, sportType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sport type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTypes.map(sport => (
                      <SelectItem key={sport} value={sport}>
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  type="number"
                  placeholder="Price per hour"
                  value={newCourt.pricePerHour || ""}
                  onChange={(e) => setNewCourt({...newCourt, pricePerHour: Number(e.target.value)})}
                />
                <Input
                  type="time"
                  placeholder="Start time"
                  value={newCourt.operatingHoursStart}
                  onChange={(e) => setNewCourt({...newCourt, operatingHoursStart: e.target.value})}
                />
                <Input
                  type="time"
                  placeholder="End time"
                  value={newCourt.operatingHoursEnd}
                  onChange={(e) => setNewCourt({...newCourt, operatingHoursEnd: e.target.value})}
                />
              </div>
              <Button onClick={handleAddCourt} size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Court
              </Button>
            </div>

            {/* Courts List */}
            <div className="space-y-2">
              {courts.map((court, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{court.name}</div>
                    <div className="text-sm text-gray-500">
                      {court.sportType} • ₹{court.pricePerHour}/hour • {court.operatingHoursStart}-{court.operatingHoursEnd}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCourt(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities & Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {amenityOptions.map(amenity => (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity.id}
                    checked={facilityData.amenities.includes(amenity.id)}
                    onCheckedChange={() => toggleAmenity(amenity.id)}
                  />
                  <label htmlFor={amenity.id} className="flex items-center gap-2 text-sm font-medium">
                    <amenity.icon className="h-4 w-4" />
                    {amenity.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Facility Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <ObjectUploader
                maxNumberOfFiles={5}
                maxFileSize={5242880} // 5MB
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </ObjectUploader>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {facilityData.images.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Facility ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel || (() => window.history.back())}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={createFacilityMutation.isPending}
          className="min-w-32"
        >
          {createFacilityMutation.isPending ? 'Creating...' : 'Create Facility'}
        </Button>
      </div>
    </div>
  );
}