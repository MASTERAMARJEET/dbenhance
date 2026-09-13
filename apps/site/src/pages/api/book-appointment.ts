import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { BOOKING_LEAD_EMAILS } from "../../data/locations";

export const prerender = false;

interface BookingBody {
  name?: string;
  mobile?: string;
  location?: string;
  service?: string;
  message?: string;
}

function getFromAddress(): string | undefined {
  return env.BOOKING_FROM_EMAIL ?? import.meta.env.BOOKING_FROM_EMAIL;
}

export const POST: APIRoute = async ({ request }) => {
  if (
    request.headers.get("content-type")?.includes("application/json") !== true
  ) {
    return Response.json({ error: "Expected JSON body" }, { status: 400 });
  }

  let body: BookingBody;
  try {
    body = (await request.json()) as BookingBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const mobile = body.mobile?.trim() ?? "";
  const location = body.location?.trim() ?? "";
  const service = body.service?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || name.length > 120) {
    return Response.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!mobile || mobile.length < 8 || mobile.length > 20) {
    return Response.json(
      { error: "Please enter a valid mobile number." },
      { status: 400 },
    );
  }
  if (!service) {
    return Response.json(
      { error: "Please select a service." },
      { status: 400 },
    );
  }
  if (message.length > 2000) {
    return Response.json({ error: "Message is too long." }, { status: 400 });
  }

  if (!env.EMAIL) {
    console.error("EMAIL binding is not configured");
    return Response.json(
      {
        error:
          "Booking is temporarily unavailable. Please call us or try WhatsApp.",
      },
      { status: 503 },
    );
  }

  const fromAddress = getFromAddress();
  if (!fromAddress) {
    console.error("BOOKING_FROM_EMAIL is not configured");
    return Response.json(
      {
        error:
          "Booking is temporarily unavailable. Please call us or try WhatsApp.",
      },
      { status: 503 },
    );
  }

  const text = [
    "New appointment enquiry from dbenhance.com",
    "",
    `Name: ${name}`,
    `Mobile: ${mobile}`,
    `Preferred location: ${location || "—"}`,
    `Service interested in: ${service}`,
    `Message: ${message || "—"}`,
    "",
    `Submitted at: ${new Date().toISOString()}`,
  ].join("\n");

  try {
    await env.EMAIL.send({
      to: [...BOOKING_LEAD_EMAILS],
      from: { email: fromAddress, name: "DB Enhance Bookings" },
      subject: `Appointment enquiry: ${service} (${location || "DB Enhance"})`,
      text,
    });
  } catch (error) {
    const err = error as Error & { code?: string };
    console.error("Email send error", err.code, err.message);
    return Response.json(
      { error: "Could not send your enquiry. Please call us or try WhatsApp." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
};
