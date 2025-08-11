import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Clock, Filter } from "lucide-react";
import VenueCard from "@/components/venue-card";

interface DemoVenue {
  id: string;
  name: string;
  city: string;
  address: string;
  images: string[];
  rating: string;
  status: "approved";
  category: string;
  sports: string[];
  priceRange: { min: number; max: number };
  timeSlots: string[];
  amenities: string[];
  courts: Array<{ id: string; sportType: string; pricePerHour: number }>;
  minPrice: number;
}

// Demo data for sports venues
const demoVenues: DemoVenue[] = [
  {
    id: "1",
    name: "Elite Sports Complex",
    city: "Bangalore",
    address: "Koramangala, Bangalore",
    images: ["https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    rating: "4.8",
    status: "approved" as const,
    category: "indoor",
    sports: ["basketball", "badminton", "table_tennis"],
    priceRange: { min: 400, max: 800 },
    timeSlots: ["morning", "afternoon", "evening"],
    amenities: ["parking", "changing_room", "cafe"],
    courts: [
      { id: "1", sportType: "basketball", pricePerHour: 500 },
      { id: "2", sportType: "badminton", pricePerHour: 400 },
      { id: "3", sportType: "table_tennis", pricePerHour: 300 }
    ],
    minPrice: 300
  },
  {
    id: "2", 
    name: "Champions Outdoor Arena",
    city: "Mumbai",
    address: "Bandra West, Mumbai",
    images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    rating: "4.6",
    status: "approved" as const,
    category: "outdoor",
    sports: ["football", "cricket", "tennis"],
    priceRange: { min: 600, max: 1200 },
    timeSlots: ["morning", "evening"],
    amenities: ["parking", "floodlights", "equipment_rental"],
    courts: [
      { id: "4", sportType: "football", pricePerHour: 800 },
      { id: "5", sportType: "cricket", pricePerHour: 1000 },
      { id: "6", sportType: "tennis", pricePerHour: 600 }
    ],
    minPrice: 600
  },
  {
    id: "3",
    name: "AquaFit Swimming Center",
    city: "Delhi",
    address: "CP, New Delhi",
    images: ["https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    rating: "4.9",
    status: "approved" as const,
    category: "indoor",
    sports: ["swimming"],
    priceRange: { min: 200, max: 500 },
    timeSlots: ["morning", "afternoon", "evening"],
    amenities: ["changing_room", "lockers", "towel_service"],
    courts: [
      { id: "7", sportType: "swimming", pricePerHour: 300 }
    ],
    minPrice: 200
  },
  {
    id: "4",
    name: "Thunder Basketball Courts",
    city: "Pune",
    address: "Hinjewadi, Pune",
    images: ["https://images.unsplash.com/photo-1574891034519-d70a5200e1e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    rating: "4.7",
    status: "approved" as const,
    category: "outdoor",
    sports: ["basketball"],
    priceRange: { min: 300, max: 600 },
    timeSlots: ["morning", "evening"],
    amenities: ["parking", "water_fountain", "seating"],
    courts: [
      { id: "8", sportType: "basketball", pricePerHour: 400 }
    ],
    minPrice: 300
  },
  {
    id: "5",
    name: "Racquet Club Premium",
    city: "Chennai",
    address: "Anna Nagar, Chennai",
    images: ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    rating: "4.5",
    status: "approved" as const,
    category: "indoor",
    sports: ["badminton", "table_tennis"],
    priceRange: { min: 350, max: 700 },
    timeSlots: ["morning", "afternoon", "evening"],
    amenities: ["ac", "parking", "pro_shop"],
    courts: [
      { id: "9", sportType: "badminton", pricePerHour: 500 },
      { id: "10", sportType: "table_tennis", pricePerHour: 350 }
    ],
    minPrice: 350
  },
  {
    id: "6",
    name: "Volleyball Arena",
    city: "Hyderabad",
    address: "Gachibowli, Hyderabad",
    images: ["https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    rating: "4.4",
    status: "approved" as const,
    category: "outdoor",
    sports: ["volleyball"],
    priceRange: { min: 400, max: 800 },
    timeSlots: ["evening"],
    amenities: ["floodlights", "sand_court", "parking"],
    courts: [
      { id: "11", sportType: "volleyball", pricePerHour: 600 }
    ],
    minPrice: 400
  }
];

const categories = [
  { id: "all", name: "All Categories", count: demoVenues.length },
  { id: "indoor", name: "Indoor", count: demoVenues.filter(v => v.category === "indoor").length },
  { id: "outdoor", name: "Outdoor", count: demoVenues.filter(v => v.category === "outdoor").length }
];

const sports = [
  { id: "all", name: "All Sports", icon: "fas fa-dumbbell" },
  { id: "basketball", name: "Basketball", icon: "fas fa-basketball-ball" },
  { id: "football", name: "Football", icon: "fas fa-futbol" },
  { id: "badminton", name: "Badminton", icon: "fas fa-dumbbell" },
  { id: "cricket", name: "Cricket", icon: "fas fa-baseball-ball" },
  { id: "tennis", name: "Tennis", icon: "fas fa-table-tennis" },
  { id: "swimming", name: "Swimming", icon: "fas fa-swimmer" },
  { id: "volleyball", name: "Volleyball", icon: "fas fa-volleyball-ball" },
  { id: "table_tennis", name: "Table Tennis", icon: "fas fa-ping-pong-paddle-ball" }
];

const timeSlots = [
  { id: "all", name: "Any Time" },
  { id: "morning", name: "Morning (6 AM - 12 PM)" },
  { id: "afternoon", name: "Afternoon (12 PM - 6 PM)" },
  { id: "evening", name: "Evening (6 PM - 12 AM)" }
];

export default function SportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [sortBy, setSortBy] = useState("rating");

  const filteredVenues = useMemo(() => {
    let filtered = demoVenues.filter(venue => {
      // Search filter
      if (searchQuery && !venue.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !venue.city.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && venue.category !== selectedCategory) {
        return false;
      }

      // Sport filter
      if (selectedSport !== "all" && !venue.sports.includes(selectedSport)) {
        return false;
      }

      // Time slot filter
      if (selectedTimeSlot !== "all" && !venue.timeSlots.includes(selectedTimeSlot)) {
        return false;
      }

      // Price filter
      if (venue.minPrice < priceRange[0] || venue.minPrice > priceRange[1]) {
        return false;
      }

      return true;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_low_high":
          return a.minPrice - b.minPrice;
        case "price_high_low":
          return b.minPrice - a.minPrice;
        case "rating":
          return parseFloat(b.rating) - parseFloat(a.rating);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedSport, selectedTimeSlot, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 slide-in-up">
              Find Your Perfect <span className="text-brand-yellow">Sports Venue</span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Discover indoor and outdoor sports facilities across India. Book instantly and play today!
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative glass-effect rounded-2xl p-2">
              <div className="flex items-center space-x-2">
                <Search className="text-white h-5 w-5 ml-4" />
                <Input
                  placeholder="Search by venue name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent text-white placeholder-gray-300 focus:ring-0"
                />
                <Button className="bg-white text-brand-indigo hover:bg-gray-100">
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
                        <i className={`${sport.icon} mb-1 text-sm`}></i>
                        <div className="text-xs">{sport.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Time Preference</h4>
                  <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                    <SelectTrigger>
                      <SelectValue />
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
                      max={1500}
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
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sports Venues ({filteredVenues.length})
                </h2>
                <p className="text-gray-600">
                  {searchQuery && `Results for "${searchQuery}"`}
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                    <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== "all" || selectedSport !== "all" || selectedTimeSlot !== "all") && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="ml-2 text-gray-600 hover:text-gray-900"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedSport !== "all" && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {sports.find(s => s.id === selectedSport)?.name}
                    <button
                      onClick={() => setSelectedSport("all")}
                      className="ml-2 text-gray-600 hover:text-gray-900"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedTimeSlot !== "all" && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {timeSlots.find(t => t.id === selectedTimeSlot)?.name}
                    <button
                      onClick={() => setSelectedTimeSlot("all")}
                      className="ml-2 text-gray-600 hover:text-gray-900"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Venue Grid */}
            {filteredVenues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVenues.map(venue => (
                  <Card key={venue.id} className="overflow-hidden card-hover shadow-sm border-0">
                    <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${venue.images[0]})` }}>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white bg-opacity-90 text-brand-indigo">
                          {venue.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4 flex items-center bg-black bg-opacity-60 rounded-lg px-2 py-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-white text-sm">{venue.rating}</span>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{venue.name}</h3>
                      <p className="text-gray-600 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 text-brand-indigo mr-2" />
                        {venue.city}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {venue.sports.slice(0, 3).map(sport => (
                          <Badge key={sport} variant="outline" className="text-xs">
                            {sport.replace('_', ' ')}
                          </Badge>
                        ))}
                        {venue.sports.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{venue.sports.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">₹{venue.minPrice}</span>
                          <span className="text-gray-500">/hour</span>
                        </div>
                        <Button className="gradient-bg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedSport("all");
                    setSelectedTimeSlot("all");
                    setPriceRange([0, 1500]);
                    setSearchQuery("");
                  }}
                  className="gradient-bg"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}