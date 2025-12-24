// lib/currencyCategories.ts

export type CurrencyCategory = 'Fiat' | 'Crypto' | 'Commodity';

export interface CurrencyDefinition {
	code: string;
	name: string;
	symbol: string;
	decimals: number;
}

export type CurrencyMap = Record<string, CurrencyDefinition[]>;

export const currencyCategories: CurrencyMap = {
	// 💵 TRADITIONAL GOVERNMENT BACKED CURRENCIES
	Fiat: [
		{ code: 'USD', name: 'United States Dollar', symbol: '$', decimals: 2 },
		{ code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
		{ code: 'GBP', name: 'British Pound Sterling', symbol: '£', decimals: 2 },
		{ code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
		{ code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
		{ code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
		{ code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2 },
		{ code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', decimals: 2 },
		{ code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2 },
		{ code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
		{ code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2 },
		{ code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0 },
		{ code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2 },
		{ code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2 },
		{ code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
		{ code: 'MXN', name: 'Mexican Peso', symbol: '$', decimals: 2 },
		{ code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', decimals: 2 },
		{ code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2 },
		{ code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
		{ code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2 },
		{ code: 'PLN', name: 'Polish Złoty', symbol: 'zł', decimals: 2 },
		{ code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2 },
		{ code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 2 },
		{ code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimals: 2 },
		{ code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2 },
		{ code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', decimals: 2 },
		{ code: 'CLP', name: 'Chilean Peso', symbol: '$', decimals: 0 },
		{ code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimals: 2 },
		{ code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'dh', decimals: 2 },
		{ code: 'COP', name: 'Colombian Peso', symbol: '$', decimals: 2 },
		{ code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2 },
		{ code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2 },
		{ code: 'RON', name: 'Romanian Leu', symbol: 'lei', decimals: 2 },
		{ code: 'VND', name: 'Vietnamese Đồng', symbol: '₫', decimals: 0 },
		{ code: 'ARS', name: 'Argentine Peso', symbol: '$', decimals: 2 },
		{ code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2 },
		{ code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2 },
		{ code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimals: 2 },
		{ code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimals: 2 },
		{ code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimals: 2 },
	],

	// ⛓️ CRYPTOCURRENCIES (Blue chips & Major Chains)
	Crypto: [
		{ code: 'BTC', name: 'Bitcoin', symbol: '₿', decimals: 8 },
		{ code: 'ETH', name: 'Ethereum', symbol: 'Ξ', decimals: 18 },
		{ code: 'USDT', name: 'Tether', symbol: '₮', decimals: 6 },
		{ code: 'BNB', name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
		{ code: 'SOL', name: 'Solana', symbol: 'SOL', decimals: 9 },
		{ code: 'USDC', name: 'USD Coin', symbol: '$', decimals: 6 },
		{ code: 'XRP', name: 'Ripple', symbol: 'XRP', decimals: 6 },
		{ code: 'ADA', name: 'Cardano', symbol: '₳', decimals: 6 },
		{ code: 'AVAX', name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
		{ code: 'DOGE', name: 'Dogecoin', symbol: 'Ð', decimals: 8 },
		{ code: 'DOT', name: 'Polkadot', symbol: 'DOT', decimals: 10 },
		{ code: 'TRX', name: 'TRON', symbol: 'TRX', decimals: 6 },
		{ code: 'MATIC', name: 'Polygon', symbol: 'MATIC', decimals: 18 },
		{ code: 'LTC', name: 'Litecoin', symbol: 'Ł', decimals: 8 },
		{ code: 'SHIB', name: 'Shiba Inu', symbol: 'SHIB', decimals: 18 },
		{ code: 'DAI', name: 'Dai', symbol: '◈', decimals: 18 },
		{ code: 'BCH', name: 'Bitcoin Cash', symbol: 'Ƀ', decimals: 8 },
		{ code: 'ATOM', name: 'Cosmos', symbol: 'ATOM', decimals: 6 },
		{ code: 'UNI', name: 'Uniswap', symbol: 'UNI', decimals: 18 },
		{ code: 'LINK', name: 'Chainlink', symbol: 'LINK', decimals: 18 },
		{ code: 'XLM', name: 'Stellar', symbol: '*', decimals: 7 },
		{ code: 'XMR', name: 'Monero', symbol: '♏', decimals: 12 },
	],

	// 🏆 COMMODITIES & PRECIOUS METALS (ISO 4217 Standard Codes)
	Commodity: [
		{ code: 'XAU', name: 'Gold (Troy Ounce)', symbol: 'Au', decimals: 2 },
		{ code: 'XAG', name: 'Silver (Troy Ounce)', symbol: 'Ag', decimals: 2 },
		{ code: 'XPT', name: 'Platinum (Troy Ounce)', symbol: 'Pt', decimals: 2 },
		{ code: 'XPD', name: 'Palladium (Troy Ounce)', symbol: 'Pd', decimals: 2 },
		{ code: 'XCU', name: 'Copper', symbol: 'Cu', decimals: 2 },
		{ code: 'CL', name: 'Crude Oil (WTI)', symbol: '🛢️', decimals: 2 },
		{ code: 'BRN', name: 'Brent Crude Oil', symbol: '🛢️', decimals: 2 },
		{ code: 'NG', name: 'Natural Gas', symbol: '🔥', decimals: 2 },
	],
};
