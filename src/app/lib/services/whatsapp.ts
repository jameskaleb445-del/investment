/**
 * WhatsApp Service
 * Handles sending WhatsApp messages for OTP verification
 */

interface WhatsAppConfig {
  apiUrl?: string
  apiKey?: string
  phoneNumberId?: string
}

/**
 * Send WhatsApp message via API
 * You can use services like Twilio, WhatsApp Business API, or custom API
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  config?: WhatsAppConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get configuration from environment variables
    const apiUrl = config?.apiUrl || process.env.WHATSAPP_API_URL
    const apiKey = config?.apiKey || process.env.WHATSAPP_API_KEY
    const phoneNumberId =
      config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID

    // If WhatsApp is not configured, log and return success for development
    if (!apiUrl || !apiKey || !phoneNumberId) {
      console.warn(
        'WhatsApp service not configured. Message would be sent to:',
        to,
        'Message:',
        message
      )
      // In production, you might want to return an error
      // For development, we'll return success
      return { success: true }
    }

    // Format phone number (remove + and ensure proper format)
    const formattedPhone = to.replace(/^\+/, '').replace(/\s/g, '')

    // Example: Twilio WhatsApp API format
    // Adjust based on your WhatsApp service provider
    const response = await fetch(`${apiUrl}/v1/Messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        To: `whatsapp:${formattedPhone}`,
        From: `whatsapp:${phoneNumberId}`,
        Body: message,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `WhatsApp API error: ${response.status} - ${JSON.stringify(errorData)}`
      )
    }

    return { success: true }
  } catch (error: any) {
    console.error('Failed to send WhatsApp message:', error)
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
    }
  }
}

/**
 * Send OTP via WhatsApp
 */
export async function sendOTPviaWhatsApp(
  phoneNumber: string,
  otpCode: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Your Profit Bridge verification code is: ${otpCode}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this message.`

  return sendWhatsAppMessage(phoneNumber, message)
}

