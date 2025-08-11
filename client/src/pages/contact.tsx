import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, MessageSquare, Headphones, Users } from "lucide-react";
import Navbar from "@/components/layout/navbar";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["QuickCourt HQ", "Koramangala, Bangalore", "Karnataka 560034"],
      gradient: "from-brand-indigo to-brand-purple"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 9876543210", "+91 8765432109", "24/7 Support Available"],
      gradient: "from-brand-cyan to-brand-emerald"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["support@quickcourt.com", "partnerships@quickcourt.com", "careers@quickcourt.com"],
      gradient: "from-brand-orange to-brand-yellow"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 10:00 PM", "Sat - Sun: 8:00 AM - 11:00 PM", "Support: 24/7"],
      gradient: "from-brand-purple to-pink-500"
    }
  ];

  const supportOptions = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Headphones,
      title: "Phone Support",
      description: "Speak directly with our customer service",
      action: "Call Now",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with other athletes and get help",
      action: "Join Community",
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 slide-in-up">
            Get in <span className="text-brand-yellow">Touch</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Have questions? Need support? Want to partner with us? We'd love to hear from you!
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-xl border-0 card-hover">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Send us a Message</CardTitle>
                  <p className="text-gray-600">Fill out the form below and we'll get back to you within 24 hours.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <Input
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="border-gray-300 focus:border-brand-indigo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="border-gray-300 focus:border-brand-indigo"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <Input
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="border-gray-300 focus:border-brand-indigo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <Textarea
                        placeholder="Tell us how we can help you..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="border-gray-300 focus:border-brand-indigo resize-none"
                      />
                    </div>
                    <Button className="w-full gradient-bg hover:shadow-lg transform hover:scale-105 transition-all duration-200 py-3">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-0 shadow-sm card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${info.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <info.icon className="text-white h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Need Immediate Help?</h2>
            <p className="text-xl text-gray-600">Choose the support option that works best for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              <Card key={index} className="border-0 shadow-sm card-hover text-center">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${option.gradient} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <option.icon className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{option.title}</h3>
                  <p className="text-gray-600 mb-6">{option.description}</p>
                  <Button className="gradient-bg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-sm card-hover">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How do I book a court?</h3>
                <p className="text-gray-600">Simply search for courts in your area, select your preferred time slot, and complete the booking with instant confirmation.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm card-hover">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I split payments with friends?</h3>
                <p className="text-gray-600">Yes! Our built-in payment splitting feature allows you to easily share costs with your teammates using UPI.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm card-hover">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What if I need to cancel?</h3>
                <p className="text-gray-600">You can cancel bookings up to 4 hours before your slot for a full refund. Check our cancellation policy for details.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm card-hover">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How do rewards work?</h3>
                <p className="text-gray-600">Earn points with every booking, get bonus points for referrals, and redeem them for discounts on future bookings.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}