export interface Product {
    name: string;
	manufacturer: string;
	allergens?: string;
	image?: string;
	countryCode: string;
	countryName: string;
	isValid: boolean;
	found: boolean;
}

export interface ScanResult {
	text: string;
	format: string;
}
