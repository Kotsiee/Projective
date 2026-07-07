use wasm_bindgen::prelude::*;
use std::io::Cursor;
use image::io::Reader as ImageReader;
use image::{ImageOutputFormat, ImageFormat};
use image::imageops::FilterType;

#[wasm_bindgen]
pub fn resize_image(
    file_data: &[u8], 
    width: u32, 
    height: u32, 
    quality: u8
) -> Result<Vec<u8>, JsError> {
    // 1. Hook up panic handler for better debugging in console
    console_error_panic_hook::set_once();

    // 2. Load the image from memory
    // We guess the format based on magic bytes
    let img = ImageReader::new(Cursor::new(file_data))
        .with_guessed_format()
        .map_err(|e| JsError::new(&format!("Failed to read format: {}", e)))?
        .decode()
        .map_err(|e| JsError::new(&format!("Failed to decode image: {}", e)))?;

    // 3. Resize
    // resize_to_fill: Crops to aspect ratio
    // resize: Preserves aspect ratio, fits within bounds
    let scaled = img.resize(width, height, FilterType::Lanczos3);

    // 4. Write to Buffer (Output as JPEG for compression)
    let mut result_buf = Vec::new();
    scaled
        .write_to(
            &mut Cursor::new(&mut result_buf), 
            ImageOutputFormat::Jpeg(quality)
        )
        .map_err(|e| JsError::new(&format!("Failed to encode image: {}", e)))?;

    Ok(result_buf)
}

/// Generate a BlurHash string from flat RGBA pixel bytes.
///
/// The browser produces this exact layout via
/// `CanvasRenderingContext2D.getImageData().data` for both decoded images and
/// grabbed video frames, so a single entry point covers images and videos.
///
/// * `pixels`  — RGBA bytes, tightly packed, length must equal `width * height * 4`.
/// * `width`   — frame width in pixels.
/// * `height`  — frame height in pixels.
/// * `comp_x`  — horizontal components (detail), 1..=9. 4 is a good default.
/// * `comp_y`  — vertical components (detail), 1..=9. 3 is a good default.
///
/// Returns a compact (~20-30 byte) BlurHash string.
#[wasm_bindgen]
pub fn blurhash_from_rgba(
    pixels: &[u8],
    width: u32,
    height: u32,
    comp_x: u32,
    comp_y: u32,
) -> Result<String, JsError> {
    console_error_panic_hook::set_once();

    // Guard the component counts — the encoder panics outside 1..=9.
    if !(1..=9).contains(&comp_x) || !(1..=9).contains(&comp_y) {
        return Err(JsError::new(
            "comp_x and comp_y must each be between 1 and 9",
        ));
    }

    if width == 0 || height == 0 {
        return Err(JsError::new("width and height must be non-zero"));
    }

    // The RGBA buffer must be exactly 4 bytes per pixel.
    let expected = (width as usize)
        .checked_mul(height as usize)
        .and_then(|n| n.checked_mul(4))
        .ok_or_else(|| JsError::new("width * height * 4 overflows"))?;

    if pixels.len() != expected {
        return Err(JsError::new(&format!(
            "pixel buffer length {} does not match width*height*4 ({})",
            pixels.len(),
            expected
        )));
    }

    blurhash::encode(comp_x, comp_y, width, height, pixels)
        .map_err(|e| JsError::new(&format!("Failed to encode blurhash: {}", e)))
}