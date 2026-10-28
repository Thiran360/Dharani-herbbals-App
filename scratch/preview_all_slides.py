from PIL import Image, ImageDraw
import os

images = [
    ('b1', 'scratch/hair_banner_optimal.png', '#CEE5D6'),
    ('b2', 'src/assets/body_soap_transparent-BNlIXnY2.png', '#CAE6D9'),
    ('b3', 'src/assets/pirandai_pickle_transparent_v2-CmtHv3jP.png', '#D3E7D3'),
    ('b4', 'src/assets/sathu_maavu_transparent-BQkYbCxR.png', '#CCE5DB'),
    ('b5', 'src/assets/aloe_vera_face_pack_transparent-pX6HUvSp.png', '#C6E4D7'),
]

for bid, path, bg_hex in images:
    img = Image.open(path).convert('RGBA')
    size = 1024
    
    # Parse bg hex
    r = int(bg_hex[1:3], 16)
    g = int(bg_hex[3:5], 16)
    b = int(bg_hex[5:7], 16)
    
    canvas = Image.new('RGBA', (size, size), (r, g, b, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Circle frame (like styles.sliderCircleFrame)
    margin = 30
    draw.ellipse([margin, margin, size - margin, size - margin], fill=(255, 255, 255, 255), outline=(130, 186, 154, 255), width=10)
    
    # Inner product image at 90%
    inner_s = int((size - 2*margin) * 0.90)
    resized = img.resize((inner_s, inner_s), Image.Resampling.LANCZOS)
    offset = (size - inner_s) // 2
    canvas.paste(resized, (offset, offset), resized)
    
    out_path = f'scratch/preview_{bid}.png'
    canvas.save(out_path, 'PNG')
    print(f"Saved {out_path}")
