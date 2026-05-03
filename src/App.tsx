import { useState } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import ManualInput from "./components/ManualInput";
import { validateBarcode, fetchProductInfo } from "./utils/barcodeUtils";
import type { Product } from "./types";
import logo from "../public/assets/foodcop.png";

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
				<footer className="bg-gray-800 text-white py-4 text-center w-full mx-0">
					<p className="text-xs">
						Made with ❤️ by{" "}
						<a href="https://sbonelo.vercel.app" className="underline pointer" target="_blank">
							abumanga project
						</a>{" "}
						<br />
						<p className="text-xs pb-1">
							Powered by <a href="https://world.openfoodfacts.org/" className="underline pointer" target="_blank">Open Food Facts</a>
						</p>
						{/* devider */}
						<hr className="w-[95%] my-2 mx-auto" />
						&copy; {new Date().getFullYear()} FoodCop. All rights reserved.
					</p>
				</footer>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<BarcodeScanner
				isOpen={true}
				onScan={handleBarcodeSubmit}
				setShowManualInput={setShowManualInput}
			/>
		</div>
	);
}