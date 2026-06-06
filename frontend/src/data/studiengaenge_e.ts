// Studiengänge (englische Version) – Platzhalterdaten für Komponenten
export type StudyProgram = {
	id: string;
	code: string;
	name: string;
	url: string;
	level: "Bachelor" | "Master";
};

export const bachelorPrograms: StudyProgram[] = [
	{
		id: "ai",
		code: "AI",
		name: "Applied Computer Science",
		url: "https://www.rwu.de/studieren/studiengaenge/angewandte-informatik?destination=/hochschule/fakultaeten/elektrotechnik-und-informatik",
		level: "Bachelor",
	},
	{
		id: "em",
		code: "EM",
		name: "Electromobility and Renewable Energies",
		url: "https://www.rwu.de/studieren/studiengaenge/elektromobilitaet-und-regenerative-energien-de?destination=/hochschule/fakultaeten/elektrotechnik-und-informatik",
		level: "Bachelor",
	},
	{
		id: "ei",
		code: "EI",
		name: "Electrical Engineering and Information Technology",
		url: "https://www.rwu.de/studieren/studiengaenge/elektrotechnik-und-informationstechnik-de?destination=/hochschule/fakultaeten/elektrotechnik-und-informatik",
		level: "Bachelor",
	},
	{
		id: "ip",
		code: "IP",
		name: "Computer Science & Electrical Engineering (Teaching)",
		url: "https://www.rwu.de/studieren/studiengaenge/informatik-elektrotechnik-plus-lehramt?destination=/hochschule/fakultaeten/elektrotechnik-und-informatik",
		level: "Bachelor",
	},
	{
		id: "io",
		code: "IO",
		name: "Internet and Online Marketing",
		url: "https://www.rwu.de/studieren/studiengaenge/internet-online-marketing?destination=/hochschule/fakultaeten/elektrotechnik-und-informatik",
		level: "Bachelor",
	},
	{
		id: "md",
		code: "MD",
		name: "Media Design & Digital Creation",
		url: "https://www.rwu.de/studieren/studiengaenge/mediendesign-digitale-gestaltung?destination=/hochschule/fakultaeten/elektrotechnik-und-informatik",
		level: "Bachelor",
	},
	{
		id: "wi",
		code: "WI",
		name: "Business Informatics",
		url: "https://www.rwu.de/studieren/studiengaenge/wirtschaftsinformatik-bsc?destination=/hochschule/fakultaeten/elektrotechnik-und-informatik",
		level: "Bachelor",
	},
	{
		id: "wp",
		code: "WP",
		name: "Business Informatics (Teaching)",
		url: "https://www.rwu.de/studieren/studiengaenge/wirtschafts-informatik-plus-lehramt?destination=/hochschule/fakultaeten/elektrotechnik-und-informatik",
		level: "Bachelor",
	},
];

export const masterPrograms: StudyProgram[] = [
	{
		id: "emm",
		code: "EMM",
		name: "Electrical Engineering and Embedded Systems",
		url: "https://www.rwu.de/studieren/studiengaenge/electrical-engineering-and-embedded-systems-en",
		level: "Master",
	},
	{
		id: "in",
		code: "IN",
		name: "Computer Science",
		url: "https://www.rwu.de/studieren/studiengaenge/informatik?destination=/hochschule/fakultaeten/elektrotechnik-und-informatik",
		level: "Master",
	},
	{
		id: "mm",
		code: "MM",
		name: "Mechatronics",
		url: "https://www.rwu.de/studieren/studiengaenge/mechatronics-en?destination=/hochschule/fakultaeten/elektrotechnik-und-informatik",
		level: "Master",
	},
	{
		id: "db",
		code: "DB",
		name: "Digital Business",
		url: "https://www.rwu.de/studieren/studiengaenge/digital-business",
		level: "Master",
	},
];

export const allPrograms: StudyProgram[] = [...bachelorPrograms, ...masterPrograms];

