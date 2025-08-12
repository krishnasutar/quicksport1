import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripeCheckoutProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  courtName: string;
  facilityName: string;
  bookingDate: string;
  timeSlot: string;
}

export default function StripeCheckout({
  amount,
  onPaymentSuccess,
  onCancel,
  courtName,
  facilityName,
  bookingDate,
  timeSlot
}: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      console.log("🔵 STRIPE DEBUG: Starting payment confirmation...");
      console.log("🔵 STRIPE DEBUG: Elements available:", !!elements);
      console.log("🔵 STRIPE DEBUG: Stripe available:", !!stripe);
      
      // Submit the payment elements to Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("🔴 STRIPE ERROR: Elements submit failed:", submitError);
        toast({
          title: "Payment Failed",
          description: submitError.message,
          variant: "destructive",
        });
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      console.log("🔵 STRIPE DEBUG: Payment confirmation result:", result);
      console.log("🔵 STRIPE DEBUG: Full result object:", JSON.stringify(result, null, 2));

      if (result.error) {
        console.error("🔴 STRIPE ERROR: Payment failed:", result.error);
        console.error("🔴 STRIPE ERROR: Error type:", result.error.type);
        console.error("🔴 STRIPE ERROR: Error code:", result.error.code);
        console.error("🔴 STRIPE ERROR: Error message:", result.error.message);
        toast({
          title: "Payment Failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else if (result.paymentIntent) {
        console.log("🟢 STRIPE SUCCESS: PaymentIntent found! ID:", result.paymentIntent.id);
        console.log("🟢 STRIPE SUCCESS: Payment status:", result.paymentIntent.status);
        console.log("🟢 STRIPE SUCCESS: Amount:", result.paymentIntent.amount);
        console.log("🟢 STRIPE SUCCESS: Currency:", result.paymentIntent.currency);
        
        if (result.paymentIntent.status === "succeeded") {
          console.log("🟢 STRIPE SUCCESS: Payment succeeded! Calling onPaymentSuccess callback...");
          
          toast({
            title: "Payment Successful! 🎉",
            description: "Creating your booking and redirecting...",
          });
          
          // Call the success callback immediately
          onPaymentSuccess(result.paymentIntent.id);
        } else {
          console.log("🟡 STRIPE WARNING: Payment status is not 'succeeded':", result.paymentIntent.status);
          toast({
            title: "Payment Processing",
            description: `Payment status: ${result.paymentIntent.status}. Please wait...`,
            variant: "default",
          });
        }
      } else {
        console.log("🔴 STRIPE ERROR: No paymentIntent in result");
        toast({
          title: "Payment Error",
          description: "No payment information received from Stripe",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("🔴 STRIPE CATCH: Payment error caught:", err);
      toast({
        title: "Payment Error",
        description: "Something went wrong with your payment.",
        variant: "destructive",
      });
    } finally {
      console.log("🔵 STRIPE DEBUG: Resetting processing state");
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </CardTitle>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>{facilityName}</strong> - {courtName}</p>
          <p>{bookingDate} at {timeSlot}</p>
          <p className="text-lg font-semibold text-foreground">₹{amount.toFixed(2)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay ₹{amount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}