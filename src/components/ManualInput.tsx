import React, { useState } from "react";
import { Loader2, ScanBarcode } from "lucide-react";
import ProductDisplay from "./ProductDisplay";
import type { Product } from "../types";

interface ManualInputProps {
	onSubmit: (barcode: string) => void;
	onBackToCamera: () => void;
	product: Product | null;
	isLoading: boolean;
}

const ManualInput: React.FC<ManualInputProps> = ({
	onSubmit,
	onBackToCamera,
	product,
	isLoading,
}) => {
	const [barcode, setBarcode] = useState("");

	const handleSubmit = () => {
		if (barcode.length === 8 || barcode.length === 13) {
			onSubmit(barcode);
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-4">
			<div className="bg-white rounded-lg shadow-lg p-6">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-lg font-bold text-gray-900">
						Product Scanner
					</h1>
					<button
						onClick={onBackToCamera}
						className="p-2 text-black rounded-lg hover:bg-gray-600/40 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						title="Back to camera"
					>
						<ScanBarcode className="w-6 h-6" />
					</button>
				</div>

				<div className="space-y-4">
					<div className="flex space-x-4">
						<input
							type="text"
							value={barcode}
							onChange={(e) => setBarcode(e.target.value)}
							placeholder="Enter barcode (8 or 13 digits)"
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							maxLength={13}
							onKeyPress={(e) => {
								if (e.key === "Enter") {
									handleSubmit();
								}
							}}
						/>
					</div>

					<button
						onClick={handleSubmit}
						disabled={
							isLoading || (barcode.length !== 8 && barcode.length !== 13)
						}
						className="w-full px-4 py-2 bg-[#8CC342E1] text-white rounded-lg hover:bg-[#8CC342] focus:ring-2 focus:ring-[#8CC342] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
					>
						{isLoading ? (
							<>
								<Loader2 className="w-5 h-5 animate-spin mr-2" />
								Checking...
							</>
						) : (
							"Check Product"
						)}
					</button>
				</div>
			</div>

			<ProductDisplay product={product} isLoading={isLoading} />
		</div>
	);
};

export default ManualInput