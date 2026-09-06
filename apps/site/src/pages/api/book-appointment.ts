import type { APIRoute } from "astro";
import { BOOKING_LEAD_EMAILS } from "../../data/locations";

export const prerender = false;

interface BookingBody {
	name?: string;
	mobile?: string;
	location?: string;
	service?: string;
	message?: string;
}

function getResendApiKey(locals: App.Locals): string | undefined {
	const runtime = (locals as { runtime?: { env?: Record<string, string> } }).runtime;
	return runtime?.env?.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;
}

function getFromAddress(locals: App.Locals): string {
	const runtime = (locals as { runtime?: { env?: Record<string, string> } }).runtime;
	return (
		runtime?.env?.RESEND_FROM_EMAIL ??
		import.meta.env.RESEND_FROM_EMAIL ??
		"DB Enhance <onboarding@resend.dev>"
	);
}

export const POST: APIRoute = async ({ request, locals }) => {
	if (request.headers.get("content-type")?.includes("application/json") !== true) {
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
		return Response.json({ error: "Please enter a valid mobile number." }, { status: 400 });
	}
	if (!service) {
		return Response.json({ error: "Please select a service." }, { status: 400 });
	}
	if (message.length > 2000) {
		return Response.json({ error: "Message is too long." }, { status: 400 });
	}

	const apiKey = getResendApiKey(locals);
	if (!apiKey) {
		console.error("RESEND_API_KEY is not configured");
		return Response.json(
			{ error: "Booking is temporarily unavailable. Please call us or try WhatsApp." },
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

	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: getFromAddress(locals),
			to: [...BOOKING_LEAD_EMAILS],
			subject: `Appointment enquiry: ${service} (${location || "DB Enhance"})`,
			text,
		}),
	});

	if (!res.ok) {
		const errText = await res.text().catch(() => "");
		console.error("Resend error", res.status, errText);
		return Response.json(
			{ error: "Could not send your enquiry. Please call us or try WhatsApp." },
			{ status: 502 },
		);
	}

	return Response.json({ ok: true });
};
