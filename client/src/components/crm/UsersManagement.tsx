import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, UserPlus, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { 
  UserViewModal, 
  UserEditModal, 
  UserAddModal, 
  UserDeleteModal 
} from "./UserManagementModals";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UsersManagementProps {
  section: string;
  isAdmin: boolean;
}

export function UsersManagement({ section, isAdmin }: UsersManagementProps) {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('crm_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/admin/users', roleFilter],
    queryFn: async (): Promise<User[]> => {
      const url = `/api/admin/users${roleFilter !== 'all' ? `?role=${roleFilter}` : ''}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  // Filter users based on section
  const filteredUsers = users.filter(user => {
    switch (section) {
      case 'all-users':
        return true;
      case 'owners':
        return user.role === 'owner';
      case 'regular-users':
        return user.role === 'regular';
      default:
        return true;
    }
  });

  const getSectionTitle = () => {
    switch (section) {
      case 'all-users': return 'All Users';
      case 'owners': return 'Facility Owners';
      case 'regular-users': return 'Regular Users';
      default: return 'Users Management';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getSectionTitle()}</h2>
          <p className="text-sm text-gray-600">{filteredUsers.length} users found</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
                <SelectItem value="owner">Facility Owners</SelectItem>
                <SelectItem value="regular">Regular Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isAdmin && (
            <UserAddModal>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </UserAddModal>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Try adjusting your filters or add a new user</p>
            </div>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} data-testid={`card-user-${user.id}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900" data-testid={`text-username-${user.id}`}>
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500" data-testid={`text-email-${user.id}`}>
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        @{user.username} • Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        user.role === 'admin' ? 'default' : 
                        user.role === 'owner' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {user.role === 'regular' ? 'Regular User' : 
                       user.role === 'owner' ? 'Facility Owner' : 
                       'Administrator'}
                    </Badge>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="flex space-x-1">
                      <UserViewModal user={user}>
                        <Button variant="ghost" size="sm" data-testid={`button-view-${user.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </UserViewModal>
                      
                      {isAdmin && (
                        <>
                          <UserEditModal user={user}>
                            <Button variant="ghost" size="sm" data-testid={`button-edit-${user.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </UserEditModal>
                          
                          <UserDeleteModal user={user}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              data-testid={`button-delete-${user.id}`}
                              className="hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </UserDeleteModal>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}