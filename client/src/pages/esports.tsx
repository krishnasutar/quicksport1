import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Clock, Filter, Gamepad2, Users, Wifi } from "lucide-react";
import { Link } from "wouter";

// Demo data for esports venues
const demoEsportsVenues = [
  {
    id: "e1",
    name: "GameZone Pro Gaming Lounge",
    city: "Bangalore",
    address: "Brigade Road, Bangalore",
    images: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    rating: "4.9",
    status: "approved" as const,
    category: "gaming_lounge",
    games: ["valorant", "cs2", "dota2", "lol", "pubg", "fifa"],
    priceRange: { min: 100, max: 300 },
    timeSlots: ["morning", "afternoon", "evening", "night"],
    amenities: ["high_end_pcs", "mechanical_keyboards", "gaming_headsets", "air_conditioning", "snacks"],
    specs: {
      gpuType: "RTX 4080",
      cpuType: "Intel i7-13700K",
      ram: "32GB DDR5",
      monitor: "240Hz Gaming Monitors"
    },
    pricePerHour: 150,
    minPrice: 100
  },
  {
    id: "e2",
    name: "Esports Arena Mumbai",
    city: "Mumbai",
    address: "Andheri West, Mumbai",
    images: ["https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    rating: "4.7",
    status: "approved" as const,
    category: "tournament_center",
    games: ["valorant", "cs2", "apex", "overwatch", "rocket_league"],
    priceRange: { min: 200, max: 500 },
    timeSlots: ["afternoon", "evening"],
    amenities: ["tournament_setup", "streaming_equipment", "professional_lighting", "commentary_booth"],
    specs: {
      gpuType: "RTX 4090",
      cpuType: "Intel i9-13900K",
      ram: "64GB DDR5",
      monitor: "360Hz Pro Monitors"
    },
    pricePerHour: 250,
    minPrice: 200
  },
  {
    id: "e3",
    name: "CyberCafe Elite",
    city: "Delhi",
    address: "Connaught Place, Delhi",
    images: ["https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    rating: "4.5",
    status: "approved" as const,
    category: "cybercafe",
    games: ["pubg", "fifa", "gta", "minecraft", "fortnite"],
    priceRange: { min: 50, max: 150 },
    timeSlots: ["morning", "afternoon", "evening", "night"],
    amenities: ["budget_friendly", "student_discounts", "group_packages", "snacks"],
    specs: {
      gpuType: "RTX 3060",
      cpuType: "Intel i5-12400",
      ram: "16GB DDR4",
      monitor: "144Hz Monitors"
    },
    pricePerHour: 80,
    minPrice: 50
  },
  {
    id: "e4",
    name: "VR Gaming Hub",
    city: "Pune",
    address: "Koregaon Park, Pune",
    images: ["https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    rating: "4.8",
    status: "approved" as const,
    category: "vr_center",
    games: ["vr_gaming", "beat_saber", "half_life_alyx", "vrchat"],
    priceRange: { min: 300, max: 600 },
    timeSlots: ["afternoon", "evening"],
    amenities: ["vr_headsets", "motion_tracking", "private_rooms", "sanitization"],
    specs: {
      gpuType: "RTX 4070",
      cpuType: "Intel i7-12700K",
      ram: "32GB DDR4",
      monitor: "VR Headsets & 4K Displays"
    },
    pricePerHour: 400,
    minPrice: 300
  },
  {
    id: "e5",
    name: "Console Gaming Paradise",
    city: "Chennai",
    address: "T. Nagar, Chennai",
    images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    rating: "4.6",
    status: "approved" as const,
    category: "console_center",
    games: ["ps5_games", "xbox_games", "fifa", "cod", "tekken"],
    priceRange: { min: 120, max: 250 },
    timeSlots: ["morning", "afternoon", "evening"],
    amenities: ["ps5_consoles", "xbox_series_x", "4k_tvs", "surround_sound"],
    specs: {
      gpuType: "PS5 & Xbox Series X",
      cpuType: "Console Gaming",
      ram: "Console Specs",
      monitor: "4K Gaming TVs"
    },
    pricePerHour: 180,
    minPrice: 120
  }
];

const categories = [
  { id: "all", name: "All Categories", count: demoEsportsVenues.length },
  { id: "gaming_lounge", name: "Gaming Lounge", count: demoEsportsVenues.filter(v => v.category === "gaming_lounge").length },
  { id: "tournament_center", name: "Tournament Center", count: demoEsportsVenues.filter(v => v.category === "tournament_center").length },
  { id: "cybercafe", name: "Cyber Cafe", count: demoEsportsVenues.filter(v => v.category === "cybercafe").length },
  { id: "vr_center", name: "VR Center", count: demoEsportsVenues.filter(v => v.category === "vr_center").length },
  { id: "console_center", name: "Console Center", count: demoEsportsVenues.filter(v => v.category === "console_center").length }
];

const games = [
  { id: "all", name: "All Games", icon: "fas fa-gamepad" },
  { id: "valorant", name: "Valorant", icon: "fas fa-crosshairs" },
  { id: "cs2", name: "CS2", icon: "fas fa-bullseye" },
  { id: "dota2", name: "Dota 2", icon: "fas fa-shield-alt" },
  { id: "lol", name: "League of Legends", icon: "fas fa-crown" },
  { id: "pubg", name: "PUBG", icon: "fas fa-parachute-box" },
  { id: "fifa", name: "FIFA", icon: "fas fa-futbol" },
  { id: "apex", name: "Apex Legends", icon: "fas fa-mountain" },
  { id: "overwatch", name: "Overwatch", icon: "fas fa-eye" },
  { id: "rocket_league", name: "Rocket League", icon: "fas fa-rocket" },
  { id: "fortnite", name: "Fortnite", icon: "fas fa-hammer" },
  { id: "vr_gaming", name: "VR Games", icon: "fas fa-vr-cardboard" }
];

const timeSlots = [
  { id: "all", name: "Any Time" },
  { id: "morning", name: "Morning (9 AM - 1 PM)" },
  { id: "afternoon", name: "Afternoon (1 PM - 6 PM)" },
  { id: "evening", name: "Evening (6 PM - 11 PM)" },
  { id: "night", name: "Night (11 PM - 2 AM)" }
];

export default function EsportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 600]);
  const [sortBy, setSortBy] = useState("rating");

  const filteredVenues = useMemo(() => {
    let filtered = demoEsportsVenues.filter(venue => {
      // Search filter
      if (searchQuery && !venue.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !venue.city.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && venue.category !== selectedCategory) {
        return false;
      }

      // Game filter
      if (selectedGame !== "all" && !venue.games.includes(selectedGame)) {
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
  }, [searchQuery, selectedCategory, selectedGame, selectedTimeSlot, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 slide-in-up">
              Level Up Your <span className="text-yellow-300">Gaming Experience</span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Discover premium gaming lounges, tournament centers, and VR experiences across India. Game on!
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative glass-effect rounded-2xl p-2">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="text-white h-5 w-5 ml-4" />
                <Input
                  placeholder="Search gaming venues or cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent text-white placeholder-gray-300 focus:ring-0"
                />
                <Button className="bg-white text-purple-600 hover:bg-gray-100">
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
                  <Filter className="h-5 w-5 text-purple-600" />
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
                            ? "bg-purple-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{category.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Game Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Games</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {games.slice(0, 8).map(game => (
                      <button
                        key={game.id}
                        onClick={() => setSelectedGame(game.id)}
                        className={`p-2 rounded-lg text-left transition-colors ${
                          selectedGame === game.id
                            ? "bg-purple-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <i className={`${game.icon} text-sm`}></i>
                          <span className="text-sm">{game.name}</span>
                        </div>
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
                  <h4 className="font-medium text-gray-900 mb-3">Price Range (per hour)</h4>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={600}
                      min={0}
                      step={25}
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
                  Gaming Venues ({filteredVenues.length})
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

            {/* Venue Grid */}
            {filteredVenues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {filteredVenues.map(venue => (
                  <Card key={venue.id} className="overflow-hidden card-hover shadow-sm border-0">
                    <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${venue.images[0]})` }}>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-purple-600 text-white">
                          {venue.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4 flex items-center bg-black bg-opacity-60 rounded-lg px-2 py-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-white text-sm">{venue.rating}</span>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300"></div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{venue.name}</h3>
                      <p className="text-gray-600 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 text-purple-600 mr-2" />
                        {venue.city}
                      </p>
                      
                      {/* PC Specs */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Gaming Setup</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>GPU: {venue.specs.gpuType}</div>
                          <div>CPU: {venue.specs.cpuType}</div>
                          <div>RAM: {venue.specs.ram}</div>
                          <div>Display: {venue.specs.monitor}</div>
                        </div>
                      </div>
                      
                      {/* Popular Games */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {venue.games.slice(0, 4).map(game => {
                            const gameInfo = games.find(g => g.id === game);
                            return (
                              <Badge key={game} variant="outline" className="text-xs">
                                {gameInfo?.name || game}
                              </Badge>
                            );
                          })}
                          {venue.games.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{venue.games.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            ₹{venue.pricePerHour}
                          </span>
                          <span className="text-gray-500">/hour</span>
                        </div>
                        <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                          <Link href={`/venue/${venue.id}`}>
                            Book Now
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gamepad2 className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No gaming venues found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedGame("all");
                    setSelectedTimeSlot("all");
                    setPriceRange([0, 600]);
                    setSearchQuery("");
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
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