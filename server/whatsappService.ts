import twilio from 'twilio';

// WhatsApp message templates
export const WhatsAppTemplates = {
  BOOKING_APPROVED: (userName: string, facilityName: string, courtName: string, date: string, time: string, amount: string) => `
🎉 *Booking Confirmed!*

Hi ${userName}! Great news! ✅

Your court booking has been approved:

🏟️ *Facility:* ${facilityName}
🎾 *Court:* ${courtName}
📅 *Date:* ${date}
⏰ *Time:* ${time}
💰 *Amount:* ₹${amount}

*What's next?*
• Arrive 10 minutes early
• Bring valid ID
• Check facility guidelines

Have an amazing game! 🏆

*QuickCourt Team*
`.trim(),

  BOOKING_REJECTED: (userName: string, facilityName: string, courtName: string, date: string, time: string, reason?: string) => `
❌ *Booking Update*

Hi ${userName},

Unfortunately, your booking request has been declined:

🏟️ *Facility:* ${facilityName}
🎾 *Court:* ${courtName}
📅 *Date:* ${date}
⏰ *Time:* ${time}

${reason ? `*Reason:* ${reason}` : ''}

Don't worry! 💪 Try booking another slot or contact the facility directly for more options.

*QuickCourt Team*
`.trim()
};

export class WhatsAppService {
  private client: any | null = null;
  private fromNumber: string;

  constructor() {
    // Initialize Twilio client if credentials are available
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM || '';

    console.log('Twilio credentials check:');
    console.log('- Account SID:', accountSid ? `${accountSid.substring(0, 8)}...` : 'MISSING');
    console.log('- Auth Token:', authToken ? 'PROVIDED' : 'MISSING');
    console.log('- WhatsApp From:', this.fromNumber || 'MISSING');

    if (accountSid && authToken && this.fromNumber) {
      this.client = twilio(accountSid, authToken);
      console.log('WhatsApp service initialized successfully');
    } else {
      console.warn('WhatsApp service not initialized - missing Twilio credentials');
    }
  }

  // Check if WhatsApp service is available
  isAvailable(): boolean {
    return this.client !== null && this.fromNumber !== '';
  }

  // Format phone number for WhatsApp (must include country code)
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 91 (India), use as is
    if (cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    // If it's 10 digits, assume Indian number and add +91
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    // If it starts with 0, remove leading 0 and add +91 (Indian format)
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return `+91${cleaned.substring(1)}`;
    }
    
    // Otherwise, add + if not present
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  // Send WhatsApp message
  async sendMessage(toNumber: string, message: string): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('WhatsApp service not available - message not sent');
      return false;
    }

    try {
      const formattedTo = this.formatPhoneNumber(toNumber);
      
      // For Twilio WhatsApp, the from number should already include "whatsapp:" prefix
      // or be in format like "+14155238886" for Twilio sandbox
      let formattedFrom = this.fromNumber;
      if (!formattedFrom.startsWith('whatsapp:')) {
        formattedFrom = `whatsapp:${formattedFrom}`;
      }
      
      const formattedToWhatsApp = `whatsapp:${formattedTo}`;

      console.log(`Sending WhatsApp message from ${formattedFrom} to ${formattedToWhatsApp}`);
      console.log(`Message content: ${message.substring(0, 100)}...`);

      const message_result = await this.client!.messages.create({
        body: message,
        from: formattedFrom,
        to: formattedToWhatsApp
      });

      console.log(`WhatsApp message sent successfully. SID: ${message_result.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Check if it's a sandbox issue
      if (error instanceof Error && error.message.includes('63007')) {
        console.error('❌ Twilio Error 63007: WhatsApp Channel Not Found');
        console.error('This error means your Twilio number is not set up for WhatsApp.');
        console.error('');
        console.error('🔧 To fix this, you need to:');
        console.error('1. Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message');
        console.error('2. Use the Twilio Sandbox number: +1 415 523 8886');
        console.error('3. Send "join <sandbox-word>" to that number from your WhatsApp');
        console.error('4. Update TWILIO_WHATSAPP_FROM to: +14155238886');
        console.error('');
        console.error(`❌ Current FROM number: ${this.fromNumber}`);
        console.error('✅ Should be: +14155238886 (Twilio Sandbox)');
        console.error('');
        console.error('Alternatively, set up a dedicated WhatsApp Business account in Twilio.');
      }
      
      return false;
    }
  }

  // Send booking approved notification
  async sendBookingApprovedNotification(
    userPhone: string,
    userName: string,
    facilityName: string,
    courtName: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
    amount: string
  ): Promise<boolean> {
    const formattedDate = new Date(bookingDate).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const timeSlot = `${startTime} - ${endTime}`;
    
    const message = WhatsAppTemplates.BOOKING_APPROVED(
      userName,
      facilityName,
      courtName,
      formattedDate,
      timeSlot,
      amount
    );

    return this.sendMessage(userPhone, message);
  }

  // Send booking rejected notification
  async sendBookingRejectedNotification(
    userPhone: string,
    userName: string,
    facilityName: string,
    courtName: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
    reason?: string
  ): Promise<boolean> {
    const formattedDate = new Date(bookingDate).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const timeSlot = `${startTime} - ${endTime}`;
    
    const message = WhatsAppTemplates.BOOKING_REJECTED(
      userName,
      facilityName,
      courtName,
      formattedDate,
      timeSlot,
      reason
    );

    return this.sendMessage(userPhone, message);
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();