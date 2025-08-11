import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

interface BookingFormProps {
  court: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function BookingForm({ court, onSubmit, isLoading }: BookingFormProps) {
  const { user } = useAuth();
  const [bookingDate, setBookingDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [useRewardPoints, setUseRewardPoints] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitUsers, setSplitUsers] = useState([{ name: "", upiId: "" }]);
  
  const { data: couponsData } = useQuery({
    queryKey: ['/api/coupons', { facilityId: court.facilityId }],
  });

  const coupons = couponsData || [];
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingDate || !startTime) {
      return;
    }
    
    const endTime = calculateEndTime(startTime, duration);
    
    const bookingData = {
      bookingDate: bookingDate.toISOString().split('T')[0],
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
        <Popover>
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
              onSelect={setBookingDate}
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
                  Balance: ₹{parseFloat(user?.walletBalance || "0").toFixed(0)}
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
              paymentMethod === 'card'
                ? 'border-brand-indigo bg-brand-indigo/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('card')}
          >
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-brand-cyan" />
              <div>
                <h4 className="font-medium">Card</h4>
                <p className="text-sm text-gray-500">Credit/Debit</p>
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

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full gradient-bg hover:shadow-lg"
        disabled={isLoading || !bookingDate || !startTime}
      >
        {isLoading ? "Processing..." : `Book Court for ₹${finalAmount.toFixed(0)}`}
      </Button>
    </form>
  );
}
