/**
 * Email Service
 * Handles sending emails using nodemailer for OTP verification
 */

import nodemailer from 'nodemailer'

interface EmailConfig {
  host?: string
  port?: number
  secure?: boolean
  auth?: {
    user: string
    pass: string
  }
  from?: string
}

/**
 * Create email transporter
 */
function createTransporter(config?: EmailConfig) {
  const emailHost = config?.host || process.env.SMTP_HOST || 'smtp.gmail.com'
  const emailPort = config?.port || parseInt(process.env.SMTP_PORT || '587', 10)
  const emailSecure = config?.secure || process.env.SMTP_SECURE === 'true'
  const emailUser =
    config?.auth?.user || process.env.SMTP_USER || process.env.SMTP_EMAIL
  const emailPassword = config?.auth?.pass || process.env.SMTP_PASSWORD
  const emailFrom =
    config?.from ||
    process.env.SMTP_FROM ||
    process.env.SMTP_EMAIL ||
    'noreply@example.com'

  // If email is not configured, create a test account for development
  if (!emailUser || !emailPassword) {
    console.warn(
      'Email service not configured. Email messages will be logged to console.'
    )
    // Return a test transporter (won't actually send emails)
    return nodemailer.createTransport({
      host: 'localhost',
      port: 587,
      secure: false,
      // Test account - emails won't actually be sent
      tls: {
        rejectUnauthorized: false,
      },
    })
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    ...(emailSecure && {
      tls: {
        rejectUnauthorized: false, // For self-signed certificates
      },
    }),
  })
}

/**
 * Send email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
  config?: EmailConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter(config)
    const from =
      config?.from ||
      process.env.SMTP_FROM ||
      process.env.SMTP_EMAIL ||
      'noreply@example.com'

    const mailOptions = {
      from: `"Profit Bridge" <${from}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Plain text version
      html,
    }

    // If email is not configured, log to console
    const emailUser = config?.auth?.user || process.env.SMTP_USER || process.env.SMTP_EMAIL
    const emailPassword = config?.auth?.pass || process.env.SMTP_PASSWORD

    if (!emailUser || !emailPassword) {
      console.log('Email would be sent:', {
        to,
        subject,
        text: text || html.replace(/<[^>]*>/g, ''),
      })
      return { success: true }
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)

    return { success: true }
  } catch (error: any) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      error: error.message || 'Failed to send email',
    }
  }
}

/**
 * Send OTP via Email
 */
export async function sendOTPviaEmail(
  email: string,
  otpCode: string
): Promise<{ success: boolean; error?: string }> {
  const subject = 'Your Profit Bridge Verification Code'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Profit Bridge</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Verification Code</h2>
        <p>Hello,</p>
        <p>Your Profit Bridge verification code is:</p>
        <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${otpCode}</span>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #666; font-size: 12px; margin: 0;">This is an automated message from Profit Bridge, please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `
  const text = `Your Profit Bridge verification code is: ${otpCode}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`

  return sendEmail(email, subject, html, text)
}

