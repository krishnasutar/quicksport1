import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/hero-section";
import SportsCategory from "@/components/sports-category";
import VenueCard from "@/components/venue-card";
import FeatureSection from "@/components/feature-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const { data: facilitiesData, isLoading } = useQuery({
    queryKey: ['/api/facilities', { sport: selectedSport, city: selectedCity, page: 1, limit: 6 }],
    enabled: true,
  });

  const { data: sportsData } = useQuery({
    queryKey: ['/api/sports'],
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
      
      <SportsCategory onSportSelect={handleSportSelect} />
      
      {/* Quick Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 slide-in-up">Trusted by Athletes Everywhere</h2>
            <p className="text-xl text-gray-600">Join the growing community of sports enthusiasts</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center card-hover p-6 bg-gradient-to-br from-brand-indigo to-brand-purple rounded-2xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm md:text-base opacity-90">Sports Venues</div>
            </div>
            <div className="text-center card-hover p-6 bg-gradient-to-br from-brand-cyan to-brand-emerald rounded-2xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold mb-2">10K+</div>
              <div className="text-sm md:text-base opacity-90">Happy Athletes</div>
            </div>
            <div className="text-center card-hover p-6 bg-gradient-to-br from-brand-orange to-brand-yellow rounded-2xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold mb-2">25+</div>
              <div className="text-sm md:text-base opacity-90">Cities Covered</div>
            </div>
            <div className="text-center card-hover p-6 bg-gradient-to-br from-brand-purple to-pink-500 rounded-2xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold mb-2">50K+</div>
              <div className="text-sm md:text-base opacity-90">Bookings Made</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Venues Showcase */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 slide-in-up">Featured Sports Venues</h2>
            <p className="text-xl text-gray-600">Discover top-rated facilities handpicked for you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-hover bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                <img
                  src="https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="Basketball Court"
                  className="w-full h-full object-cover mix-blend-overlay"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white bg-opacity-90 text-blue-600 font-semibold">FEATURED</Badge>
                </div>
                <div className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-lg px-2 py-1">
                  <div className="flex items-center text-white text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    4.8
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Elite Sports Complex</h3>
                <p className="text-gray-600 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  Koramangala, Bangalore
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  <Badge variant="outline" className="text-xs">Basketball</Badge>
                  <Badge variant="outline" className="text-xs">Badminton</Badge>
                  <Badge variant="outline" className="text-xs">Table Tennis</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-brand-indigo">₹400</span>
                    <span className="text-gray-500">/hr</span>
                  </div>
                  <Button className="gradient-bg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="card-hover bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 relative">
                <img
                  src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="Football Field"
                  className="w-full h-full object-cover mix-blend-overlay"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white bg-opacity-90 text-green-600 font-semibold">HOT</Badge>
                </div>
                <div className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-lg px-2 py-1">
                  <div className="flex items-center text-white text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    4.6
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Champions Arena</h3>
                <p className="text-gray-600 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  Bandra West, Mumbai
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  <Badge variant="outline" className="text-xs">Football</Badge>
                  <Badge variant="outline" className="text-xs">Cricket</Badge>
                  <Badge variant="outline" className="text-xs">Tennis</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-brand-indigo">₹800</span>
                    <span className="text-gray-500">/hr</span>
                  </div>
                  <Button className="gradient-bg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="card-hover bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 relative">
                <img
                  src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="Badminton Court"
                  className="w-full h-full object-cover mix-blend-overlay"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white bg-opacity-90 text-purple-600 font-semibold">PREMIUM</Badge>
                </div>
                <div className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-lg px-2 py-1">
                  <div className="flex items-center text-white text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    4.9
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Racquet Club Premium</h3>
                <p className="text-gray-600 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  Anna Nagar, Chennai
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  <Badge variant="outline" className="text-xs">Badminton</Badge>
                  <Badge variant="outline" className="text-xs">Table Tennis</Badge>
                  <Badge variant="outline" className="text-xs">AC</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-brand-indigo">₹500</span>
                    <span className="text-gray-500">/hr</span>
                  </div>
                  <Button className="gradient-bg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg" className="gradient-bg text-lg px-8 py-4 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <Link href="/sports">
                <i className="fas fa-search mr-2"></i>
                Explore All Venues
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Popular Venues */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Venues</h2>
              <p className="text-xl text-gray-600">Top-rated sports facilities near you</p>
            </div>
            <Button variant="ghost" className="hidden md:block text-brand-indigo font-semibold hover:underline">
              View All
            </Button>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Sport type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="volleyball">Volleyball</SelectItem>
                  <SelectItem value="badminton">Badminton</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-200">Under ₹200</SelectItem>
                  <SelectItem value="200-500">₹200 - ₹500</SelectItem>
                  <SelectItem value="500+">Above ₹500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Venue Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="flex space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-10 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : facilitiesData?.length ? (
              facilitiesData.map((facility: any) => (
                <VenueCard key={facility.id} facility={facility} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl text-gray-300 mb-4">🏟️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No venues found</h3>
                <p className="text-gray-500">Try adjusting your search filters or check back later.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="ghost" className="text-brand-indigo font-semibold hover:underline">
              View All Venues
            </Button>
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
            <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-brand-indigo px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
