from PIL import Image, ImageDraw
import numpy as np

def balance_hair_banner():
    src_path = 'src/assets/hair_banner_transparent-C6ZbZnzF.png'
    img = Image.open(src_path).convert('RGBA')
    
    # Original bbox: (310, 117, 1187, 697)
    content = img.crop(img.getbbox())
    cw, ch = content.size # 877 x 580
    
    # We want to place this content on a 1024x1024 square canvas such that when viewed inside
    # a circular container, it fits comfortably with breathing room, completely unclipped,
    # and visually centered.
    
    # Let's test a few scale factors:
    # If the content width in the 1024 canvas is e.g. 840 (scale = 840/877 = 0.958),
    # then new_w = 840, new_h = 555.
    # What is the circle radius? In React Native, the circular container is CIRCLE_SIZE,
    # and the image is inside it with resizeMode="contain".
    # If the image canvas is 1024x1024 square and the container is CIRCLE_SIZE x CIRCLE_SIZE:
    # The circle radius in 1024 space is 512!
    # For every pixel (px, py) with alpha > 20:
    # distance = sqrt((px - 512)^2 + (py - 512)^2) must be <= 512 - safety_margin!
    
    best_scale = 1.0
    best_offset_x = 0
    best_offset_y = 0
    min_dist_to_edge = -9999
    
    # Let's find optimal scale and position
    for scale in np.linspace(0.80, 0.92, 25):
        nw = int(cw * scale)
        nh = int(ch * scale)
        resized = content.resize((nw, nh), Image.Resampling.LANCZOS)
        arr = np.array(resized)
        alpha = arr[:, :, 3]
        
        # Test vertical offset: placing content vertically
        # Since the top has the tall bottle cap and bottom has shadow,
        # let's try centering or slightly lowering/raising
        for y_center in np.linspace(500, 530, 7):
            ox = (1024 - nw) // 2
            oy = int(y_center - nh / 2)
            
            # check non-zero alpha coordinates
            ys, xs = np.where(alpha > 30)
            xs_global = xs + ox
            ys_global = ys + oy
            
            dists = np.sqrt((xs_global - 512)**2 + (ys_global - 512)**2)
            max_r = dists.max()
            margin = 512 - max_r
            if margin > 30: # at least 30px breathing room inside 512px radius circle!
                if scale > best_scale or min_dist_to_edge < 0 or margin > 40:
                    best_scale = scale
                    best_offset_x = ox
                    best_offset_y = oy
                    min_dist_to_edge = margin
                    break
    
    print(f"Optimal scale: {best_scale:.3f}, ox: {best_offset_x}, oy: {best_offset_y}, circle margin: {min_dist_to_edge:.1f}px")
    
    # Let's render this optimal placement
    nw = int(cw * best_scale)
    nh = int(ch * best_scale)
    resized = content.resize((nw, nh), Image.Resampling.LANCZOS)
    
    square_img = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    square_img.paste(resized, (best_offset_x, best_offset_y), resized)
    square_img.save('scratch/hair_banner_optimal.png', 'PNG')
    
    # Also preview in circle
    canvas = Image.new('RGBA', (1024, 1024), (206, 229, 214, 255))
    draw = ImageDraw.Draw(canvas)
    draw.ellipse([10, 10, 1014, 1014], fill=(255, 255, 255, 255), outline=(130, 186, 154, 255), width=8)
    canvas.paste(square_img, (0, 0), square_img)
    canvas.save('scratch/preview_hair_optimal_circle.png', 'PNG')
    print("Saved scratch/hair_banner_optimal.png and preview")

if __name__ == '__main__':
    balance_hair_banner()
