import { NextResponse } from 'next/server';

/**
 * Proxies the public OpenRouter model catalog:
 *   https://openrouter.ai/api/v1/models
 * The catalog is publicly accessible (no key required). We enrich each model
 * with isFree / supportsVision flags, sort free models first, and support
 * ?free=1 and ?q=search filters for the model search UI.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const freeOnly = searchParams.get('free') === '1';
    const query = (searchParams.get('q') || '').toLowerCase();

    const authHeader = req.headers.get('authorization');
    const apiKey = authHeader ? authHeader.replace('Bearer ', '') : process.env.OPENROUTER_API_KEY;

    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ models: [] });
    }

    const data = await res.json();
    const rawModels: any[] = data.data || [];

    let models = rawModels.map((m: any) => {
      const modality: string = m.architecture?.modality || '';
      const inputFree = m.pricing?.prompt === '0' || m.pricing?.prompt === '0.0';
      const outputFree = m.pricing?.completion === '0' || m.pricing?.completion === '0.0';
      const isFree = m.id.endsWith(':free') || (inputFree && outputFree);

      return {
        id: m.id,
        name: m.name || m.id,
        description: m.description || '',
        contextLength: m.context_length || 4096,
        supportsVision: modality.includes('image'),
        isFree,
      };
    });

    if (freeOnly) {
      models = models.filter((m) => m.isFree);
    }

    if (query) {
      models = models.filter(
        (m) =>
          m.id.toLowerCase().includes(query) ||
          (m.name || '').toLowerCase().includes(query)
      );
    }

    // Sort: free models first, then vision-capable, then alphabetical.
    models.sort((a, b) => {
      if (a.isFree !== b.isFree) return a.isFree ? -1 : 1;
      if (a.supportsVision !== b.supportsVision) return a.supportsVision ? -1 : 1;
      return (a.name || a.id).localeCompare(b.name || b.id);
    });

    // Cap payload for low-RAM devices
    models = models.slice(0, 400);

    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: [] });
  }
}
