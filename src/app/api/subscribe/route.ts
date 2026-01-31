import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

// Resend Audience IDs (create these in Resend dashboard)
const AUDIENCES = {
  ai_news: process.env.RESEND_AUDIENCE_AI_NEWS || '',
  personal_digest: process.env.RESEND_AUDIENCE_PERSONAL || '',
};

export async function POST(request: NextRequest) {
  try {
    const { email, newsletter } = await request.json();

    if (!email || !newsletter) {
      return NextResponse.json(
        { error: 'Email and newsletter type required' },
        { status: 400 }
      );
    }

    const audienceId = AUDIENCES[newsletter as keyof typeof AUDIENCES];

    if (!audienceId) {
      return NextResponse.json(
        { error: 'Invalid newsletter type' },
        { status: 400 }
      );
    }

    // Add contact to Resend audience
    const response = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
