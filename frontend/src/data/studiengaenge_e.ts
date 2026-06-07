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
		name: "Angewandte Informatik",
		url: "https://www.rwu.de/studium/studiengaenge/angewandte-informatik",
		level: "Bachelor",
	},
	{
		id: "em",
		code: "EM",
		name: "Elektromobilität und Erneuerbare Energien",
		url: "https://www.rwu.de/studium/studiengaenge/e-mobility-and-green-energy-en",
		level: "Bachelor",
	},
	{
		id: "ei",
		code: "EI",
		name: "Elektrotechnik und Informationstechnik",
		url: "https://www.rwu.de/studium/studiengaenge/electrical-engineering-and-information-technology-en",
		level: "Bachelor",
	},
	{
		id: "ip",
		code: "IP",
		name: "Informatik und Elektrotechnik (Lehramt)",
		url: "https://www.rwu.de/studium/studiengaenge/informatikelektrotechnik-plus-lehramt",
		level: "Bachelor",
	},
	{
		id: "io",
		code: "IO",
		name: "Internet & Online Marketing",
		url: "https://www.rwu.de/studium/studiengaenge/internet-online-marketing",
		level: "Bachelor",
	},
	{
		id: "md",
		code: "MD",
		name: "Medien Design",
		url: "https://www.rwu.de/studium/studiengaenge/mediendesign",
		level: "Bachelor",
	},
	{
		id: "wi",
		code: "WI",
		name: "Wirtschaftsinformatik",
		url: "https://www.rwu.de/studieren/studiengaenge/wirtschaftsinformatik-bsc",
		level: "Bachelor",
	},
	{
		id: "wp",
		code: "WP",
		name: "Wirtschaftsinformatik (Lehramt)",
		url: "https://www.rwu.de/studium/studiengaenge/wirtschaftsinformatik-plus-lehramt",
		level: "Bachelor",
	},
];

export const masterPrograms: StudyProgram[] = [
	{
		id: "emm",
		code: "EMM",
		name: "Elektrotechnik und Eingebettete Systeme",
		url: "https://www.rwu.de/studium/studiengaenge/electrical-engineering-and-embedded-systems-en",
		level: "Master",
	},
	{
		id: "in",
		code: "IN",
		name: "Informatik (Master)",
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

