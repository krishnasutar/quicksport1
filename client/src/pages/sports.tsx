import { useState, useMemo } from "react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Clock, Filter } from "lucide-react";
import VenueCard from "@/components/venue-card";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

interface Facility {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
  email: string;
  status: string;
  rating: number;
  totalReviews: number;
  images: string[];
  amenities: string[];
  courts: Array<{
    id: string;
    name: string;
    sportType: string;
    pricePerHour: number;
    operatingHoursStart: string;
    operatingHoursEnd: string;
    isAvailable: boolean;
  }>;
  companyId: string;
  ownerId: string;
}

const availableSports = [
  { id: "basketball", name: "Basketball", icon: "🏀" },
  { id: "football", name: "Football", icon: "⚽" },
  { id: "tennis", name: "Tennis", icon: "🎾" },
  { id: "volleyball", name: "Volleyball", icon: "🏐" },
  { id: "badminton", name: "Badminton", icon: "🏸" },
  { id: "swimming", name: "Swimming", icon: "🏊" },
  { id: "table_tennis", name: "Table Tennis", icon: "🏓" },
  { id: "cricket", name: "Cricket", icon: "🏏" }
];

export default function Sports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1500]);

  // Fetch approved facilities from the backend
  const { data: facilitiesData, isLoading: facilitiesLoading } = useQuery<{facilities: Facility[]}>({
    queryKey: ['/api/facilities', { status: 'approved' }],
    queryFn: async () => {
      const response = await fetch('/api/facilities?status=approved');
      if (!response.ok) throw new Error('Failed to fetch facilities');
      const data = await response.json();
      console.log('Facilities API response:', data);
      // The API returns { facilities: [...] } format
      return data;
    },
  });

  // Fetch sports categories
  const { data: sportsData = [] } = useQuery<{sport: string, count: number}[]>({
    queryKey: ['/api/sports'],
  });

  const facilities = facilitiesData?.facilities || [];
  
  // Debug logging (can be removed once everything works)
  if (facilitiesData) {
    console.log('✅ Facilities loaded:', facilities.length, 'facilities');
  }

  // Dynamic price range based on actual facility prices
  const maxPrice = useMemo(() => {
    if (!Array.isArray(facilities) || facilities.length === 0) return 1500;
    const allPrices = facilities.flatMap(f => f.courts?.map(c => parseFloat(c.pricePerHour)) || []);
    return allPrices.length > 0 ? Math.max(...allPrices) : 1500;
  }, [facilities]);

  // Update price range when maxPrice changes
  React.useEffect(() => {
    if (maxPrice > 1500 && priceRange[1] === 1500) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, priceRange]);

  // Get unique cities from facilities, filtered and formatted
  const cities = useMemo(() => {
    if (!Array.isArray(facilities)) {
      console.warn('Facilities is not an array:', facilities);
      return [];
    }
    const uniqueCities = Array.from(new Set(facilities.map(f => f.city)))
      .filter(city => city && city.trim().length > 2 && !city.match(/^[a-z]{3,4}$/)) // Filter out invalid test data
      .map(city => {
        // Clean up city names - extract main city for areas
        if (city.includes(', ')) {
          const parts = city.split(', ');
          return parts[parts.length - 1]; // Take the main city (last part)
        }
        return city;
      })
      .filter((city, index, array) => array.indexOf(city) === index) // Remove duplicates after processing
      .sort();
    return uniqueCities;
  }, [facilities]);

  // Sports with counts from API
  const sports = useMemo(() => {
    return availableSports.map(sport => ({
      ...sport,
      count: sportsData.find(s => s.sport === sport.id)?.count || 0
    }));
  }, [sportsData]);

  // Categories (indoor/outdoor based on sports)
  const categories = useMemo(() => [
    { id: "all", name: "All Categories", count: Array.isArray(facilities) ? facilities.length : 0 },
    { id: "indoor", name: "Indoor", count: Array.isArray(facilities) ? facilities.filter(f => 
      f.courts?.some(c => ["basketball", "badminton", "table_tennis", "swimming"].includes(c.sportType))
    ).length : 0 },
    { id: "outdoor", name: "Outdoor", count: Array.isArray(facilities) ? facilities.filter(f => 
      f.courts?.some(c => ["football", "tennis", "volleyball", "cricket"].includes(c.sportType))
    ).length : 0 }
  ], [facilities]);

  // Time slots
  const timeSlots = [
    { id: "all", name: "Any Time" },
    { id: "morning", name: "Morning (6 AM - 12 PM)" },
    { id: "afternoon", name: "Afternoon (12 PM - 6 PM)" },
    { id: "evening", name: "Evening (6 PM - 10 PM)" }
  ];

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    if (!Array.isArray(facilities)) {
      console.warn('Cannot filter facilities - not an array:', facilities);
      return [];
    }
    return facilities.filter(facility => {
      const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          facility.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === "all" || facility.city === selectedCity;
      const matchesSport = selectedSport === "all" || 
                          facility.courts?.some(court => court.sportType === selectedSport);
      
      // Category filter (indoor/outdoor based on sports)
      const matchesCategory = selectedCategory === "all" || 
        (selectedCategory === "indoor" && facility.courts?.some(c => 
          ["basketball", "badminton", "table_tennis", "swimming"].includes(c.sportType)
        )) ||
        (selectedCategory === "outdoor" && facility.courts?.some(c => 
          ["football", "tennis", "volleyball", "cricket"].includes(c.sportType)
        ));

      // Price filter - check if facility has courts within the price range
      const matchesPrice = facility.courts?.some(court => {
        const price = parseFloat(court.pricePerHour);
        return price >= priceRange[0] && price <= priceRange[1];
      }) ?? false;

      // Time slot filter - for now, we'll match all facilities since we don't have specific operating hour logic
      const matchesTimeSlot = selectedTimeSlot === "all" || true; // All facilities available for all time slots

      return matchesSearch && matchesCity && matchesSport && matchesCategory && matchesPrice && matchesTimeSlot;
    });
  }, [facilities, searchQuery, selectedCity, selectedSport, selectedCategory, selectedTimeSlot, priceRange]);

  // Transform facility data for VenueCard component
  const transformedFacilities = useMemo(() => {
    if (!Array.isArray(filteredFacilities)) {
      return [];
    }
    return filteredFacilities.map(facility => ({
      id: facility.id,
      name: facility.name,
      city: facility.city,
      address: facility.address,
      images: (facility.images && facility.images.length > 0) ? facility.images : [
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      rating: facility.rating?.toString() || "4.5",
      status: "approved" as const,
      category: facility.courts?.some(c => ["basketball", "badminton", "table_tennis", "swimming"].includes(c.sportType)) ? "indoor" : "outdoor",
      sports: Array.from(new Set(facility.courts?.map(c => c.sportType) || [])),
      priceRange: {
        min: facility.courts && facility.courts.length > 0 ? Math.min(...facility.courts.map(c => parseFloat(c.pricePerHour))) : 0,
        max: facility.courts && facility.courts.length > 0 ? Math.max(...facility.courts.map(c => parseFloat(c.pricePerHour))) : 0
      },
      timeSlots: ["morning", "afternoon", "evening"], // Default slots
      amenities: facility.amenities || [],
      courts: facility.courts?.map(c => ({
        id: c.id,
        sportType: c.sportType,
        pricePerHour: parseFloat(c.pricePerHour)
      })) || [],
      minPrice: facility.courts && facility.courts.length > 0 ? Math.min(...facility.courts.map(c => parseFloat(c.pricePerHour))) : 0
    }));
  }, [filteredFacilities]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-indigo to-brand-purple py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Find Your Perfect Sports Venue
            </h1>
            <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
              Discover and book premium sports facilities across India. From basketball courts to swimming pools, find your next game spot.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-2 shadow-2xl flex">
                <Search className="h-6 w-6 text-gray-400 ml-4 mt-3" />
                <Input
                  type="text"
                  placeholder="Search venues, sports, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent text-gray-800 placeholder-gray-400 focus:ring-0 flex-1"
                />
                <Button className="bg-brand-indigo text-white hover:bg-brand-purple">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Filter className="h-5 w-5 text-brand-indigo" />
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left p-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? "bg-brand-indigo text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{category.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sport Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Sport</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedSport("all")}
                      className={`p-2 rounded-lg text-center transition-colors ${
                        selectedSport === "all"
                          ? "bg-brand-indigo text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="text-xs">All Sports</div>
                    </button>
                    {sports.map(sport => (
                      <button
                        key={sport.id}
                        onClick={() => setSelectedSport(sport.id)}
                        className={`p-2 rounded-lg text-center transition-colors ${
                          selectedSport === sport.id
                            ? "bg-brand-indigo text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="text-lg mb-1">{sport.icon}</div>
                        <div className="text-xs">{sport.name}</div>
                        <div className="text-xs opacity-75">({sport.count})</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* City Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">City</h4>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Slot Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Time Slot</h4>
                  <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(slot => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={maxPrice}
                      min={0}
                      step={50}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSport("all");
                    setSelectedCity("all");
                    setSelectedCategory("all");
                    setSelectedTimeSlot("all");
                    setPriceRange([0, maxPrice]);
                  }}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {facilitiesLoading ? "Loading..." : `${Array.isArray(filteredFacilities) ? filteredFacilities.length : 0} Venues Found`}
                </h2>
                <p className="text-gray-600">
                  {selectedSport !== "all" && `Filtered by ${sports.find(s => s.id === selectedSport)?.name || selectedSport}`}
                  {selectedCity !== "all" && ` in ${selectedCity}`}
                </p>
              </div>
            </div>

            {facilitiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (!Array.isArray(filteredFacilities) || filteredFacilities.length === 0) ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏟️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSport("all");
                    setSelectedCity("all");
                    setSelectedCategory("all");
                    setSelectedTimeSlot("all");
                    setPriceRange([0, maxPrice]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transformedFacilities.map((venue) => (
                  <VenueCard key={venue.id} facility={venue} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}