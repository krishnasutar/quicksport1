import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import BookingForm from "@/components/booking-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Booking() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for Stripe redirect success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get('payment_intent');
    const redirectStatus = urlParams.get('redirect_status');

    if (paymentIntent && redirectStatus === 'succeeded') {
      console.log('Stripe payment successful, redirecting to dashboard');
      navigate('/dashboard?booking=success');
    }
  }, [navigate]);
  
  const { data: courtData, isLoading } = useQuery({
    queryKey: ['/api/courts', params.courtId],
    enabled: !!params.courtId,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      if (!user) throw new Error("Please log in to make a booking");
      
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      
      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || "Booking failed");
        (error as any).status = response.status;
        (error as any).details = errorData.details;
        (error as any).errorCode = errorData.error;
        throw error;
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Successful!",
        description: `Your booking has been confirmed. You earned ${data.rewardPointsEarned} reward points!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      let title = "Booking Failed";
      let description = error.message || "Something went wrong. Please try again.";
      
      // Check for wallet balance errors
      if (error.errorCode === "INSUFFICIENT_WALLET_BALANCE" || 
          (error.message && error.message.includes("Insufficient wallet balance"))) {
        title = "💰 Insufficient Wallet Balance";
        if (error.details) {
          description = `Your wallet balance (₹${error.details.walletBalance}) is not enough for this booking (₹${error.details.requiredAmount}). Please add ₹${error.details.shortfall} to your wallet or choose a different payment method.`;
        } else {
          description = "Your wallet doesn't have enough balance for this booking. Please add funds or choose a different payment method.";
        }
      }
      // Check if it's a court availability error
      else if (error.errorCode === "COURT_UNAVAILABLE" || 
          (error.message && error.message.includes("Court is not available"))) {
        title = "⏰ Time Slot Already Booked";
        description = "This court is already reserved for the selected time. Please choose a different time slot or date.";
      } else if (error.status === 409) {
        title = "Booking Conflict";
        description = error.details || "There's a conflict with your booking. Please try a different time.";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courtData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="text-6xl text-gray-300 mb-4">🏟️</div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Court Not Found</h1>
          <p className="text-gray-500 mb-6">The court you're trying to book doesn't exist or is unavailable.</p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="text-6xl text-gray-300 mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Login Required</h1>
          <p className="text-gray-500 mb-6">Please log in to make a booking.</p>
          <Button onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  const court = courtData;
  // Create facility object from court data
  const facility = {
    id: court.facilityId,
    name: court.facilityName,
    address: court.facilityAddress,
    city: court.facilityCity,
    phoneNumber: court.facilityPhone,
    email: court.facilityEmail
  };

  const handleBookingSubmit = (bookingData: any) => {
    const finalBookingData = {
      ...bookingData,
      courtId: court.id,
    };
    createBookingMutation.mutate(finalBookingData);
  };

  const sportIcons: Record<string, string> = {
    basketball: 'fas fa-basketball-ball',
    football: 'fas fa-futbol',
    tennis: 'fas fa-table-tennis',
    volleyball: 'fas fa-volleyball-ball',
    badminton: 'fas fa-dumbbell',
    swimming: 'fas fa-swimmer',
    cricket: 'fas fa-baseball-ball',
    table_tennis: 'fas fa-ping-pong-paddle-ball',
  };

  const sportIcon = sportIcons[court.sportType] || sportIcons.basketball;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(`/venue/${facility.id}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Venue
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Court Information */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-indigo to-brand-purple rounded-xl flex items-center justify-center">
                    <i className={`${sportIcon} text-white text-lg`}></i>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{court.name}</CardTitle>
                    <p className="text-gray-600 capitalize">{court.sportType.replace('_', ' ')}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Facility Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Facility</h3>
                    <div className="flex items-start space-x-3">
                      <img
                        src='https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
                        alt={facility.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{facility.name}</h4>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          {facility.city}
                        </div>
                        {/* We don't have rating/reviews in facility object, skip this section */}
                      </div>
                    </div>
                  </div>

                  {/* Court Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Court Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-brand-indigo mr-2" />
                        <span>Operating Hours: {court.operatingHoursStart} - {court.operatingHoursEnd}</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        ₹{parseFloat(court.pricePerHour).toFixed(0)}
                        <span className="text-lg font-normal text-gray-500">/hour</span>
                      </div>
                    </div>
                    
                    {court.description && (
                      <p className="text-gray-600 mt-2">{court.description}</p>
                    )}
                  </div>

                  {/* Court Images */}
                  {court.images && court.images.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Court Photos</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {court.images.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${court.name} view ${index + 1}`}
                            className="w-full h-24 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Book This Court</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingForm
                  court={court}
                  onSubmit={handleBookingSubmit}
                  isLoading={createBookingMutation.isPending}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
