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
		url: "https://www.rwu.de/studium/studiengaenge/angewandte-informatik",
		level: "Bachelor",
	},
	{
		id: "em",
		code: "EM",
		name: "Electromobility and Renewable Energies",
		url: "https://www.rwu.de/studium/studiengaenge/e-mobility-and-green-energy-en",
		level: "Bachelor",
	},
	{
		id: "ei",
		code: "EI",
		name: "Electrical Engineering and Information Technology",
		url: "https://www.rwu.de/studium/studiengaenge/electrical-engineering-and-information-technology-en",
		level: "Bachelor",
	},
	{
		id: "ip",
		code: "IP",
		name: "Computer Science & Electrical Engineering (Teaching)",
		url: "https://www.rwu.de/studium/studiengaenge/informatikelektrotechnik-plus-lehramt",
		level: "Bachelor",
	},
	{
		id: "io",
		code: "IO",
		name: "Internet and Online Marketing",
		url: "https://www.rwu.de/studium/studiengaenge/internet-online-marketing",
		level: "Bachelor",
	},
	{
		id: "md",
		code: "MD",
		name: "Media Design & Digital Creation",
		url: "https://www.rwu.de/studium/studiengaenge/mediendesign",
		level: "Bachelor",
	},
	{
		id: "wi",
		code: "WI",
		name: "Business Informatics",
		url: "https://www.rwu.de/studieren/studiengaenge/wirtschaftsinformatik-bsc",
		level: "Bachelor",
	},
	{
		id: "wp",
		code: "WP",
		name: "Business Informatics (Teaching)",
		url: "https://www.rwu.de/studium/studiengaenge/wirtschaftsinformatik-plus-lehramt",
		level: "Bachelor",
	},
];

export const masterPrograms: StudyProgram[] = [
	{
		id: "emm",
		code: "EMM",
		name: "Electrical Engineering and Embedded Systems",
		url: "https://www.rwu.de/studium/studiengaenge/electrical-engineering-and-embedded-systems-en",
		level: "Master",
	},
	{
		id: "in",
		code: "IN",
		name: "Computer Science",
		url: "https://www.rwu.de/studium/studiengaenge/informatik",
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
		url: "https://www.rwu.de/studium/studiengaenge/digital-business-marketing-intelligence",
		level: "Master",
	},
];

export const allPrograms: StudyProgram[] = [...bachelorPrograms, ...masterPrograms];

