#!/usr/bin/env python3
"""Offline export of a deliberately lower-resolution, watermarked PUBLIC copy.
Requires Pillow: py -m pip install Pillow
Never modifies the input. Supports one image or a directory of PNG frames.
"""
import argparse
from pathlib import Path
import sys

try:
    from PIL import Image, ImageDraw, ImageFont, ImageOps
except ImportError:
    sys.exit("Pillow が必要です: py -m pip install Pillow")

VALID_INPUTS = {'.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff', '.bmp'}
VALID_OUTPUTS = {'.png', '.jpg', '.jpeg', '.webp'}


def font_for(text, size, path):
    if path:
        return ImageFont.truetype(path, size)
    if any(ord(c) > 127 for c in text):
        # User can pass their installed Japanese font, without redistributing its file.
        raise ValueError('日本語・記号入りの透かしには --font C:\\Windows\\Fonts\\...ttc を指定してください。')
    try:
        return ImageFont.truetype('DejaVuSans.ttf', size)
    except OSError:
        return ImageFont.load_default()


def make_watermark(size, label, strength, tiled, font_path):
    w, h = size
    mask = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    if not label:
        return mask
    fs = max(13, round(min(w, h) * (0.035 if tiled else 0.028)))
    font = font_for(label, fs, font_path)
    if tiled:
        # Low-contrast repeated watermark is harder to crop than a corner label.
        large = Image.new('RGBA', (w * 2, h * 2), (0, 0, 0, 0))
        draw = ImageDraw.Draw(large)
        bbox = draw.textbbox((0, 0), label, font=font)
        text_w = bbox[2] - bbox[0]
        step_x = max(text_w + fs * 3, round(w * .45))
        step_y = max(fs * 4, round(h * .28))
        for y in range(-h, h * 3, step_y):
            for x in range(-w, w * 3, step_x):
                draw.text((x, y), label, font=font, fill=(255, 255, 255, 245),
                          stroke_width=max(1, fs // 15), stroke_fill=(24, 39, 59, 210))
        rotated = large.rotate(17, resample=Image.Resampling.BICUBIC)
        mask = rotated.crop((w // 2, h // 2, w // 2 + w, h // 2 + h))
    else:
        draw = ImageDraw.Draw(mask)
        bbox = draw.textbbox((0, 0), label, font=font)
        tx = max(7, w - (bbox[2] - bbox[0]) - fs)
        ty = max(7, h - fs * 2)
        draw.text((tx, ty), label, font=font, fill=(255, 255, 255, 255),
                  stroke_width=max(1, fs // 12), stroke_fill=(17, 37, 55, 190))
    mask.putalpha(mask.getchannel('A').point(lambda v: int(v * strength)))
    return mask


def protect(source, dest, args):
    if source.resolve() == dest.resolve():
        raise ValueError('元画像と出力先は別にしてください')
    if dest.exists() and not args.overwrite:
        raise FileExistsError(f'出力先は既に存在します: {dest} (--overwrite で明示的に上書き)')
    if dest.suffix.lower() not in VALID_OUTPUTS:
        raise ValueError('出力は png / jpg / webp に対応しています')
    with Image.open(source) as raw:
        if getattr(raw, 'is_animated', False):
            raise ValueError('アニメーション画像はPNG連番として書き出し、--frames で処理してください')
        image = ImageOps.exif_transpose(raw).convert('RGBA')
    image.thumbnail((args.max_size, args.max_size), Image.Resampling.LANCZOS)
    if args.watermark:
        overlay = make_watermark(image.size, args.watermark, args.opacity, args.tiled, args.font)
        image = Image.alpha_composite(image, overlay)
    dest.parent.mkdir(parents=True, exist_ok=True)
    suffix = dest.suffix.lower()
    # Creating a fresh image avoids copying EXIF / GPS / ICC / XMP metadata.
    if suffix in {'.jpg', '.jpeg'}:
        bg = Image.new('RGB', image.size, args.background)
        bg.paste(image, mask=image.getchannel('A'))
        bg.save(dest, format='JPEG', quality=args.quality, optimize=True, exif=b'')
    elif suffix == '.webp':
        image.save(dest, format='WEBP', quality=args.quality, method=6, exif=b'', xmp=b'', icc_profile=b'')
    else:
        image.save(dest, format='PNG', optimize=True, pnginfo=None)
    print(f'✓ {source.name} → {dest} ({image.width} × {image.height})')


def main():
    p = argparse.ArgumentParser(description='公開前の画像縮小・焼き込み透かし・メタデータ除去')
    p.add_argument('source', type=Path, help='元画像 / PNG連番ディレクトリ')
    p.add_argument('output', type=Path, help='出力画像 / PNG連番出力ディレクトリ')
    p.add_argument('--frames', action='store_true', help='PNG連番をフォルダ単位で処理')
    p.add_argument('--max-size', type=int, default=960, help='長辺上限、初期値960px')
    p.add_argument('--watermark', default='', help='表示用透かし（例 @official_handle）')
    p.add_argument('--require-watermark', action='store_true', help='透かしが空なら出力しない')
    p.add_argument('--opacity', type=float, default=.14, help='透かしの濃さ 0〜1、初期値0.14')
    p.add_argument('--tiled', action='store_true', help='全面に薄い透かしを繰り返す')
    p.add_argument('--font', default=None, help='ローカルにインストールされているフォントファイル')
    p.add_argument('--quality', type=int, default=78, help='JPG / WebP 品質')
    p.add_argument('--background', default='#eff8ff', help='JPEG化する際の透明部分の背景色')
    p.add_argument('--overwrite', action='store_true')
    args = p.parse_args()
    if args.require_watermark and (not args.watermark.strip() or args.opacity <= 0):
        p.error('透かし未設定です。--watermark と 0超の --opacity を指定してください')
    if args.max_size < 1 or not (0 <= args.opacity <= 1) or not (1 <= args.quality <= 100):
        p.error('max-sizeは1以上、opacityは0〜1、qualityは1〜100にしてください')
    try:
        if args.frames:
            if not args.source.is_dir():
                raise ValueError('--frames 時の source はPNG連番フォルダです')
            if args.source.resolve() == args.output.resolve():
                raise ValueError('出力フォルダは入力と別にしてください')
            frames = sorted(x for x in args.source.iterdir() if x.is_file() and x.suffix.lower() == '.png')
            if not frames:
                raise ValueError('PNGフレームが見つかりません')
            for frame in frames:
                protect(frame, args.output / frame.name, args)
        else:
            if not args.source.is_file() or args.source.suffix.lower() not in VALID_INPUTS:
                raise ValueError('元画像が存在しないか、対応形式ではありません')
            protect(args.source, args.output, args)
    except (ValueError, FileNotFoundError, FileExistsError, OSError) as error:
        sys.exit(f'✖ {error}')


if __name__ == '__main__':
    main()
