const GS1_PREFIXES = {
	"0": { code: "US", name: "USA and Canada" },
	"1": { code: "US", name: "USA" },
	"30-37": { code: "FR", name: "France and Monaco" },
	"380": { code: "BG", name: "Bulgaria" },
	"383": { code: "SI", name: "Slovenia" },
	"385": { code: "HR", name: "Croatia" },
	"387": { code: "BA", name: "Bosnia and Herzegovina" },
	"389": { code: "ME", name: "Montenegro" },
	"40-44": { code: "DE", name: "Germany" },
	"45": { code: "JP", name: "Japan" },
	"46": { code: "RU", name: "Russia" },
	"470": { code: "KG", name: "Kyrgyzstan" },
	"471": { code: "TW", name: "Taiwan" },
	"474": { code: "EE", name: "Estonia" },
	"475": { code: "LV", name: "Latvia" },
	"476": { code: "AZ", name: "Azerbaijan" },
	"477": { code: "LT", name: "Lithuania" },
	"478": { code: "UZ", name: "Uzbekistan" },
	"479": { code: "LK", name: "Sri Lanka" },
	"480": { code: "PH", name: "Philippines" },
	"481": { code: "BY", name: "Belarus" },
	"482": { code: "UA", name: "Ukraine" },
	"483": { code: "TM", name: "Turkmenistan" },
	"484": { code: "MD", name: "Moldova" },
	"485": { code: "AM", name: "Armenia" },
	"486": { code: "GE", name: "Georgia" },
	"487": { code: "KZ", name: "Kazakhstan" },
	"488": { code: "TJ", name: "Tajikistan" },
	"489": { code: "HK", name: "Hong Kong" },
	"49": { code: "JP", name: "Japan" },
	"50": { code: "GB", name: "United Kingdom" },
	"520-521": { code: "GR", name: "Greece" },
	"528": { code: "LB", name: "Lebanon" },
	"529": { code: "CY", name: "Cyprus" },
	"530": { code: "AL", name: "Albania" },
	"531": { code: "MK", name: "North Macedonia" },
	"535": { code: "MT", name: "Malta" },
	"539": { code: "IE", name: "Ireland" },
	"54": { code: "BE", name: "Belgium and Luxembourg" },
	"560": { code: "PT", name: "Portugal" },
	"569": { code: "IS", name: "Iceland" },
	"57": { code: "DK", name: "Denmark" },
	"590": { code: "PL", name: "Poland" },
	"594": { code: "RO", name: "Romania" },
	"599": { code: "HU", name: "Hungary" },
	"600-601": { code: "ZA", name: "South Africa" },
	"603": { code: "GH", name: "Ghana" },
	"604": { code: "SN", name: "Senegal" },
	"608": { code: "BH", name: "Bahrain" },
	"609": { code: "MU", name: "Mauritius" },
	"611": { code: "MA", name: "Morocco" },
	"613": { code: "DZ", name: "Algeria" },
	"615": { code: "NG", name: "Nigeria" },
	"616": { code: "KE", name: "Kenya" },
	"618": { code: "CI", name: "Côte d'Ivoire" },
	"619": { code: "TN", name: "Tunisia" },
	"620": { code: "TZ", name: "Tanzania" },
	"621": { code: "SY", name: "Syria" },
	"622": { code: "EG", name: "Egypt" },
	"623": { code: "BN", name: "Brunei" },
	"624": { code: "LY", name: "Libya" },
	"625": { code: "JO", name: "Jordan" },
	"626": { code: "IR", name: "Iran" },
	"627": { code: "KW", name: "Kuwait" },
	"628": { code: "SA", name: "Saudi Arabia" },
	"629": { code: "AE", name: "United Arab Emirates" },
	"630": { code: "QA", name: "Qatar" },
	"64": { code: "FI", name: "Finland" },
	"69": { code: "CN", name: "China" },
	"70": { code: "NO", name: "Norway" },
	"729": { code: "IL", name: "Israel" },
	"73": { code: "SE", name: "Sweden" },
	"740": { code: "GT", name: "Guatemala" },
	"741": { code: "SV", name: "El Salvador" },
	"742": { code: "HN", name: "Honduras" },
	"743": { code: "NI", name: "Nicaragua" },
	"744": { code: "CR", name: "Costa Rica" },
	"745": { code: "PA", name: "Panama" },
	"746": { code: "DO", name: "Dominican Republic" },
	"750": { code: "MX", name: "Mexico" },
	"754-755": { code: "CA", name: "Canada" },
	"759": { code: "VE", name: "Venezuela" },
	"76": { code: "CH", name: "Switzerland and Liechtenstein" },
	"770-771": { code: "CO", name: "Colombia" },
	"773": { code: "UY", name: "Uruguay" },
	"775": { code: "PE", name: "Peru" },
	"777": { code: "BO", name: "Bolivia" },
	"778-779": { code: "AR", name: "Argentina" },
	"780": { code: "CL", name: "Chile" },
	"784": { code: "PY", name: "Paraguay" },
	"786": { code: "EC", name: "Ecuador" },
	"789-790": { code: "BR", name: "Brazil" },
	"80-83": { code: "IT", name: "Italy, San Marino, and Vatican City" },
	"84": { code: "ES", name: "Spain and Andorra" },
	"850": { code: "CU", name: "Cuba" },
	"858": { code: "SK", name: "Slovakia" },
	"859": { code: "CZ", name: "Czech Republic" },
	"860": { code: "RS", name: "Serbia" },
	"865": { code: "MN", name: "Mongolia" },
	"867": { code: "KP", name: "North Korea" },
	"868-869": { code: "TR", name: "Turkey" },
	"87": { code: "NL", name: "Netherlands" },
	"880": { code: "KR", name: "South Korea" },
	"883": { code: "MM", name: "Myanmar" },
	"884": { code: "KH", name: "Cambodia" },
	"885": { code: "TH", name: "Thailand" },
	"888": { code: "SG", name: "Singapore" },
	"890": { code: "IN", name: "India" },
	"893": { code: "VN", name: "Vietnam" },
	"894": { code: "BD", name: "Bangladesh" },
	"896": { code: "PK", name: "Pakistan" },
	"899": { code: "ID", name: "Indonesia" },
	"90-91": { code: "AT", name: "Austria" },
	"93": { code: "AU", name: "Australia" },
	"94": { code: "NZ", name: "New Zealand" },
	"955": { code: "MY", name: "Malaysia" },
	"958": { code: "MO", name: "Macau" },
};

