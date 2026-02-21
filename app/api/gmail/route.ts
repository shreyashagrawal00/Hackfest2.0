import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
  }

  // Debug: Forced re-compile at 2026-02-21T21:40:00Z
  try {
    // 1. Fetch the list of latest messages
    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!listRes.ok) {
      const errorBody = await listRes.text();
      console.error(`GMAIL LIST ERROR: ${listRes.status}`, errorBody);
      throw new Error(`Failed to fetch messages: ${listRes.status} ${errorBody}`);
    }
    const listData = await listRes.json();

    if (!listData.messages || listData.messages.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    // 2. Fetch details for each message to get Subject lines
    const messageDetails = await Promise.all(
      listData.messages.map(async (msg: any) => {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const detailData = await detailRes.json();

        const subject = detailData.payload.headers.find(
          (h: any) => h.name.toLowerCase() === 'subject'
        )?.value || '(No Subject)';

        return {
          id: msg.id,
          subject,
          snippet: detailData.snippet,
          date: detailData.internalDate
        };
      })
    );

    return NextResponse.json({ messages: messageDetails });
  } catch (err: any) {
    console.error('CRITICAL GMAIL API ERROR:', err);
    return NextResponse.json({ error: err.message || 'Failed to access Gmail API' }, { status: 500 });
  }
}
