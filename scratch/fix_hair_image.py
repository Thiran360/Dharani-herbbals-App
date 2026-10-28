from PIL import Image

def process_hair_banner():
    src_path = 'src/assets/hair_banner_transparent-C6ZbZnzF.png'
    img = Image.open(src_path).convert('RGBA')
    
    # Get exact non-zero alpha bounding box
    bbox = img.getbbox()
    print(f"Original size: {img.size}, bbox: {bbox}")
    
    # Crop to content
    content = img.crop(bbox)
    content_w, content_h = content.size
    print(f"Content size: {content_w} x {content_h}")
    
    # We want a 1:1 square canvas where the product occupies ~90% of the canvas
    # The content aspect ratio is content_w / content_h = 877 / 580 = 1.51
    # If the square canvas size is max(content_w, content_h) with padding:
    max_dim = max(content_w, content_h) # 877
    
    # Let's add ~6% padding on the longest dimension so it doesn't touch the edges
    # Square size: int(max_dim * 1.10) => ~965x965 or 1024x1024
    square_size = 1024
    # Calculate scale so content fits nicely within 92% of 1024 (942px max)
    target_max = int(square_size * 0.92) # 942
    scale = target_max / max_dim
    new_w = int(content_w * scale)
    new_h = int(content_h * scale)
    
    resized_content = content.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Create transparent 1024x1024 canvas
    square_img = Image.new('RGBA', (square_size, square_size), (0, 0, 0, 0))
    paste_x = (square_size - new_w) // 2
    paste_y = (square_size - new_h) // 2
    square_img.paste(resized_content, (paste_x, paste_y), resized_content)
    
    print(f"New square image: {square_size}x{square_size}, content placed at ({paste_x}, {paste_y}) with size {new_w}x{new_h}")
    square_img.save('scratch/hair_banner_centered.png', 'PNG')
    print("Saved preview to scratch/hair_banner_centered.png")

if __name__ == '__main__':
    process_hair_banner()
