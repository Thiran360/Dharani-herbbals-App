import shutil
from PIL import Image

# 1. Backup original
shutil.copyfile('src/assets/hair_banner_transparent-C6ZbZnzF.png', 'scratch/hair_banner_transparent_original_backup.png')

# 2. Open optimal 1024x1024 centered image
opt_img = Image.open('scratch/hair_banner_optimal.png')

# 3. Save to src/assets
opt_img.save('src/assets/hair_banner_transparent-C6ZbZnzF.png', 'PNG')

# 4. Save to android drawable-mdpi
opt_img.save('android/app/src/main/res/drawable-mdpi/src_assets_hair_banner_transparentc6zbznzf.png', 'PNG')

print("Successfully updated hair banner image in src/assets and android drawables!")
