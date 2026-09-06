export type CityId = "bangalore" | "chennai";

export interface SalonLocation {
	id: CityId;
	label: string;
	heading: string;
	addressLines: string[];
	phones: { display: string; tel: string }[];
	mapsUrl: string;
	mapsEmbedSrc: string;
	/** Primary mobile for tel:/WhatsApp for this city */
	primaryPhone: { display: string; tel: string; whatsappE164: string };
	hours: { weekdays: string; weekend: string };
}

export const SOCIAL_LINKS = {
	instagram: "https://www.instagram.com/dbenhance/",
	facebook: "https://www.facebook.com/DBEnhance",
	youtube: "https://www.youtube.com/@dbenhance",
} as const;

export const SITE_EMAIL = "contact@dbenhance.com";

export const BOOKING_LEAD_EMAILS = [
	"rekha.dbenhance@gmail.com",
	"dbenhance.blr@gmail.com",
] as const;

/** Static default until geo city context ships (plan §11). */
export const DEFAULT_CITY_ID: CityId = "bangalore";

export const LOCATIONS: Record<CityId, SalonLocation> = {
	bangalore: {
		id: "bangalore",
		label: "Bangalore",
		heading: "DB Enhance – Bangalore",
		addressLines: [
			"1st Floor, 34/1, Vanivilas Rd",
			"Basavanagudi, Bengaluru",
			"Karnataka 560004",
		],
		phones: [
			{ display: "8797827102", tel: "8797827102" },
			{ display: "080 4227 5962", tel: "+918042275962" },
		],
		mapsUrl: "https://maps.app.goo.gl/mDfSFAY66PjqVvSx7",
		mapsEmbedSrc:
			"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243.02300446540272!2d77.5755318!3d12.9482833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15bf5fd2f929%3A0x323f47f639780d38!2sDB%20Enhance!5e0!3m2!1sen!2sin!4v1787993654609!5m2!1sen!2sin",
		primaryPhone: {
			display: "8797827102",
			tel: "8797827102",
			whatsappE164: "918797827102",
		},
		hours: {
			weekdays: "Mon–Fri: 10 AM – 9 PM",
			weekend: "Sat–Sun: 9 AM – 9 PM",
		},
	},
	chennai: {
		id: "chennai",
		label: "Chennai",
		heading: "DB Enhance – Chennai",
		addressLines: [
			"S3, 2nd Floor, Godrej Azure Elsa Plaza",
			"No. 2, Rajiv Gandhi Salai, Padur",
			"Chennai – 603103",
		],
		phones: [
			{ display: "9043047266", tel: "9043047266" },
			{ display: "044-35642646", tel: "04435642646" },
		],
		mapsUrl: "https://maps.app.goo.gl/arPLnDvLWizfWch17",
		mapsEmbedSrc:
			"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d284.199141610584!2d80.22670791116917!3d12.80772376770231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525b6f96e7e3e1%3A0x3919676bb609ed1c!2sDB%20Enhance!5e0!3m2!1sen!2sin!4v1786890045955!5m2!1sen!2sin",
		primaryPhone: {
			display: "9043047266",
			tel: "9043047266",
			whatsappE164: "919043047266",
		},
		hours: {
			weekdays: "Mon–Fri: 10 AM – 9 PM",
			weekend: "Sat–Sun: 9 AM – 9 PM",
		},
	},
};

/** Ordered for UI: default city first. */
export const LOCATION_ORDER: CityId[] = ["bangalore", "chennai"];

export function getDefaultLocation(): SalonLocation {
	return LOCATIONS[DEFAULT_CITY_ID];
}

export function getLocationsInOrder(): SalonLocation[] {
	return LOCATION_ORDER.map((id) => LOCATIONS[id]);
}

export function whatsappUrl(location: SalonLocation = getDefaultLocation()): string {
	return `https://wa.me/${location.primaryPhone.whatsappE164}`;
}

export const APPOINTMENT_SERVICE_OPTIONS = [
	"Hair Patch",
	"Hair Extension",
	"Hair Fixing / Systems",
	"Salon Hair (Cut / Colour / Spa)",
	"Nail Care",
	"Bridal Make Up",
	"Skin & Beauty",
	"Men's Grooming",
	"Other",
] as const;
