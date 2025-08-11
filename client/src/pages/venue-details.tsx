import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Star, Phone, Mail, Clock, Wifi, Car, Coffee, Users } from "lucide-react";

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

const amenityIcons: Record<string, any> = {
  parking: Car,
  wifi: Wifi,
  cafeteria: Coffee,
  lockers: Users,
};

export default function VenueDetails() {
  const params = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: facility, isLoading } = useQuery({
    queryKey: [`/api/facilities/${params.id}`],
    enabled: !!params.id,
  });

  const { data: reviews } = useQuery({
    queryKey: [`/api/reviews/${params.id}`],
    enabled: !!params.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="text-6xl text-gray-300 mb-4">🏟️</div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Facility Not Found</h1>
          <p className="text-gray-500 mb-6">The facility you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = facility.images || ['https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'];
  const courts = facility.courts || [];
  const facilityReviews = reviews || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-96 rounded-2xl overflow-hidden mb-4">
            <img
              src={images[selectedImageIndex]}
              alt={facility.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-brand-indigo text-white">Featured</Badge>
            </div>
          </div>
          
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-brand-indigo' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {facility.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-brand-indigo mr-1" />
                      {facility.address}, {facility.city}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-brand-yellow fill-current mr-1" />
                      {parseFloat(facility.rating || "0").toFixed(1)} ({facility.totalReviews} reviews)
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed">
                {facility.description || "A premium sports facility offering world-class amenities and courts for various sports."}
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facility.phoneNumber && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-brand-indigo mr-3" />
                    <span>{facility.phoneNumber}</span>
                  </div>
                )}
                {facility.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-brand-indigo mr-3" />
                    <span>{facility.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {facility.amenities && facility.amenities.length > 0 && (
              <div className="bg-white rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {facility.amenities.map((amenity) => {
                    const IconComponent = amenityIcons[amenity.toLowerCase()] || Users;
                    return (
                      <div key={amenity} className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5 text-brand-indigo" />
                        <span className="capitalize">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courts */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Available Courts</h3>
              {courts.length > 0 ? (
                <div className="space-y-4">
                  {courts.map((court) => {
                    const sportInfo = sportIcons[court.sportType] || sportIcons.basketball;
                    return (
                      <div key={court.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sportInfo.color}`}>
                              <i className={`${sportInfo.icon} text-sm`}></i>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{court.name}</h4>
                              <p className="text-sm text-gray-500 capitalize">{court.sportType.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              ₹{parseFloat(court.pricePerHour).toFixed(0)}
                            </div>
                            <div className="text-sm text-gray-500">per hour</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {court.operatingHoursStart} - {court.operatingHoursEnd}
                          </div>
                        </div>
                        
                        {court.description && (
                          <p className="text-gray-600 text-sm mb-3">{court.description}</p>
                        )}
                        
                        <Button asChild className="w-full gradient-bg">
                          <Link href={`/booking/${court.id}`}>
                            Book This Court
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No courts available at this facility.</p>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reviews</h3>
              {facilityReviews.length > 0 ? (
                <div className="space-y-4">
                  {facilityReviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-brand-indigo rounded-full flex items-center justify-center text-white font-semibold">
                          {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{review.user?.firstName} {review.user?.lastName}</span>
                            <div className="flex text-brand-yellow">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Booking</h3>
                  <p className="text-gray-600 mb-4">Select a court to start booking</p>
                  
                  {courts.length > 0 ? (
                    <div className="space-y-3">
                      {courts.slice(0, 3).map((court) => {
                        const sportInfo = sportIcons[court.sportType] || sportIcons.basketball;
                        return (
                          <Button
                            key={court.id}
                            variant="outline"
                            className="w-full justify-start h-auto p-3"
                            asChild
                          >
                            <Link href={`/booking/${court.id}`}>
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sportInfo.color}`}>
                                  <i className={`${sportInfo.icon} text-xs`}></i>
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">{court.name}</div>
                                  <div className="text-sm text-gray-500">₹{parseFloat(court.pricePerHour).toFixed(0)}/hr</div>
                                </div>
                              </div>
                            </Link>
                          </Button>
                        );
                      })}
                      {courts.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">+{courts.length - 3} more courts</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No courts available</p>
                  )}
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-brand-yellow fill-current mr-1" />
                        <span className="font-medium">{parseFloat(facility.rating || "0").toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Reviews</span>
                      <span className="font-medium">{facility.totalReviews}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
