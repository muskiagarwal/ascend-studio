#!/usr/bin/env python3
"""Excalidraw-style rough shapes for newsletter images.

Generates SVG path fragments that mimic rough.js (the library Excalidraw
uses): every stroke is drawn twice with random bowing and endpoint jitter,
rectangles get hand-missed corners, ellipses overlap their start point.
Compose scenes in a small Python script, wrap with svg_doc(), save .svg,
then render with render_images.py.

Typical use:

    from excali import Rough, svg_doc, text, INK, ORANGE, HIGHLIGHT
    R = Rough(seed=7)
    body = [
        R.rect(100, 250, 200, 290),
        R.arrow(200, 300, 400, 300),
        R.highlight(720, 78, 210, 40),          # yellow marker behind a phrase
        text(600, 108, "The FAANG loop has 4 doors.", size=54, bold=True),
    ]
    open("01-header.svg", "w").write(svg_doc(1200, 675, body))
"""
import math
import random

# ---- Excalidraw palette ----------------------------------------------------
INK = "#1e1e1e"
RED = "#e03131"
BLUE = "#1971c2"
GREEN = "#2f9e44"
ORANGE = "#f08c00"
GRAY = "#868e96"
HIGHLIGHT = "#ffec99"   # yellow marker fill
BG = "#ffffff"

FONT = "Virgil 3 YOFF, Virgil, Excalifont"   # render_images.py installs Virgil.ttf


