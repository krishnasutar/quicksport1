import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MapPin, Calendar, Clock, CreditCard, Wallet, X } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface BookingSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LatestBooking {
  id: string;
  courtName: string;
  facilityName: string;
  facilityLocation: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  finalAmount: string;
  paymentMethod: string;
  status: string;
  sport: string;
}

export default function BookingSuccessPopup({ isOpen, onClose }: BookingSuccessPopupProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  // Fetch latest booking when popup opens
  const { data: latestBooking, isLoading } = useQuery<LatestBooking>({
    queryKey: ['/api/bookings/latest'],
    enabled: isOpen, // Only fetch when popup is open
  });

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      // Auto close after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowAnimation(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isOpen) return null;

  const formatBookingDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEE, MMM dd');
    } catch {
      return dateStr;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'stripe':
        return <CreditCard className="h-4 w-4" />;
      case 'wallet':
        return <Wallet className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'stripe':
        return 'Card Payment';
      case 'wallet':
        return 'Wallet Payment';
      default:
        return 'Payment';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`transform transition-all duration-300 ${
          showAnimation 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white">
          <CardHeader className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg pb-8">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mb-3">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">Booking Confirmed!</h2>
              <p className="text-green-100 text-sm">Your court has been successfully booked</p>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
              </div>
            ) : latestBooking ? (
              <div className="space-y-4">
                {/* Court & Facility Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {latestBooking.courtName}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{latestBooking.facilityName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {latestBooking.sport}
                    </Badge>
                    <Badge 
                      variant={latestBooking.status === 'confirmed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {latestBooking.status}
                    </Badge>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Date</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatBookingDate(latestBooking.bookingDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Time</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {latestBooking.startTime} - {latestBooking.endTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      {getPaymentIcon(latestBooking.paymentMethod)}
                      <span className="ml-2">{getPaymentLabel(latestBooking.paymentMethod)}</span>
                    </div>
                    <span className="font-bold text-green-600">
                      ₹{latestBooking.finalAmount}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      handleClose();
                      window.location.href = '/dashboard';
                    }}
                  >
                    View Bookings
                  </Button>
                  <Button 
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={handleClose}
                  >
                    Continue Browsing
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Booking details not available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}