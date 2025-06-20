import { useState } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import ManualInput from "./components/ManualInput";
import { validateBarcode, fetchProductInfo } from "./utils/barcodeUtils";
import type { Product } from "./types";
import logo from "../public/assets/logo.svg";
import rsa from "../public/assets/world.png"

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
				<div className="absolute right-2 top-2 text-2xl">
					<img src={rsa} alt="RSA" className="w-8 aspect-square border border-1 border-gray-800/50 rounded-full" />
				</div>
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
						<a href="https://sbonelo.vercel.app" className="underline pointer">
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
		<div className="min-h-screen">
			<BarcodeScanner
				isOpen={true}
				onScan={handleBarcodeSubmit}
				setShowManualInput={setShowManualInput}
			/>
		</div>
	);
}