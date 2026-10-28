from PIL import Image, ImageDraw

def test_circular_frame():
    img = Image.open('scratch/hair_banner_centered.png').convert('RGBA')
    size = img.size[0] # 1024
    
    # Create canvas with white circle and border
    canvas = Image.new('RGBA', (size, size), (206, 229, 214, 255)) # slider bg #CEE5D6
    draw = ImageDraw.Draw(canvas)
    
    # Draw white circle frame
    draw.ellipse([20, 20, size - 20, size - 20], fill=(255, 255, 255, 255), outline=(130, 186, 154, 255), width=8)
    
    # Scale image to 90% and paste in center
    target_s = int((size - 40) * 0.90)
    resized = img.resize((target_s, target_s), Image.Resampling.LANCZOS)
    offset = (size - target_s) // 2
    canvas.paste(resized, (offset, offset), resized)
    
    canvas.save('scratch/preview_hair_in_circle.png', 'PNG')
    print("Saved preview to scratch/preview_hair_in_circle.png")

if __name__ == '__main__':
    test_circular_frame()
