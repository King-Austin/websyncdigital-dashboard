import { NextRequest, NextResponse } from 'next/server';

interface VerifyPayload {
  reference: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyPayload = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
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

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secret}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to verify reference', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: data.data,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
