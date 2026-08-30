import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, model, messages, temperature } = body;

    const openRouterApiKey = apiKey || process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      return NextResponse.json(
        {
          message:
            'OpenRouter API Key is missing. Please enter your OpenRouter API key in Settings → AI.',
        },
        { status: 401 }
      );
    }

    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://documentstudio.app',
        'X-Title': 'Document Studio v1.5',
      },
      body: JSON.stringify({
        model: model || 'z-ai/glm-5.2:free',
        messages: messages || [],
        temperature: temperature ?? 0.3,
      }),
    });

    if (!openRouterRes.ok) {
      const errorText = await openRouterRes.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { message: errorText };
      }
      return NextResponse.json(
        {
          message:
            errorJson?.error?.message ||
            errorJson?.message ||
            `OpenRouter API HTTP ${openRouterRes.status}`,
        },
        { status: openRouterRes.status }
      );
    }

    const data = await openRouterRes.json();
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ content, raw: data });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Server error proxying AI request' },
      { status: 500 }
    );
  }
}
