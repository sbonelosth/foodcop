import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import BarcodeScanner from "./components/BarcodeScanner";
import ProductDisplay from "./components/ProductDisplay";
import { validateBarcode, fetchProductInfo } from "./utils/barcodeUtils";
import type { Product } from "./types";

export default function App() {
	const [barcode, setBarcode] = useState("");
	const [isScannerOpen, setScannerOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [product, setProduct] = useState<Product | null>(null);

	const handleBarcodeSubmit = async (inputBarcode: string) => {
		setIsLoading(true);
		const { isValid, countryCode, countryName } =
			validateBarcode(inputBarcode);

		try {
			const productInfo = await fetchProductInfo(inputBarcode);
			setProduct({
				...productInfo,
				isValid,
				countryCode,
				countryName,
			});
		} catch (error) {
			console.error("Error fetching product info:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="max-w-2xl mx-auto p-4 space-y-6 mt-12">
				<div className="bg-white rounded-lg shadow-lg p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
						Product Verification
					</h1>

					<div className="space-y-4">
						<div className="flex space-x-4">
							<input
								type="text"
								value={barcode}
								onChange={(e) => setBarcode(e.target.value)}
								placeholder="Enter barcode number"
								className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								maxLength={13}
							/>
							<button
								onClick={() => setScannerOpen(true)}
								className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
								<Camera className="w-5 h-5" />
							</button>
						</div>

						<button
							onClick={() => handleBarcodeSubmit(barcode)}
							disabled={
								isLoading ||
								(barcode.length !== 8 && barcode.length !== 13)
							}
							className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
							{isLoading ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin mr-2" />
									Verifying...
								</>
							) : (
								"Verify Barcode"
							)}
						</button>
					</div>
				</div>

				<ProductDisplay product={product} isLoading={isLoading} />

				<BarcodeScanner
					isOpen={isScannerOpen}
					onClose={() => setScannerOpen(false)}
					onScan={(scannedBarcode) => {
						setBarcode(scannedBarcode);
						handleBarcodeSubmit(scannedBarcode);
					}}
				/>
			</div>
			{/* App purpose */}
			<p className="max-w-2xl mx-auto mt-8 text-lg text-center text-gray-600 font-semibold">
				Check the validity of a product using its barcode.
			</p>
			<footer className="bg-gray-800 text-white py-4 text-center fixed bottom-0 w-full">
				<p className="text-sm">
					Made with ❤️ by abumanga project <br />
					&copy; {new Date().getFullYear()} Food Check. All rights
					reserved.
				</p>
			</footer>
		</div>
	);
}
