import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function forwardRequest(req: NextRequest, path: string[]) {
  const backendBase = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000';
  const targetPath = path.join('/');
  const search = req.nextUrl.search || '';
  const targetUrl = `${backendBase}/api/${targetPath}${search}`;

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  const options: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const body = await req.json();
      options.body = JSON.stringify(body);
    } catch {
      // Body is empty or not JSON
    }
  }

  try {
    const backendRes = await fetch(targetUrl, options);
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    console.error(`[Proxy Error] Failed forwarding to ${targetUrl}:`, error);
    return NextResponse.json(
      { error: `Internal API proxy error connecting to backend: ${error.message}` },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardRequest(req, params.path || []);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardRequest(req, params.path || []);
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardRequest(req, params.path || []);
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardRequest(req, params.path || []);
}
