import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { Product } from "../types";

interface ProductDisplayProps {
	product: Product | null;
	isLoading: boolean;
}

const getFlagEmoji = (countryCode: string) => {
	const codePoints = countryCode
		.toUpperCase()
		.split("")
		.map((char) => 127397 + char.charCodeAt(0));
	return String.fromCodePoint(...codePoints);
};

const ProductDisplay: React.FC<ProductDisplayProps> = ({
	product,
	isLoading,
}) => {
	if (isLoading) {
		return (
			<div className="animate-pulse space-y-4">
				<div className="h-48 bg-gray-200 rounded-lg"></div>
				<div className="h-4 bg-gray-200 rounded w-3/4"></div>
				<div className="h-4 bg-gray-200 rounded w-1/2"></div>
			</div>
		);
	}

	if (!product) return null;

	const showCounterfeitWarning = !product.isValid && !product.found;

	return (
		<div className="bg-gray-100 rounded-lg p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold capitalize">
					{product.name}
				</h2>
				{product.isValid && product.found && (
					<div className="flex items-center space-x-2">
						<span className="text-sm font-medium text-green-500">
							Safe
						</span>
						<CheckCircle className="w-6 h-6 text-green-500" />
					</div>
				)}
				{showCounterfeitWarning && (
					<div className="flex items-center space-x-2">
						<span className="text-sm font-medium text-yellow-500">
							Not Safe
						</span>
						<AlertTriangle className="w-6 h-6 text-yellow-500" />
					</div>
				)}
			</div>

			{product.image && (
				<img
					src={product.image}
					alt={product.name}
					className="w-full h-60 object-contain rounded-lg bg-gray-200"
				/>
			)}

			<div className="space-y-2">
				<div className="flex items-center space-x-2">
					<span className="font-medium">Manufacturer:</span>
					<span>{product.manufacturer}</span>
				</div>

				{product.countryCode && (
					<div className="flex items-center space-x-2">
						<span className="font-medium">Country of Origin:</span>
						<div className="flex items-center space-x-2">
							<span
								className="text-2xl"
								role="img"
								aria-label={`${product.countryName} flag`}>
								{getFlagEmoji(product.countryCode)}
							</span>
							<span>{product.countryName}</span>
						</div>
					</div>
				)}

				{showCounterfeitWarning && (
					<div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-700 text-sm">
							Warning: This product's barcode doesn't match GS1
							database records. It might be counterfeit.
						</p>
					</div>
				)}

				{!product.isValid && product.found && (
					<div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<p className="text-yellow-700 text-sm">
							Note: This product was found in the database but its
							prefix doesn't match the expected country of origin.
							This might indicate a parallel import or repackaged
							product.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductDisplay;