class Rough:
    def __init__(self, seed=1, roughness=1.0, bowing=1.0, sw=2.75, stroke=INK):
        self.rng = random.Random(seed)
        self.roughness = roughness
        self.bowing = bowing
        self.sw = sw          # default stroke width
        self.stroke = stroke  # default stroke color

    # ---- internals ---------------------------------------------------------
    def _j(self, amp):
        return self.rng.uniform(-amp, amp) * self.roughness

    def _line_d(self, x1, y1, x2, y2, second=False):
        """One pass of a rough line as a cubic bezier (rough.js style)."""
        length = math.hypot(x2 - x1, y2 - y1) or 1.0
        gain = 1.0 if length < 200 else (0.4 if length > 500 else 1.2333 - 0.0016668 * length)
        off = 2.2 * gain * (0.5 if second else 1.0)
        div = 0.25 + self.rng.random() * 0.2
        px, py = -(y2 - y1) / length, (x2 - x1) / length      # unit perpendicular
        bow = self.rng.uniform(-1, 1) * self.bowing * min(7.0, length * 0.022)
        if second:
            bow *= 0.6
        c1x = x1 + (x2 - x1) * div + px * bow + self._j(off)
        c1y = y1 + (y2 - y1) * div + py * bow + self._j(off)
        c2x = x1 + (x2 - x1) * (1 - div) + px * bow + self._j(off)
        c2y = y1 + (y2 - y1) * (1 - div) + py * bow + self._j(off)
        return (
            f"M {x1 + self._j(off):.1f} {y1 + self._j(off):.1f} "
            f"C {c1x:.1f} {c1y:.1f}, {c2x:.1f} {c2y:.1f}, "
            f"{x2 + self._j(off):.1f} {y2 + self._j(off):.1f}"
        )

    def _catmull_d(self, pts, jitter=1.5, closed=False):
        """Smooth rough curve through points (catmull-rom -> bezier)."""
        p = [(x + self._j(jitter), y + self._j(jitter)) for x, y in pts]
        if closed:
            p = [p[-1]] + p + [p[0], p[1]]
        else:
            p = [p[0]] + p + [p[-1]]
        d = f"M {p[1][0]:.1f} {p[1][1]:.1f} "
        for i in range(1, len(p) - 2):
            p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
            c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
            c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
            d += f"C {c1[0]:.1f} {c1[1]:.1f}, {c2[0]:.1f} {c2[1]:.1f}, {p2[0]:.1f} {p2[1]:.1f} "
        return d

    def _path(self, d, stroke=None, sw=None, extra=""):
        return (
            f'<path d="{d}" fill="none" stroke="{stroke or self.stroke}" '
            f'stroke-width="{sw or self.sw}" stroke-linecap="round" '
            f'stroke-linejoin="round" {extra}/>'
        )

    # ---- primitives --------------------------------------------------------
    def line(self, x1, y1, x2, y2, stroke=None, sw=None):
        d = self._line_d(x1, y1, x2, y2) + " " + self._line_d(x1, y1, x2, y2, second=True)
        return self._path(d, stroke, sw)

    def rect(self, x, y, w, h, stroke=None, sw=None):
        """Hand-drawn rectangle: two passes, corners jittered per pass."""
        out = []
        for second in (False, True):
            amp = 2.0 if not second else 1.0
            cs = [
                (x + self._j(amp), y + self._j(amp)),
                (x + w + self._j(amp), y + self._j(amp)),
                (x + w + self._j(amp), y + h + self._j(amp)),
                (x + self._j(amp), y + h + self._j(amp)),
            ]
            d = ""
            for i in range(4):
                a, b = cs[i], cs[(i + 1) % 4]
                d += self._line_d(a[0], a[1], b[0], b[1], second=second) + " "
            out.append(d)
        return self._path(" ".join(out), stroke, sw)

    def ellipse(self, cx, cy, rx, ry, stroke=None, sw=None):
        """Rough ellipse with overlapping start, two passes."""
        out = []
        for second in (False, True):
            n = max(10, int((rx + ry) / 9))
            start = self.rng.uniform(0, math.tau)
            jr = (0.015 if second else 0.028)
            pts = []
            for i in range(n + 2):                      # +2 = overlap the start
                a = start + math.tau * i / n
                r1 = rx * (1 + self.rng.uniform(-jr, jr))
                r2 = ry * (1 + self.rng.uniform(-jr, jr))
                pts.append((cx + r1 * math.cos(a), cy + r2 * math.sin(a)))
            out.append(self._catmull_d(pts, jitter=0.8))
        return self._path(" ".join(out), stroke, sw)

    def circle(self, cx, cy, r, stroke=None, sw=None):
        return self.ellipse(cx, cy, r, r, stroke, sw)

    def curve(self, pts, stroke=None, sw=None, double=True):
        d = self._catmull_d(pts)
        if double:
            d += " " + self._catmull_d(pts, jitter=1.0)
        return self._path(d, stroke, sw)

    def arrow(self, x1, y1, x2, y2, stroke=None, sw=None, head=16, via=None):
        """Straight or (with via=(x,y)) gently curved arrow, Excalidraw head."""
        if via:
            body = self.curve([(x1, y1), via, (x2, y2)], stroke, sw)
            ang = math.atan2(y2 - via[1], x2 - via[0])
        else:
            body = self.line(x1, y1, x2, y2, stroke, sw)
            ang = math.atan2(y2 - y1, x2 - x1)
        heads = []
        for da in (math.radians(152), math.radians(-152)):
            hx = x2 + head * math.cos(ang + da)
            hy = y2 + head * math.sin(ang + da)
            heads.append(self._line_d(x2, y2, hx, hy))
        return body + self._path(" ".join(heads), stroke, sw)

    def scribble_ring(self, cx, cy, rx, ry, stroke=RED, sw=None):
        """Loose emphasis loop around something (single pass, overshoots)."""
        n = 14
        start = self.rng.uniform(0, math.tau)
        pts = []
        for i in range(n + 3):
            a = start + math.tau * i / n
            pts.append((cx + rx * (1 + self.rng.uniform(-0.05, 0.05)) * math.cos(a),
                        cy + ry * (1 + self.rng.uniform(-0.05, 0.05)) * math.sin(a)))
        return self._path(self._catmull_d(pts, jitter=1.2), stroke, sw or self.sw)

    def check(self, cx, cy, s=1.0, stroke=GREEN, sw=None):
        d = (self._line_d(cx - 14 * s, cy, cx - 3 * s, cy + 13 * s)
             + " " + self._line_d(cx - 3 * s, cy + 13 * s, cx + 18 * s, cy - 14 * s))
        return self._path(d, stroke, sw or self.sw + 0.5)

    def cross(self, cx, cy, s=1.0, stroke=RED, sw=None):
        d = (self._line_d(cx - 13 * s, cy - 13 * s, cx + 13 * s, cy + 13 * s)
             + " " + self._line_d(cx + 13 * s, cy - 13 * s, cx - 13 * s, cy + 13 * s))
        return self._path(d, stroke, sw or self.sw + 0.5)

    def highlight(self, x, y, w, h, fill=HIGHLIGHT, opacity=0.65):
        """Marker swipe: a rough-cornered filled quad, no stroke. Put BEFORE text."""
        amp = 3
        p = [
            (x + self._j(amp), y + self._j(amp)),
            (x + w + self._j(amp), y + self._j(amp)),
            (x + w + self._j(amp), y + h + self._j(amp)),
            (x + self._j(amp), y + h + self._j(amp)),
        ]
        d = "M " + " L ".join(f"{px:.1f} {py:.1f}" for px, py in p) + " Z"
        return f'<path d="{d}" fill="{fill}" opacity="{opacity}" stroke="none"/>'

    def hachure_rect(self, x, y, w, h, gap=12, angle=-41, stroke=None, sw=None):
        """Excalidraw hachure fill for a rectangle (diagonal sketch lines)."""
        th = math.radians(angle)
        dx, dy = math.cos(th), math.sin(th)
        nx, ny = -dy, dx
        cx, cy = x + w / 2, y + h / 2
        span = (abs(w * nx) + abs(h * ny)) / 2
        out = []
        c = -span
        while c <= span:
            ox, oy = cx + nx * c, cy + ny * c
            big = w + h
            seg = _clip_line(ox - dx * big, oy - dy * big, ox + dx * big, oy + dy * big, x, y, w, h)
            if seg:
                out.append(self._line_d(*seg) )
            c += gap
        return self._path(" ".join(out), stroke, (sw or self.sw) * 0.65)

    def stick(self, x, y, scale=1.0, pose="stand", stroke=None, sw=None):
        """Stick figure. Origin = center of head. Feet at y+~118*scale.
        Poses: stand, cheer (arms up), sit (legs forward: pair with a stool)."""
        s = scale
        parts = [self.circle(x, y, 20 * s, stroke, sw)]
        parts.append(self.line(x, y + 20 * s, x, y + 72 * s, stroke, sw))       # body
        if pose == "cheer":
            arms = [(x, y + 32 * s, x - 28 * s, y + 4 * s), (x, y + 32 * s, x + 28 * s, y + 4 * s)]
        else:
            arms = [(x, y + 32 * s, x - 28 * s, y + 56 * s), (x, y + 32 * s, x + 28 * s, y + 56 * s)]
        if pose == "sit":
            arms = [(x, y + 34 * s, x + 46 * s, y + 46 * s), (x, y + 34 * s, x + 38 * s, y + 56 * s)]
            legs = [(x, y + 72 * s, x + 30 * s, y + 76 * s), (x + 30 * s, y + 76 * s, x + 30 * s, y + 118 * s),
                    (x, y + 72 * s, x + 20 * s, y + 82 * s), (x + 20 * s, y + 82 * s, x + 20 * s, y + 118 * s)]
        else:
            legs = [(x, y + 72 * s, x - 20 * s, y + 118 * s), (x, y + 72 * s, x + 20 * s, y + 118 * s)]
        for a in arms + legs:
            parts.append(self.line(*a, stroke, sw))
        return "".join(parts)


def _clip_line(x1, y1, x2, y2, rx, ry, rw, rh):
    """Liang-Barsky clip of a segment to a rect; returns (x1,y1,x2,y2) or None."""
    t0, t1 = 0.0, 1.0
    dx, dy = x2 - x1, y2 - y1
    for p, q in ((-dx, x1 - rx), (dx, rx + rw - x1), (-dy, y1 - ry), (dy, ry + rh - y1)):
        if p == 0:
            if q < 0:
                return None
        else:
            r = q / p
            if p < 0:
                if r > t1:
                    return None
                t0 = max(t0, r)
            else:
                if r < t0:
                    return None
                t1 = min(t1, r)
    return (x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy)


def text(x, y, s, size=34, bold=False, color=INK, anchor="middle"):
    w = ' font-weight="bold"' if bold else ""
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}"'
            f' fill="{color}" text-anchor="{anchor}"{w}>{s}</text>')


def svg_doc(w, h, parts, bg=BG):
    body = "\n  ".join(parts)
    return (f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">\n'
            f'  <rect width="{w}" height="{h}" fill="{bg}"/>\n  {body}\n</svg>\n')
