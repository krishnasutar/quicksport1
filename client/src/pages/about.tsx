import { Users, Trophy, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";

export default function AboutPage() {
  const stats = [
    { number: "10K+", label: "Active Users", icon: Users },
    { number: "500+", label: "Sports Venues", icon: Trophy },
    { number: "50K+", label: "Bookings Made", icon: Heart },
    { number: "25+", label: "Cities", icon: Zap },
  ];

  const team = [
    {
      name: "Arjun Sharma",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Ex-athlete turned entrepreneur, passionate about making sports accessible to everyone."
    },
    {
      name: "Priya Patel", 
      role: "CTO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Tech enthusiast building the future of sports booking with cutting-edge technology."
    },
    {
      name: "Rohit Kumar",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Ensuring seamless operations across all venues and delivering exceptional user experiences."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 slide-in-up">
            About <span className="text-brand-yellow">QuickCourt</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            We're revolutionizing sports booking for the new generation. Making it easier, faster, and more social than ever before.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild className="bg-white text-brand-indigo px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <Link href="/sports">
                Explore Sports
              </Link>
            </Button>
            <Button variant="outline" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-brand-indigo transition-all duration-200 glass-effect">
              <Link href="/contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                To democratize sports access and create a thriving community where every athlete - from weekend warriors to serious competitors - can easily find, book, and enjoy their favorite sports.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We believe sports should be accessible, social, and hassle-free. That's why we've built a platform that not only helps you find the perfect court but also connects you with fellow athletes, rewards your activity, and makes every booking seamless.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-brand-indigo rounded-full"></div>
                  <span className="text-gray-700">Instant booking with real-time availability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-brand-purple rounded-full"></div>
                  <span className="text-gray-700">Smart payment splitting with friends</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-brand-cyan rounded-full"></div>
                  <span className="text-gray-700">Rewards program for frequent players</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
                alt="Team playing sports"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center float-animation shadow-lg">
                <Trophy className="text-white h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Growing Strong Together</h2>
            <p className="text-xl text-gray-600">Numbers that showcase our impact on the sports community</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center card-hover p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-indigo to-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="text-white h-8 w-8" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">Passionate individuals working to transform sports booking</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center card-hover bg-white p-8 rounded-2xl shadow-sm">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-brand-indigo font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Play?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of athletes who have made QuickCourt their go-to platform for sports booking.
          </p>
          <Button asChild className="bg-white text-brand-indigo px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <Link href="/register">
              Get Started Today
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}