import { NextRequest, NextResponse } from 'next/server';

interface InitSubscriptionPayload {
  email: string;
  plan_code?: string;
  amount?: number;
  authorization_code?: string;
  quantity?: number;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: InitSubscriptionPayload = await request.json();
    const { email, plan_code, amount, authorization_code, quantity = 1, metadata = {} } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      );
    }

    const paystackUrl = 'https://api.paystack.co/subscription';

    const payload: any = {
      customer: email,
      plan: plan_code || 'PLN_default',
      authorization: authorization_code,
      quantity,
      metadata,
    };

    if (!authorization_code) {
      delete payload.authorization;
    }

    const response = await fetch(paystackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to initialize subscription', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: data.data,
      message: `Subscription initialized for ${email}`,
    });
  } catch (error) {
    console.error('Subscription init error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
