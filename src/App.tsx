import { useState } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import ManualInput from "./components/ManualInput";
import { validateBarcode, fetchProductInfo } from "./utils/barcodeUtils";
import type { Product } from "./types";
import logo from "../public/assets/logo.svg";

export default function App() {
	const [showManualInput, setShowManualInput] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [product, setProduct] = useState<Product | null>(null);

	const handleBarcodeSubmit = async (inputBarcode: string) => {
		setIsLoading(true);
		const { isValid, countryCode, countryName } = validateBarcode(inputBarcode);

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

	if (showManualInput) {
		return (
			<div className="min-h-screen bg-gray-100">
				<img src={logo} alt="logo" className="mx-auto w-1/2 logo pt-4" />
				<ManualInput
					onSubmit={handleBarcodeSubmit}
					onBackToCamera={() => setShowManualInput(false)}
					product={product}
					isLoading={isLoading}
				/>
				<div className="h-[10vh]"></div>
				<footer className="bg-gray-800 text-white py-4 text-center fixed bottom-0 w-full">
					<p className="text-xs">
						Made with ❤️ by{" "}
						<a href="https://goto.now/DqsxT" className="underline pointer">
							abumanga project
						</a>{" "}
						<br />
						&copy; {new Date().getFullYear()} FoodCop. All rights reserved.
					</p>
				</footer>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black">
			{/* Logo overlay */}
			<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
				<img src={logo} alt="FoodCop" className="w-32 h-auto" />
			</div>

			<BarcodeScanner
				isOpen={true}
				onClose={() => {}} // No close functionality since this is the main interface
				onScan={handleBarcodeSubmit}
				setShowManualInput={setShowManualInput}
			/>
		</div>
	);
}