import { NextRequest, NextResponse } from "next/server";

interface InquiryPayload {
  focus?: string;
  phone?: string;
  name?: string;
  email?: string;
  brief?: string;
  source?: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(req: NextRequest) {
  let body: InquiryPayload;
  try {
    body = (await req.json()) as InquiryPayload;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const name = body.name?.trim() || "";
  const email = body.email?.trim() || "";
  const phone = body.phone?.trim() || "Not provided";
  const focus = body.focus?.trim() || "Not specified";
  const brief = body.brief?.trim() || "No additional notes provided.";
  const source = body.source?.trim() || "website";

  if (!name || !email) {
    return NextResponse.json(
      { success: false, message: "Please enter your name and email address." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return NextResponse.json(
      {
        success: false,
        code: "MISSING_WEBHOOK",
        message: "Discord webhook is not configured yet. Add DISCORD_WEBHOOK_URL to .env.local.",
      },
      { status: 503, headers: CORS_HEADERS }
    );
  }

  try {
    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Progency Inquiries",
        embeds: [
          {
            title: "New Project Inquiry",
            color: 0xfa692e,
            fields: [
              { name: "Name", value: name.slice(0, 256), inline: true },
              { name: "Email", value: email.slice(0, 256), inline: true },
              { name: "Phone", value: phone.slice(0, 256), inline: true },
              { name: "Focus", value: focus.slice(0, 256), inline: true },
              { name: "Source", value: source.slice(0, 128), inline: true },
              { name: "Project Brief", value: brief.slice(0, 1024), inline: false },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!discordRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Discord webhook returned status ${discordRes.status}.`,
        },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, message: "Inquiry delivered to Progency Discord." },
      { headers: CORS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to reach Discord webhook." },
      { status: 502, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
