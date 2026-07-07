/**
 * Pure-TypeScript BlurHash decoder.
 *
 * Decoding a hash into a tiny placeholder bitmap is cheap and runs on every media
 * view, so we do it in plain TS rather than paying to download/instantiate the WASM
 * module on read-heavy pages (the WASM path is reserved for *encoding* at upload
 * time — see apps/web/utils/processors/blurhash.ts).
 *
 * Algorithm ported from the reference implementation (woltapp/blurhash, MIT).
 */

const DIGITS =
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~';

function decode83(str: string): number {
	let value = 0;
	for (let i = 0; i < str.length; i++) {
		const digit = DIGITS.indexOf(str[i]);
		value = value * 83 + digit;
	}
	return value;
}

function sRGBToLinear(value: number): number {
	const v = value / 255;
	return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearTosRGB(value: number): number {
	const v = Math.max(0, Math.min(1, value));
	return v <= 0.0031308
		? Math.round(v * 12.92 * 255 + 0.5)
		: Math.round((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5);
}

const signPow = (val: number, exp: number): number => Math.sign(val) * Math.pow(Math.abs(val), exp);

function decodeDC(value: number): [number, number, number] {
	return [sRGBToLinear(value >> 16), sRGBToLinear((value >> 8) & 255), sRGBToLinear(value & 255)];
}

function decodeAC(value: number, maximumValue: number): [number, number, number] {
	const quantR = Math.floor(value / (19 * 19));
	const quantG = Math.floor(value / 19) % 19;
	const quantB = value % 19;
	return [
		signPow((quantR - 9) / 9, 2) * maximumValue,
		signPow((quantG - 9) / 9, 2) * maximumValue,
		signPow((quantB - 9) / 9, 2) * maximumValue,
	];
}

/** Cheap structural validation — rejects malformed hashes before decoding. */
export function isValidBlurhash(blurhash?: string | null): blurhash is string {
	if (!blurhash || blurhash.length < 6) return false;
	const sizeFlag = decode83(blurhash[0]);
	const numX = (sizeFlag % 9) + 1;
	const numY = Math.floor(sizeFlag / 9) + 1;
	return blurhash.length === 4 + 2 * numX * numY;
}

/**
 * Decode a BlurHash into RGBA pixels.
 * @returns a `Uint8ClampedArray` of `width * height * 4` bytes, or `null` if invalid.
 */
export function decodeBlurhash(
	blurhash: string,
	width: number,
	height: number,
	punch = 1,
): Uint8ClampedArray | null {
	if (!isValidBlurhash(blurhash)) return null;

	const sizeFlag = decode83(blurhash[0]);
	const numX = (sizeFlag % 9) + 1;
	const numY = Math.floor(sizeFlag / 9) + 1;
	const maximumValue = (decode83(blurhash[1]) + 1) / 166;

	const colors: [number, number, number][] = new Array(numX * numY);
	for (let i = 0; i < colors.length; i++) {
		if (i === 0) {
			colors[i] = decodeDC(decode83(blurhash.substring(2, 6)));
		} else {
			const value = decode83(blurhash.substring(4 + i * 2, 6 + i * 2));
			colors[i] = decodeAC(value, maximumValue * punch);
		}
	}

	const pixels = new Uint8ClampedArray(width * height * 4);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let r = 0, g = 0, b = 0;
			for (let j = 0; j < numY; j++) {
				for (let i = 0; i < numX; i++) {
					const basis = Math.cos((Math.PI * x * i) / width) *
						Math.cos((Math.PI * y * j) / height);
					const color = colors[i + j * numX];
					r += color[0] * basis;
					g += color[1] * basis;
					b += color[2] * basis;
				}
			}
			const idx = 4 * (x + y * width);
			pixels[idx] = linearTosRGB(r);
			pixels[idx + 1] = linearTosRGB(g);
			pixels[idx + 2] = linearTosRGB(b);
			pixels[idx + 3] = 255;
		}
	}
	return pixels;
}

/** Paints a decoded BlurHash onto a canvas at the given resolution. */
export function paintBlurhash(
	canvas: HTMLCanvasElement,
	blurhash: string,
	width = 32,
	height = 32,
	punch = 1,
): boolean {
	const pixels = decodeBlurhash(blurhash, width, height, punch);
	if (!pixels) return false;
	const ctx = canvas.getContext('2d');
	if (!ctx) return false;
	canvas.width = width;
	canvas.height = height;
	// Build via createImageData + set() to avoid the strict ArrayBuffer vs
	// SharedArrayBuffer typing on the ImageData constructor.
	const imageData = ctx.createImageData(width, height);
	imageData.data.set(pixels);
	ctx.putImageData(imageData, 0, 0);
	return true;
}
