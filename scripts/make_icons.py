"""Draws the launcher icon: a brass ISA valve on the engine-room cabinet colour."""
import os, sys
from PIL import Image, ImageDraw

RES = os.path.join(os.path.dirname(__file__), '..', 'android', 'app', 'src', 'main', 'res')
CAB, BRASS, WHITE = (17, 26, 27, 255), (201, 138, 44, 255), (255, 255, 255, 255)
SS = 4

def valve(size, scale):
    """Transparent square with the valve centred. scale is the valve width as a share of size."""
    s = size * SS
    im = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c, w, h = s / 2, s * scale / 2, s * scale * .32
    pipe = max(2, int(s * .035))
    d.line([(c - w * 1.25, c), (c - w, c)], fill=WHITE, width=pipe)
    d.line([(c + w, c), (c + w * 1.25, c)], fill=WHITE, width=pipe)
    d.polygon([(c - w, c - h), (c, c), (c - w, c + h)], fill=BRASS)
    d.polygon([(c + w, c - h), (c, c), (c + w, c + h)], fill=BRASS)
    r = s * scale * .09
    d.ellipse([c - r, c - r, c + r, c + r], fill=WHITE)
    return im.resize((size, size), Image.LANCZOS)

def on_cab(size, round_):
    s = size * SS
    im = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if round_:
        d.ellipse([0, 0, s - 1, s - 1], fill=CAB)
    else:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=s * .18, fill=CAB)
    im = im.resize((size, size), Image.LANCZOS)
    im.alpha_composite(valve(size, .62))
    return im

for name, base, fg in [('mdpi', 48, 108), ('hdpi', 72, 162), ('xhdpi', 96, 216), ('xxhdpi', 144, 324), ('xxxhdpi', 192, 432)]:
    folder = os.path.join(RES, 'mipmap-' + name)
    on_cab(base, False).save(os.path.join(folder, 'ic_launcher.png'))
    on_cab(base, True).save(os.path.join(folder, 'ic_launcher_round.png'))
    valve(fg, .42).save(os.path.join(folder, 'ic_launcher_foreground.png'))
print('icons written')