export const validateBarcode = (
	barcode: string
): { isValid: boolean; countryCode: string; countryName: string } => {
	if (!/^\d{8}|\d{13}$/.test(barcode)) {
		return { isValid: false, countryCode: "", countryName: "" };
	}

	const prefix = barcode.slice(0, 3);
	let countryCode = "";
	let countryName = "";

	for (const [range, country] of Object.entries(GS1_PREFIXES)) {
		const [start, end] = range.split("-");
		const prefixNum = parseInt(prefix, 10);

		if (end) {
			if (
				prefixNum >= parseInt(start, 10) &&
				prefixNum <= parseInt(end, 10)
			) {
				countryCode = country.code;
				countryName = country.name;
				break;
			}
		} else if (prefix.startsWith(start)) {
			countryCode = country.code;
			countryName = country.name;
			break;
		}
	}

	return {
		isValid: countryCode !== "",
		countryCode,
		countryName,
	};
};

export const fetchProductInfo = async (barcode: string): Promise<any> => {
	try {
		const response = await fetch(
			`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
		);
        
		const data = await response.json();

		if (data.status === 1) {
			return {
				name: data.product.product_name || "Unknown Product",
				manufacturer:
					data.product.brands ||
					data.product.brand_owner ||
					"Unknown Manufacturer",
				image: data.product.image_url,
				found: true,
			};
		}

		throw new Error("Product not found");
	} catch (error) {
		return {
			name: "Unknown Product",
			manufacturer: "Unknown Manufacturer",
			image: undefined,
			found: false,
		};
	}
};
