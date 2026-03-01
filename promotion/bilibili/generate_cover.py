#!/usr/bin/env python3
"""Generate B站 cover image for Coding Fangirl video.

Design: Video frame (love mode output) + dark gradient overlay + bold title text + brand badge.
Output: 1920×1080 (16:9) JPEG.
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# --- Config ---
OUTPUT = os.path.join(os.path.dirname(__file__), "cover_bilibili.jpg")
FRAME = os.path.join(os.path.dirname(__file__), "frame_love_output.jpg")
WIDTH, HEIGHT = 1920, 1080

# Fonts
FONT_BOLD = "/System/Library/Fonts/Hiragino Sans GB.ttc"
FONT_MEDIUM = "/System/Library/Fonts/STHeiti Medium.ttc"

# Colors
COLOR_BG_OVERLAY = (20, 10, 35)  # Deep purple-black
COLOR_ACCENT = (255, 107, 152)   # Pink accent (coding-fangirl vibe)
COLOR_ACCENT2 = (255, 182, 113)  # Warm orange accent
COLOR_TEXT_MAIN = (255, 255, 255)
COLOR_TEXT_SUB = (220, 200, 240)  # Light lavender
COLOR_BADGE_BG = (255, 107, 152, 220)


def create_cover():
    # 1. Load and crop frame to 16:9
    frame = Image.open(FRAME)
    fw, fh = frame.size  # 2180×1698

    # Center crop to 16:9 ratio
    target_ratio = WIDTH / HEIGHT  # 1.778
    current_ratio = fw / fh        # 1.284

    if current_ratio < target_ratio:
        # Too tall — crop height
        new_h = int(fw / target_ratio)
        top = (fh - new_h) // 2
        frame = frame.crop((0, top, fw, top + new_h))
    else:
        # Too wide — crop width
        new_w = int(fh * target_ratio)
        left = (fw - new_w) // 2
        frame = frame.crop((left, 0, left + new_w, fh))

    # Resize to target
    frame = frame.resize((WIDTH, HEIGHT), Image.LANCZOS)

    # 2. Apply slight blur to make text readable
    frame_blurred = frame.filter(ImageFilter.GaussianBlur(radius=3))

    # 3. Create dark gradient overlay (left-to-right + bottom)
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)

    # Left-side heavy gradient (for text area)
    for x in range(WIDTH):
        # Left 65% is dark, fades to lighter on right
        if x < WIDTH * 0.65:
            alpha = int(200 - (x / (WIDTH * 0.65)) * 60)
        else:
            progress = (x - WIDTH * 0.65) / (WIDTH * 0.35)
            alpha = int(140 - progress * 80)
        for y in range(HEIGHT):
            # Bottom gradient boost
            bottom_boost = 0
            if y > HEIGHT * 0.7:
                bottom_boost = int(((y - HEIGHT * 0.7) / (HEIGHT * 0.3)) * 60)
            final_alpha = min(255, alpha + bottom_boost)
            draw_overlay.point((x, y), fill=(20, 10, 35, final_alpha))

    # Composite: frame + overlay
    canvas = frame_blurred.convert("RGBA")
    canvas = Image.alpha_composite(canvas, overlay)

    # 4. Draw text and elements
    draw = ImageDraw.Draw(canvas)

    # Load fonts
    font_title = ImageFont.truetype(FONT_BOLD, 82)
    font_sub = ImageFont.truetype(FONT_MEDIUM, 38)
    font_badge = ImageFont.truetype(FONT_MEDIUM, 28)
    font_emoji_hint = ImageFont.truetype(FONT_MEDIUM, 52)

    # --- Main title (2 lines) ---
    title_line1 = "AI 编码助手"
    title_line2 = "叫我哥哥了"

    # Draw title with accent color underline effect
    y_start = 280
    line_spacing = 110

    # Line 1
    draw.text((120, y_start), title_line1, font=font_title, fill=COLOR_TEXT_MAIN)

    # Line 2 with pink accent
    draw.text((120, y_start + line_spacing), title_line2, font=font_title, fill=COLOR_ACCENT)

    # --- Accent bar (pink line under title) ---
    bar_y = y_start + line_spacing * 2 + 20
    draw.rounded_rectangle(
        [(120, bar_y), (420, bar_y + 6)],
        radius=3,
        fill=COLOR_ACCENT
    )

    # --- Subtitle ---
    subtitle = "写代码的时候，谁来给你一点甜？"
    draw.text((120, bar_y + 40), subtitle, font=font_sub, fill=COLOR_TEXT_SUB)

    # --- Feature tags at bottom ---
    # --- Feature tags at bottom (no emoji - CJK fonts can't render them) ---
    tags = [
        ("迷妹模式", (255, 107, 152, 150)),   # Pink
        ("恋爱模式", (220, 60, 80, 150)),     # Red
        ("彩虹屁", (255, 182, 113, 150)),      # Orange
        ("情绪安抚", (130, 120, 255, 150)),    # Purple
    ]
    tag_x = 120
    tag_y = HEIGHT - 110

    for tag_text, tag_color in tags:
        # Measure text
        bbox = font_badge.getbbox(tag_text)
        tw = bbox[2] - bbox[0] + 32
        th = bbox[3] - bbox[1] + 20

        # Colored rounded rect background
        draw.rounded_rectangle(
            [(tag_x, tag_y), (tag_x + tw, tag_y + th)],
            radius=th // 2,
            fill=tag_color
        )
        draw.text((tag_x + 16, tag_y + 8), tag_text, font=font_badge, fill=COLOR_TEXT_MAIN)
        tag_x += tw + 14

    # --- Brand badge (top-right area) ---
    badge_text = "Coding Fangirl"
    badge_bbox = font_badge.getbbox(badge_text)
    badge_w = badge_bbox[2] - badge_bbox[0] + 40
    badge_h = badge_bbox[3] - badge_bbox[1] + 20
    badge_x = WIDTH - badge_w - 60
    badge_y = 50

    draw.rounded_rectangle(
        [(badge_x, badge_y), (badge_x + badge_w, badge_y + badge_h)],
        radius=badge_h // 2,
        fill=COLOR_BADGE_BG
    )
    draw.text((badge_x + 20, badge_y + 8), badge_text, font=font_badge, fill=COLOR_TEXT_MAIN)

    # --- "Open Source" small badge below ---
    os_text = "✨ 开源免费"
    os_bbox = font_badge.getbbox(os_text)
    os_w = os_bbox[2] - os_bbox[0] + 30
    os_h = os_bbox[3] - os_bbox[1] + 16
    os_x = badge_x + (badge_w - os_w) // 2
    os_y = badge_y + badge_h + 12

    draw.rounded_rectangle(
        [(os_x, os_y), (os_x + os_w, os_y + os_h)],
        radius=os_h // 2,
        fill=(255, 182, 113, 180)
    )
    draw.text((os_x + 15, os_y + 6), os_text, font=font_badge, fill=COLOR_TEXT_MAIN)

    # --- Decorative quote from love mode (right side, subtle) ---
    quote_font = ImageFont.truetype(FONT_MEDIUM, 26)
    quote_lines = [
        "「从背后环住你，",
        "  把下巴搁在你肩上，",
        "  轻声说……」",
    ]
    quote_y = HEIGHT - 260
    for line in quote_lines:
        draw.text((WIDTH - 520, quote_y), line, font=quote_font, fill=(255, 255, 255, 120))
        quote_y += 42

    # 5. Convert to RGB and save
    final = canvas.convert("RGB")
    final.save(OUTPUT, "JPEG", quality=95)
    print(f"Cover saved: {OUTPUT}")
    print(f"Size: {final.size}")


if __name__ == "__main__":
    create_cover()
