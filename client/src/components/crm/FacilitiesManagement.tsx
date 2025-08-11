import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Eye, Edit, Trash2, Plus, MapPin } from "lucide-react";

interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  status: string;
  rating: string;
  totalReviews: number;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface FacilitiesManagementProps {
  section: string;
  isAdmin: boolean;
}

export function FacilitiesManagement({ section, isAdmin }: FacilitiesManagementProps) {
  const getAuthHeaders = () => {
    const token = localStorage.getItem('crm_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: [isAdmin ? '/api/admin/facilities' : '/api/owner/facilities'],
    queryFn: async (): Promise<Facility[]> => {
      const endpoint = isAdmin ? '/api/admin/facilities' : '/api/owner/facilities';
      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch facilities');
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading facilities...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Facilities Management</h2>
        <Button 
          data-testid="button-add-facility"
          onClick={() => {
            // TODO: Implement add facility modal or redirect to add facility page
            alert('Add Facility functionality will be implemented');
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Facility
        </Button>
      </div>

      <div className="grid gap-4">
        {facilities.map((facility) => (
          <Card key={facility.id} data-testid={`card-facility-${facility.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900" data-testid={`text-facility-name-${facility.id}`}>
                      {facility.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span data-testid={`text-facility-address-${facility.id}`}>
                        {facility.address}, {facility.city}, {facility.state}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1" data-testid={`text-facility-owner-${facility.id}`}>
                      Owner: {facility.owner.firstName} {facility.owner.lastName}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={facility.status === 'approved' ? 'default' : facility.status === 'pending' ? 'secondary' : 'destructive'}>
                        {facility.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        ★ {parseFloat(facility.rating).toFixed(1)} ({facility.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" data-testid={`button-view-facility-${facility.id}`}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" data-testid={`button-edit-facility-${facility.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" data-testid={`button-delete-facility-${facility.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}