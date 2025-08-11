import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Star } from "lucide-react";
import { Link } from "wouter";
import { Facility } from "@shared/schema";

interface VenueCardProps {
  facility: {
    id: string;
    name: string;
    city: string;
    address: string;
    images: string[];
    rating: string;
    status: "approved" | "pending" | "rejected";
    category: string;
    sports: string[];
    priceRange: { min: number; max: number };
    timeSlots: string[];
    amenities: string[];
    courts: Array<{
      id: string;
      sportType: string;
      pricePerHour: number;
    }>;
    minPrice: number;
  };
}

const sportIcons: Record<string, { icon: string; color: string }> = {
  basketball: { icon: 'fas fa-basketball-ball', color: 'bg-orange-100 text-orange-500' },
  football: { icon: 'fas fa-futbol', color: 'bg-green-100 text-green-500' },
  tennis: { icon: 'fas fa-table-tennis', color: 'bg-blue-100 text-blue-500' },
  volleyball: { icon: 'fas fa-volleyball-ball', color: 'bg-purple-100 text-purple-500' },
  badminton: { icon: 'fas fa-dumbbell', color: 'bg-red-100 text-red-500' },
  swimming: { icon: 'fas fa-swimmer', color: 'bg-cyan-100 text-cyan-500' },
  cricket: { icon: 'fas fa-baseball-ball', color: 'bg-yellow-100 text-yellow-600' },
  table_tennis: { icon: 'fas fa-ping-pong-paddle-ball', color: 'bg-indigo-100 text-indigo-500' },
};

export default function VenueCard({ facility }: VenueCardProps) {
  const mainImage = facility.images?.[0] || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';
  const uniqueSports = Array.from(new Set(facility.courts?.map(court => court.sportType) || []));
  const displaySports = uniqueSports.slice(0, 3);
  const remainingSports = uniqueSports.length - displaySports.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer card-hover">
      <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${mainImage})` }}>
        <div className="absolute top-4 left-4">
          {facility.status === 'approved' && (
            <Badge className="bg-white bg-opacity-90 text-brand-indigo">Featured</Badge>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <button className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
          </button>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-indigo transition-colors line-clamp-1">
            {facility.name}
          </h3>
          <div className="flex items-center text-brand-yellow">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-gray-700 text-sm ml-1">
              {parseFloat(facility.rating || "0").toFixed(1)}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-3 flex items-center">
          <MapPin className="h-4 w-4 text-brand-indigo mr-2" />
          {facility.city}
        </p>
        
        <div className="flex items-center space-x-2 mb-4">
          {displaySports.map((sport) => {
            const sportInfo = sportIcons[sport] || sportIcons.basketball;
            return (
              <div
                key={sport}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${sportInfo.color}`}
              >
                <i className={`${sportInfo.icon} text-xs`}></i>
              </div>
            );
          })}
          {remainingSports > 0 && (
            <span className="text-sm text-gray-500">+{remainingSports} more</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ₹{facility.minPrice || 200}
            </span>
            <span className="text-gray-500">/hour</span>
          </div>
          <Button asChild className="gradient-bg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            <Link href={`/venue/${encodeURIComponent(facility.id)}`}>
              Book Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
