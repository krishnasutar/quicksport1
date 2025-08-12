import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/hero-section";
import SportsCategory from "@/components/sports-category";
import VenueCard from "@/components/venue-card";
import FeatureSection from "@/components/feature-section";
import BookingSuccessPopup from "@/components/BookingSuccessPopup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Check for booking success parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('booking') === 'success') {
      setShowSuccessPopup(true);
      // Clean URL without refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location]);

  const { data: facilitiesData, isLoading } = useQuery({
    queryKey: ['/api/facilities', { page: 1, limit: 6 }],
    enabled: true,
  });

  const { data: sportsData } = useQuery({
    queryKey: ['/api/sports'],
    enabled: true,
  });

  const { data: trendingFacilities, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['/api/facilities/trending'],
    enabled: true,
  });

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
  };

  const testimonials = [
    {
      name: "Arjun Patel",
      title: "Basketball Player",
      rating: 5,
      comment: "QuickCourt made booking courts so easy! Split payments with my squad is a game-changer. Plus, the rewards are amazing!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    },
    {
      name: "Priya Sharma", 
      title: "College Student",
      rating: 5,
      comment: "Love how I can find courts near my campus and get student discounts automatically. The WhatsApp confirmations are super convenient!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e9ab02?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    },
    {
      name: "Rahul Kumar",
      title: "Software Engineer", 
      rating: 5,
      comment: "The booking process is so smooth and the courts are always as described. Great for organizing weekend matches with friends!",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <HeroSection />
      
      {/* What Makes Us Different - Key Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose QuickCourt?</h2>
            <p className="text-xl text-gray-600">Experience the future of sports booking</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-indigo to-brand-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-bolt text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Booking</h3>
              <p className="text-gray-600">Book courts in seconds with real-time availability. No waiting, no calling - just play!</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-emerald to-brand-cyan rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-users text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Split Payments</h3>
              <p className="text-gray-600">Share costs with friends instantly. No more awkward money collection!</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-gift text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rewards & Offers</h3>
              <p className="text-gray-600">Earn points on every booking. Get discounts, freebies, and exclusive deals!</p>
            </div>
          </div>
          
          {/* Trust Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brand-indigo mb-2">500+</div>
              <div className="text-sm md:text-base text-gray-600">Verified Venues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brand-indigo mb-2">10K+</div>
              <div className="text-sm md:text-base text-gray-600">Active Athletes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brand-indigo mb-2">25+</div>
              <div className="text-sm md:text-base text-gray-600">Cities Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brand-indigo mb-2">50K+</div>
              <div className="text-sm md:text-base text-gray-600">Successful Bookings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Sport Categories - Links to Sports Page */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse Sports Categories</h2>
            <p className="text-xl text-gray-600">Find venues for your favorite sport in seconds</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/sports?sport=basketball" className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm card-hover text-center transform transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-basketball-ball text-white text-2xl"></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Basketball</h3>
                <p className="text-sm text-gray-600">120+ Courts</p>
              </div>
            </Link>
            
            <Link href="/sports?sport=football" className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm card-hover text-center transform transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-futbol text-white text-2xl"></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Football</h3>
                <p className="text-sm text-gray-600">85+ Fields</p>
              </div>
            </Link>
            
            <Link href="/sports?sport=badminton" className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm card-hover text-center transform transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-table-tennis text-white text-2xl"></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Badminton</h3>
                <p className="text-sm text-gray-600">200+ Courts</p>
              </div>
            </Link>
            
            <Link href="/sports?sport=tennis" className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm card-hover text-center transform transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-table-tennis text-white text-2xl"></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Tennis</h3>
                <p className="text-sm text-gray-600">60+ Courts</p>
              </div>
            </Link>
            
            <Link href="/sports?sport=swimming" className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm card-hover text-center transform transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-swimmer text-white text-2xl"></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Swimming</h3>
                <p className="text-sm text-gray-600">40+ Pools</p>
              </div>
            </Link>
            
            <Link href="/sports?sport=cricket" className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm card-hover text-center transform transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-baseball-ball text-white text-2xl"></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Cricket</h3>
                <p className="text-sm text-gray-600">30+ Nets</p>
              </div>
            </Link>
            
            <Link href="/esports" className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm card-hover text-center transform transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-gamepad text-white text-2xl"></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">E-Sports</h3>
                <p className="text-sm text-gray-600">25+ Gaming Centers</p>
              </div>
            </Link>
            
            <Link href="/sports" className="group">
              <div className="bg-gradient-to-br from-brand-indigo to-brand-purple rounded-2xl p-6 shadow-sm card-hover text-center transform transition-all duration-300 group-hover:scale-105 text-white">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-plus text-white text-2xl"></i>
                </div>
                <h3 className="font-bold mb-2">View All</h3>
                <p className="text-sm opacity-90">500+ Venues</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Trending Venues This Week */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trending This Week</h2>
              <p className="text-xl text-gray-600">Most booked venues by athletes like you</p>
            </div>
            <Button asChild variant="ghost" className="hidden md:block text-brand-indigo font-semibold hover:underline">
              <Link href="/sports">View All</Link>
            </Button>
          </div>
          
          {/* Dynamic Trending Facilities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoadingTrending ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="flex space-x-2 mb-4">
                      <div className="w-16 h-6 bg-gray-200 rounded"></div>
                      <div className="w-16 h-6 bg-gray-200 rounded"></div>
                      <div className="w-16 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))
            ) : trendingFacilities && Array.isArray(trendingFacilities) && trendingFacilities.length > 0 ? (
              trendingFacilities.slice(0, 3).map((facility: any) => (
                <div key={facility.id} className="card-hover bg-white rounded-2xl shadow-sm overflow-hidden border">
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                    <img
                      src={facility.images && facility.images[0] 
                        ? facility.images[0] 
                        : "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                      }
                      alt={facility.name}
                      className="w-full h-full object-cover mix-blend-overlay"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge 
                        className={`text-white font-semibold ${
                          facility.badge === 'TRENDING' ? 'bg-red-500' : 
                          facility.badge === 'POPULAR' ? 'bg-orange-500' : 'bg-purple-500'
                        }`}
                      >
                        {facility.badge === 'TRENDING' ? '🔥 TRENDING' : 
                         facility.badge === 'POPULAR' ? '⚡ POPULAR' : '💎 PREMIUM'}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-lg px-2 py-1">
                      <div className="flex items-center text-white text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        {parseFloat(facility.rating || '0').toFixed(1)} ({facility.totalReviews} reviews)
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{facility.name}</h3>
                    <p className="text-gray-600 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {facility.address}, {facility.city}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {facility.amenities && facility.amenities.slice(0, 4).map((amenity: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs capitalize">
                          {amenity.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="text-2xl font-bold text-brand-indigo">
                          ₹{facility.priceRange.min === facility.priceRange.max 
                            ? facility.priceRange.min 
                            : `${facility.priceRange.min}-${facility.priceRange.max}`}
                        </span>
                        <span className="text-gray-500">/hr</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="text-green-600 font-medium">{facility.weeklyBookings} bookings</span> this week
                      </div>
                    </div>
                    <Button 
                      asChild 
                      className="w-full gradient-bg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <Link href={`/facilities/${facility.id}`}>
                        Book Now
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              // Fallback - show regular facilities instead
              facilitiesData?.facilities && Array.isArray(facilitiesData.facilities) ? (
                facilitiesData.facilities.slice(0, 3).map((facility: any) => (
                <div key={facility.id} className="card-hover bg-white rounded-2xl shadow-sm overflow-hidden border">
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                    <img
                      src={facility.images && facility.images[0] 
                        ? facility.images[0] 
                        : "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                      }
                      alt={facility.name}
                      className="w-full h-full object-cover mix-blend-overlay"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-purple-500 text-white font-semibold">💎 PREMIUM</Badge>
                    </div>
                    <div className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-lg px-2 py-1">
                      <div className="flex items-center text-white text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        {parseFloat(facility.rating || '0').toFixed(1)} ({facility.totalReviews || 0} reviews)
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{facility.name}</h3>
                    <p className="text-gray-600 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {facility.address}, {facility.city}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {facility.amenities && facility.amenities.slice(0, 4).map((amenity: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs capitalize">
                          {amenity.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="text-2xl font-bold text-brand-indigo">
                          ₹{facility.minPrice || 500}
                        </span>
                        <span className="text-gray-500">/hr</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="text-green-600 font-medium">Available now</span>
                      </div>
                    </div>
                    <Button 
                      asChild 
                      className="w-full gradient-bg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <Link href={`/facilities/${facility.id}`}>
                        Book Now
                      </Link>
                    </Button>
                  </div>
                </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">No facilities available at the moment.</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>


      
      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Book your perfect court in just 3 simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group card-hover p-6 bg-white rounded-2xl shadow-sm">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-brand-indigo to-brand-purple rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 pulse-glow">
                  <Search className="text-white h-12 w-12" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-white font-bold">1</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Courts</h3>
              <p className="text-gray-600 text-lg">Search and filter courts by sport, location, price, and ratings. Find the perfect match for your game!</p>
            </div>
            
            <div className="text-center group card-hover p-6 bg-white rounded-2xl shadow-sm">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-brand-cyan to-brand-emerald rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-calendar-alt text-white text-4xl"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-white font-bold">2</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Book & Pay</h3>
              <p className="text-gray-600 text-lg">Select your time slot and split payments with friends using UPI. Apply discounts and use your reward points!</p>
            </div>
            
            <div className="text-center group card-hover p-6 bg-white rounded-2xl shadow-sm">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-brand-orange to-red-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-play text-white text-4xl"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-white font-bold">3</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Play & Earn</h3>
              <p className="text-gray-600 text-lg">Get instant WhatsApp confirmation with directions. Play your game and earn reward points for future bookings!</p>
            </div>
          </div>
        </div>
      </section>
      
      <FeatureSection />
      
      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 slide-in-up">What Athletes Say</h2>
            <p className="text-xl text-gray-600">Join thousands of sports enthusiasts who love QuickCourt</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              const gradients = [
                'from-brand-indigo to-brand-purple',
                'from-brand-cyan to-brand-emerald', 
                'from-brand-orange to-red-500'
              ];
              
              return (
                <div key={index} className={`bg-gradient-to-br ${gradients[index]} p-6 rounded-2xl text-white transform hover:scale-105 transition-transform duration-300 card-hover shadow-xl`}>
                  <div className="flex items-center mb-4">
                    <div className="flex text-brand-yellow">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-lg mb-6 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover" 
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-200">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-brand-indigo via-brand-purple to-brand-cyan">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Play?</h2>
          <p className="text-xl text-gray-100 mb-8">Join thousands of athletes who have already discovered the easiest way to book sports courts.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild className="bg-white text-brand-indigo px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <Link href="/register">
                Get Started Today
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-brand-indigo px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 bg-transparent">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
      
      {/* Booking Success Popup */}
      <BookingSuccessPopup 
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
      />
    </div>
  );
}
