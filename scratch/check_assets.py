import os
from PIL import Image

pairs = [
    ('src/assets/hair_banner_transparent-C6ZbZnzF.png', 'android/app/src/main/res/drawable-mdpi/src_assets_hair_banner_transparentc6zbznzf.png'),
    ('src/assets/body_soap_transparent-BNlIXnY2.png', 'android/app/src/main/res/drawable-mdpi/src_assets_body_soap_transparentbnlixny2.png'),
    ('src/assets/pirandai_pickle_transparent_v2-CmtHv3jP.png', 'android/app/src/main/res/drawable-mdpi/src_assets_pirandai_pickle_transparent_v2cmthv3jp.png'),
    ('src/assets/sathu_maavu_transparent-BQkYbCxR.png', 'android/app/src/main/res/drawable-mdpi/src_assets_sathu_maavu_transparentbqkybcxr.png'),
    ('src/assets/aloe_vera_face_pack_transparent-pX6HUvSp.png', 'android/app/src/main/res/drawable-mdpi/src_assets_aloe_vera_face_pack_transparentpx6huvsp.png'),
]

for src, res in pairs:
    img_src = Image.open(src)
    img_res = Image.open(res)
    print(f"{os.path.basename(src)}: src={img_src.size}, res={img_res.size}")
