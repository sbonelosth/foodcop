import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { Product } from "../types";
import { getFlagEmoji } from "../utils/flagUtils";

interface ProductDisplayProps {
	product: Product | null;
	isLoading: boolean;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({
	product,
	isLoading,
}) => {
	if (isLoading) {
		return (
			<div className="animate-pulse mt-6 space-y-4">
				<div className="h-48 bg-gray-200 rounded-lg"></div>
				<div className="h-4 bg-gray-200 rounded w-3/4"></div>
				<div className="h-4 bg-gray-200 rounded w-1/2"></div>
			</div>
		);
	}

	if (!product) return null;

	const showCounterfeitWarning = !product.isValid && !product.found;

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold capitalize">
					{product.isValid && product.name}
					{!product.isValid && "Unknown Product"}
				</h2>
				{product.isValid && product.found ? (
					product.isFood ? (
						<div className="flex items-center space-x-1">
							<span className="text-xs font-medium text-green-600">Safe</span>
							<CheckCircle className="w-4 h-4 text-green-500" />
						</div>
					) : (
						<div className="flex items-center space-x-1">
							<span className="text-xs font-medium text-yellow-600">Non-Food</span>
							<AlertTriangle className="w-4 h-4 text-yellow-500" />
						</div>
					)
				) : (
					<div className="flex items-center space-x-1">
						<span className="text-xs font-medium text-red-600">Not Safe</span>
						<AlertTriangle className="w-4 h-4 text-red-500" />
					</div>
				)}
			</div>

			{product.image && product.name !== "Non-food Product" && (
				<img
					src={product.image}
					alt={product.name}
					className="w-full h-60 object-contain rounded-lg bg-gray-200"
				/>
			)}

			<div className="space-y-2">
				{product.countryCode && product.name !== "Non-food Product" && (
					<>
						<div className="flex items-center space-x-2">
							<span className="font-medium">Manufacturer:</span>
							<span>{product.manufacturer}</span>
						</div>

						<div className="flex items-center space-x-2">
							<span className="font-medium">
								Country of Origin:
							</span>
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

						<div className="flex items-center space-x-2">
							<span className="font-medium">Allergens:</span>
							<span className="capitalize">{product.allergens}</span>
						</div>
					</>
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
