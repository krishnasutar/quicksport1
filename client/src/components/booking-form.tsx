import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Plus, Minus, Gift, CreditCard, Wallet, Users } from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";
import StripeCheckout from "./StripeCheckout";

// Initialize Stripe (only if key is available)
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) 
  : null;

console.log('Stripe public key available:', !!import.meta.env.VITE_STRIPE_PUBLIC_KEY);
console.log('Stripe promise created:', !!stripePromise);

interface BookingFormProps {
  court: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function BookingForm({ court, onSubmit, isLoading: submittingBooking }: BookingFormProps) {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const [bookingDate, setBookingDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [useRewardPoints, setUseRewardPoints] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitUsers, setSplitUsers] = useState([{ name: "", upiId: "" }]);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's wallet balance
  const { data: walletData } = useQuery({
    queryKey: ['/api/wallet'],
    enabled: !!user,
  });

  const walletBalance = parseFloat((walletData as any)?.balance || '0');
  
  const { data: couponsData } = useQuery({
    queryKey: ['/api/coupons', { facilityId: court.facilityId }],
  });

  const coupons = (couponsData as any[]) || [];
  
  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const [startHour] = court.operatingHoursStart.split(':').map(Number);
    const [endHour] = court.operatingHoursEnd.split(':').map(Number);
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour + 1 <= endHour) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  // Calculate pricing
  const basePrice = parseFloat(court.pricePerHour) * duration;
  const rewardPointsDiscount = useRewardPoints ? Math.min(basePrice * 0.1, (user?.rewardPoints || 0) * 0.1) : 0;
  const couponDiscount = 0; // TODO: Implement coupon validation
  const finalAmount = basePrice - rewardPointsDiscount - couponDiscount;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingDate || !startTime) {
      return;
    }

    console.log('Payment method selected:', paymentMethod);

    // Validate wallet balance if wallet payment is selected
    if (paymentMethod === 'wallet' && walletBalance < finalAmount) {
      alert(`Insufficient wallet balance! Your balance: ₹${walletBalance.toFixed(2)}, Required: ₹${finalAmount.toFixed(2)}`);
      return;
    }

    // For non-wallet payments, show payment popup
    if (paymentMethod === 'stripe' || paymentMethod === 'upi') {
      setShowStripeCheckout(true);
      return;
    }

    const endTime = calculateEndTime(startTime, duration);

    // For wallet payment, proceed directly
    const bookingData = {
      courtId: court.id,
      bookingDate: bookingDate!.toISOString(),
      startTime,
      endTime,
      totalAmount: basePrice.toFixed(2),
      discountAmount: (rewardPointsDiscount + couponDiscount).toFixed(2),
      finalAmount: finalAmount.toFixed(2),
      paymentMethod,
      notes: notes || null,
      splitPayments: splitPayment ? splitUsers.filter(u => u.name && u.upiId) : [],
      useRewardPoints,
      couponCode: couponCode || null,
    };
    
    onSubmit(bookingData);
  };

  const handlePaymentSuccess = async () => {
    setIsLoading(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const endTime = calculateEndTime(startTime, duration);
      const mockPaymentIntentId = paymentMethod === 'stripe' 
        ? `pi_mock_${Date.now()}` 
        : `upi_mock_${Date.now()}`;
      
      const bookingData = {
        courtId: court.id,
        bookingDate: bookingDate!.toISOString(),
        startTime,
        endTime,
        totalAmount: basePrice.toFixed(2),
        discountAmount: (rewardPointsDiscount + couponDiscount).toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        paymentMethod: paymentMethod,
        paymentIntentId: mockPaymentIntentId,
        notes: notes || null,
        splitPayments: splitPayment ? splitUsers.filter(u => u.name && u.upiId) : [],
        useRewardPoints,
        couponCode: couponCode || null,
      };
      
      setShowStripeCheckout(false);
      
      await onSubmit(bookingData);
      setLocation('/dashboard?booking=success');
      
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    const endTime = calculateEndTime(startTime, duration);
    
    const bookingData = {
      courtId: court.id,
      bookingDate: bookingDate!.toISOString(),
      startTime,
      endTime,
      totalAmount: basePrice.toFixed(2),
      discountAmount: (rewardPointsDiscount + couponDiscount).toFixed(2),
      finalAmount: finalAmount.toFixed(2),
      paymentMethod: 'stripe',
      paymentIntentId,
      notes: notes || null,
      splitPayments: splitPayment ? splitUsers.filter(u => u.name && u.upiId) : [],
      useRewardPoints,
      couponCode: couponCode || null,
    };
    
    setShowStripeCheckout(false);
    
    try {
      await onSubmit(bookingData);
      setLocation('/dashboard?booking=success');
    } catch (error) {
      console.error('Error creating booking after payment:', error);
      alert('Payment was successful but there was an error creating your booking. Please contact support.');
    }
  };

  const calculateEndTime = (start: string, hours: number) => {
    const [hour, minute] = start.split(':').map(Number);
    const totalMinutes = hour * 60 + minute + (hours * 60);
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
  };

  const addSplitUser = () => {
    setSplitUsers([...splitUsers, { name: "", upiId: "" }]);
  };

  const removeSplitUser = (index: number) => {
    setSplitUsers(splitUsers.filter((_, i) => i !== index));
  };

  const updateSplitUser = (index: number, field: 'name' | 'upiId', value: string) => {
    const updated = [...splitUsers];
    updated[index][field] = value;
    setSplitUsers(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Selection */}
      <div className="space-y-2">
        <Label>Select Date</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !bookingDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {bookingDate ? format(bookingDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={bookingDate}
              onSelect={(date) => {
                setBookingDate(date);
                setIsCalendarOpen(false); // Close calendar after selection
              }}
              disabled={(date) => isBefore(date, startOfDay(new Date()))}
              fromDate={new Date()}
              toDate={addDays(new Date(), 30)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Select value={startTime} onValueChange={setStartTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Duration (hours)</Label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setDuration(Math.max(0.5, duration - 0.5))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value) || 1)}
              className="text-center"
              type="number"
              step="0.5"
              min="0.5"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setDuration(duration + 0.5)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Special Requests (Optional)</Label>
        <Textarea
          placeholder="Any special requests or notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Payment Method */}
      <div className="space-y-3">
        <Label>Payment Method</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
              paymentMethod === 'wallet'
                ? 'border-brand-indigo bg-brand-indigo/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('wallet')}
          >
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-brand-purple" />
              <div>
                <h4 className="font-medium">Wallet</h4>
                <p className="text-sm text-gray-500">
                  Balance: ₹{walletBalance.toFixed(2)}
                  {walletBalance < finalAmount && paymentMethod === 'wallet' && (
                    <span className="text-red-500 ml-1">(Insufficient)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div
            className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
              paymentMethod === 'upi'
                ? 'border-brand-indigo bg-brand-indigo/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('upi')}
          >
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-brand-emerald" />
              <div>
                <h4 className="font-medium">UPI</h4>
                <p className="text-sm text-gray-500">Pay with UPI</p>
              </div>
            </div>
          </div>
          
          <div
            className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
              paymentMethod === 'stripe'
                ? 'border-brand-indigo bg-brand-indigo/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              console.log('Switching to Stripe payment method');
              setPaymentMethod('stripe');
            }}
          >
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-brand-cyan" />
              <div>
                <h4 className="font-medium">Card Payment</h4>
                <p className="text-sm text-gray-500">Secure via Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discounts and Offers */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="font-medium flex items-center">
            <Gift className="h-5 w-5 mr-2 text-brand-orange" />
            Discounts & Offers
          </h3>
          
          {/* Reward Points */}
          {(user?.rewardPoints || 0) > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reward-points"
                checked={useRewardPoints}
                onCheckedChange={(checked) => setUseRewardPoints(checked as boolean)}
              />
              <Label htmlFor="reward-points" className="text-sm">
                Use {user?.rewardPoints} reward points (₹{((user?.rewardPoints || 0) * 0.1).toFixed(0)} off)
              </Label>
            </div>
          )}
          
          {/* Coupon Code */}
          <div className="flex space-x-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <Button type="button" variant="outline">
              Apply
            </Button>
          </div>
          
          {/* Available Coupons */}
          {coupons.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Available Offers:</p>
              <div className="space-y-1">
                {coupons.slice(0, 2).map((coupon: any) => (
                  <Badge
                    key={coupon.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-brand-indigo hover:text-white"
                    onClick={() => setCouponCode(coupon.code)}
                  >
                    {coupon.code} - {coupon.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Split Payment */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="split-payment"
            checked={splitPayment}
            onCheckedChange={(checked) => setSplitPayment(checked as boolean)}
          />
          <Label htmlFor="split-payment" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Split payment with friends
          </Label>
        </div>
        
        {splitPayment && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Split with friends</h4>
                <Button type="button" variant="outline" size="sm" onClick={addSplitUser}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Person
                </Button>
              </div>
              
              {splitUsers.map((splitUser, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Friend's name"
                    value={splitUser.name}
                    onChange={(e) => updateSplitUser(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="UPI ID"
                    value={splitUser.upiId}
                    onChange={(e) => updateSplitUser(index, 'upiId', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSplitUser(index)}
                    disabled={splitUsers.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <p className="text-sm text-gray-600">
                Each person will pay: ₹{(finalAmount / (splitUsers.filter(u => u.name && u.upiId).length + 1)).toFixed(0)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pricing Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Booking Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Price ({duration}h)</span>
              <span>₹{basePrice.toFixed(0)}</span>
            </div>
            {rewardPointsDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Reward Points Discount</span>
                <span>-₹{rewardPointsDiscount.toFixed(0)}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span>
                <span>-₹{couponDiscount.toFixed(0)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span>₹{finalAmount.toFixed(0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Balance Warning */}
      {paymentMethod === 'wallet' && walletBalance < finalAmount && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          ⚠️ <strong>Insufficient Wallet Balance!</strong><br />
          Your balance: ₹{walletBalance.toFixed(2)} | Required: ₹{finalAmount.toFixed(2)}<br />
          Please recharge your wallet or choose a different payment method.
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full gradient-bg hover:shadow-lg"
        disabled={submittingBooking || !bookingDate || !startTime || (paymentMethod === 'wallet' && walletBalance < finalAmount)}
      >
        {submittingBooking 
          ? "Processing..." 
          : (paymentMethod === 'wallet' && walletBalance < finalAmount)
          ? `Insufficient Balance (₹${walletBalance.toFixed(2)} available)`
          : paymentMethod === 'wallet'
          ? `Pay from Wallet ₹${finalAmount.toFixed(0)}`
          : `Pay ₹${finalAmount.toFixed(0)} via ${paymentMethod === 'stripe' ? 'Card' : 'UPI'}`
        }
      </Button>
    
      {/* Payment Popup Modal */}
      {showStripeCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6" role="dialog">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {paymentMethod === 'stripe' ? 'Card Payment' : 'UPI Payment'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStripeCheckout(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">Booking Summary</h4>
                <p className="text-sm text-gray-600">Court: {court.name}</p>
                <p className="text-sm text-gray-600">Date: {bookingDate ? format(bookingDate, "PPP") : ""}</p>
                <p className="text-sm text-gray-600">Time: {startTime} - {calculateEndTime(startTime, duration)}</p>
                <p className="text-lg font-bold mt-2">Total: ₹{finalAmount.toFixed(0)}</p>
              </div>
              
              {paymentMethod === 'stripe' && (
                <div className="space-y-3">
                  <div className="text-center text-gray-600">
                    <CreditCard className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                    <p className="font-medium">Secure Card Payment</p>
                    <p className="text-xs text-green-600 mt-1">✓ Test mode - Payment will succeed automatically</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Card:</strong> **** **** **** 4242</div>
                      <div><strong>CVV:</strong> 123</div>
                      <div><strong>Expiry:</strong> 12/28</div>
                      <div><strong>Name:</strong> Test User</div>
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="text-center text-gray-600 mb-4">
                    <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">₹</span>
                    </div>
                    <p className="font-medium">UPI Payment</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">UPI ID</label>
                      <input
                        type="text"
                        placeholder="yourname@paytm"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700">
                        <strong>Note:</strong> You'll receive a payment request on your UPI app to complete the transaction.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowStripeCheckout(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gradient-bg"
                  onClick={handlePaymentSuccess}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : `Pay ₹${finalAmount.toFixed(0)}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </form>
  );
}
