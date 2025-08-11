import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/context/auth-context";

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative hero-gradient min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full float-animation"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white bg-opacity-10 rounded-full float-animation" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white bg-opacity-10 rounded-full float-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-10 w-24 h-24 bg-white bg-opacity-10 rounded-full float-animation" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 slide-in-up text-shadow">
              Book Sports Courts
              <span className="block text-brand-yellow glow-text">Instantly</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Find and book local sports facilities, split payments with friends, and earn rewards. The Gen-Z way to play!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button asChild className="bg-white text-brand-indigo px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 pulse-glow">
                <Link href={user ? "/" : "/register"}>
                  <i className="fas fa-play mr-2"></i>
                  {user ? "Find Courts" : "Get Started"}
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-brand-indigo transition-all duration-200 glass-effect">
                <Link href="/sports">
                  <i className="fas fa-search mr-2"></i>
                  Browse Courts
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow">500+</div>
                <div className="text-sm text-gray-200">Venues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow">10K+</div>
                <div className="text-sm text-gray-200">Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow">25+</div>
                <div className="text-sm text-gray-200">Cities</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-80 h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-2 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500 float-animation">
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                  <div className="h-full bg-gradient-to-b from-gray-50 to-white p-4">
                    <div className="flex justify-between items-center mb-4 text-xs text-gray-600">
                      <span>9:41</span>
                      <div className="flex space-x-1">
                        <i className="fas fa-signal"></i>
                        <i className="fas fa-wifi"></i>
                        <i className="fas fa-battery-three-quarters"></i>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-800">Find Courts</h2>
                      <div className="w-8 h-8 bg-gradient-to-r from-brand-indigo to-brand-purple rounded-full"></div>
                    </div>
                    
                    <div className="bg-gray-100 rounded-xl p-3 mb-4 flex items-center">
                      <i className="fas fa-search text-gray-400 mr-2"></i>
                      <span className="text-gray-500 text-sm">Search courts near you...</span>
                    </div>
                    
                    <div className="flex justify-between mb-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-1">
                          <i className="fas fa-basketball-ball text-brand-orange text-xs"></i>
                        </div>
                        <span className="text-xs text-gray-600">Basketball</span>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-1">
                          <i className="fas fa-futbol text-brand-emerald text-xs"></i>
                        </div>
                        <span className="text-xs text-gray-600">Football</span>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-1">
                          <i className="fas fa-table-tennis text-brand-cyan text-xs"></i>
                        </div>
                        <span className="text-xs text-gray-600">Tennis</span>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-1">
                          <i className="fas fa-volleyball-ball text-brand-purple text-xs"></i>
                        </div>
                        <span className="text-xs text-gray-600">Volleyball</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-white rounded-xl p-3 shadow-sm border">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-indigo to-brand-purple rounded-lg"></div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-gray-800">Sports Complex A</h3>
                            <p className="text-xs text-gray-500">₹200/hr • 2.1 km</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-brand-yellow">★ 4.8</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-3 shadow-sm border">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-cyan to-brand-emerald rounded-lg"></div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-gray-800">City Arena</h3>
                            <p className="text-xs text-gray-500">₹150/hr • 1.5 km</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-brand-yellow">★ 4.6</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
