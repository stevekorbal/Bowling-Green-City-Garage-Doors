import type { IncomingMessage, ServerResponse } from 'http';

interface ContactPayload {
  sheet?: string;
  website?: string;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  service?: string;
  message?: string;
  _hp?: string;
  sourcePage?: string;
}

const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbz0v3r0fYvggUx5qGUFUgqIyRopT687iE_wZqYqCvtAWNTEKtA0ovub2yp60GiQTMh0/exec';

// String sanitization helpers
function sanitize(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[\r\n\x00-\x1F\x7F]/g, ' ');
}

function sanitizeMultiLine(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export default async function handler(req: any, res: any) {
  // Set headers
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed'
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON payload'
        });
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Missing request body'
      });
    }

    const {
      name,
      phone,
      email,
      city,
      service,
      message,
      _hp
    } = body as ContactPayload;

    // Honeypot spam protection: If filled, silently acknowledge without calling Google Sheets
    if (_hp && String(_hp).trim().length > 0) {
      console.warn('[Spam Protection] Honeypot triggered, ignoring lead.');
      return res.status(200).json({
        success: true,
        message: "Thank you. Your request has been received. We'll be in touch shortly."
      });
    }

    // Sanitize & Validate fields
    const cleanName = sanitize(name);
    const cleanPhone = sanitize(phone);
    const cleanEmail = sanitize(email);
    const cleanCity = sanitize(city);
    const cleanService = sanitize(service);
    const cleanMessage = sanitizeMultiLine(message);

    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid full name (2-100 characters).'
      });
    }

    // Phone number validation: Ensure at least 7 digits
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (!cleanPhone || digitsOnly.length < 7 || cleanPhone.length > 30) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid phone number.'
      });
    }

    // Email validation (optional field, but if supplied must be valid format)
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail) || cleanEmail.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address.'
        });
      }
    }

    if (!cleanCity || cleanCity.length < 2 || cleanCity.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Please select or provide a valid city / location.'
      });
    }

    if (!cleanService || cleanService.length < 2 || cleanService.length > 150) {
      return res.status(400).json({
        success: false,
        error: 'Please select a valid service.'
      });
    }

    if (cleanMessage && cleanMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Message length cannot exceed 2000 characters.'
      });
    }

    // Exact data structure specified for Google Apps Script Web App
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;

    const payload = {
      sheet: 'Bowling Green',
      website: 'garagedoorrepairbowlinggreen.com',
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail || '',
      city: cleanCity,
      service: cleanService,
      message: cleanMessage || ''
    };

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    if (!webhookResponse.ok) {
      console.error(`[Google Sheets Error] HTTP ${webhookResponse.status}: ${webhookResponse.statusText}`);
      return res.status(502).json({
        success: false,
        error: "Sorry, we couldn't send your request. Please call us directly."
      });
    }

    let webhookData: any = null;
    const responseText = await webhookResponse.text();
    try {
      webhookData = JSON.parse(responseText);
    } catch {
      console.warn('[Google Sheets Parse Warning] Response was not JSON:', responseText);
    }

    // Confirm that Google Apps Script Web App received and processed the lead
    if (
      webhookData &&
      (webhookData.success === true || webhookData.status === 'success' || webhookData.result === 'success')
    ) {
      return res.status(200).json({
        success: true,
        message: "Thank you. Your request has been received. We'll be in touch shortly.",
        sheet: webhookData.sheet || 'Bowling Green'
      });
    }

    // If Google Apps Script returned an explicit failure
    console.error('[Google Sheets Failed Response]', webhookData || responseText);
    return res.status(500).json({
      success: false,
      error: "Sorry, we couldn't send your request. Please call us directly."
    });

  } catch (err: any) {
    console.error('[Server Error in /api/contact]:', err);
    return res.status(500).json({
      success: false,
      error: "Sorry, we couldn't send your request. Please call us directly."
    });
  }
}
