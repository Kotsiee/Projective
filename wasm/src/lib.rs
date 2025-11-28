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