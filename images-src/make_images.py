#!/usr/bin/env python3
"""Compose the Ascend Studio illustration set in the Excalidraw whiteboard
style (rough double strokes, Virgil font, white bg, one orange accent per
image). Writes .svg files next to this script; render.mjs turns them into PNGs.

One idea per image, <= 12 words of labels, per the skill's image-style-guide.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from excali import (  # noqa: E402
    Rough, svg_doc, text, INK, RED, BLUE, GREEN, ORANGE, GRAY, HIGHLIGHT,
)

OUT = os.path.dirname(__file__)


def save(name, svg):
    open(os.path.join(OUT, name), "w").write(svg)


def boxed(R, x, y, w, h, label, size=32, accent=False, sub=None):
    """Rough rect with a centered label (and optional smaller sub-label)."""
    parts = [R.rect(x, y, w, h, stroke=ORANGE if accent else INK)]
    cy = y + h / 2 + size * 0.34 - (size * 0.5 if sub else 0)
    parts.append(text(x + w / 2, cy, label, size=size, bold=accent))
    if sub:
        parts.append(text(x + w / 2, cy + size * 0.95, sub, size=26, color=GRAY))
    return parts


# ============================================================ ARTICLE 1
# Contrarian: "I solved 120 LeetCode problems and still cleared FAANG"

def leetcode_header():
    R = Rough(seed=11)
    p = []
    p.append(R.highlight(468, 66, 262, 52))
    p.append(text(600, 108, "I solved 120, not 400.", size=54, bold=True))
    # Left: tall grind stack, crossed out
    p.append(R.rect(150, 210, 230, 300))
    for i in range(1, 7):
        p.append(R.line(168, 210 + i * 42, 362, 210 + i * 42, stroke=GRAY, sw=1.8))
    p.append(R.cross(265, 355, s=4.2, sw=6))
    p.append(text(265, 560, "400 problems", size=34, color=GRAY))
    # Right: small smart stack, checked
    p.append(R.rect(760, 400, 230, 110))
    p.append(R.line(778, 442, 972, 442, stroke=GRAY, sw=1.8))
    p.append(R.line(778, 476, 972, 476, stroke=GRAY, sw=1.8))
    p.append(R.check(1075, 300, s=4.2, sw=6))
    p.append(text(875, 560, "120 problems", size=34, bold=True, color=ORANGE))
    p.append(R.arrow(470, 360, 745, 430, via=(610, 300), stroke=INK, sw=2.4))
    return svg_doc(1200, 675, p)


def leetcode_myth():
    R = Rough(seed=21)
    p = []
    p.append(R.line(700, 120, 700, 700, stroke=GRAY, sw=2))
    # left panel: the myth
    p += boxed(R, 150, 120, 400, 66, "The myth", size=32)
    p.append(R.cross(350, 330, s=4.6, sw=6))
    p.append(text(350, 470, "Grind 400 problems", size=34, color=GRAY))
    p.append(text(350, 520, "blind, then apply.", size=34, color=GRAY))
    # right panel: what worked
    p += boxed(R, 850, 120, 400, 66, "What worked", size=32, accent=True)
    p.append(R.check(1050, 330, s=4.6, sw=6))
    p.append(text(1050, 470, "~50 patterns,", size=34))
    p.append(text(1050, 520, "spaced and timed.", size=34))
    return svg_doc(1400, 800, p)


def leetcode_loop():
    R = Rough(seed=31)
    p = []
    p.append(R.highlight(516, 70, 368, 50))
    p.append(text(700, 110, "The 3-step loop", size=48, bold=True))
    ys = 360
    p += boxed(R, 90, ys, 340, 150, "Learn the", size=34, sub="pattern, not the answer")
    p += boxed(R, 530, ys, 340, 150, "Space it", size=34, sub="revisit day 1, 3, 7")
    p += boxed(R, 970, ys, 340, 150, "Time it", size=34, accent=True, sub="45-min mock, no peeking")
    p.append(R.arrow(438, ys + 75, 522, ys + 75, sw=2.6))
    p.append(R.arrow(878, ys + 75, 962, ys + 75, sw=2.6))
    # a single curved arrow arcing back over the top: right box -> left box
    p.append(R.arrow(1140, ys - 8, 260, ys - 8, via=(700, 250),
                     stroke=ORANGE, sw=2.4))
    p.append(text(700, 322, "repeat weekly", size=28, color=ORANGE))
    return svg_doc(1400, 800, p)


# ============================================================ ARTICLE 2
# Story -> Playbook: "I lost the H-1B lottery. The O-1 / EB-1A playbook"

def h1b_header():
    R = Rough(seed=41)
    p = []
    p.append(text(600, 96, "The wheel just spins.", size=52, bold=True))
    # roulette wheel
    cx, cy, rr = 430, 400, 165
    p.append(R.circle(cx, cy, rr))
    p.append(R.circle(cx, cy, rr - 38, stroke=GRAY, sw=1.8))
    import math
    for i in range(8):
        a = math.tau * i / 8
        p.append(R.line(cx + (rr - 38) * math.cos(a), cy + (rr - 38) * math.sin(a),
                        cx + rr * math.cos(a), cy + rr * math.sin(a), sw=1.8))
    p.append(R.circle(cx, cy, 12))
    p.append(R.arrow(cx, cy - rr - 70, cx, cy - rr - 6, sw=3, stroke=ORANGE))
    # a person watching
    p.append(R.stick(880, 300, scale=1.5))
    p.append(text(880, 560, "3 years, 2 offers,", size=32, color=GRAY))
    p.append(text(880, 604, "still not picked.", size=32, color=GRAY))
    return svg_doc(1200, 675, p)


def h1b_pivot():
    R = Rough(seed=51)
    p = []
    p.append(text(700, 110, "Stop playing luck. Build evidence.", size=44, bold=True))
    p += boxed(R, 120, 320, 420, 190, "H-1B lottery", size=38, sub="a coin flip you can't control")
    p.append(R.scribble_ring(330, 415, 250, 130, stroke=RED))
    p += boxed(R, 860, 320, 420, 190, "O-1 / EB-1A", size=38, accent=True,
               sub="a case you build on purpose")
    p.append(R.arrow(560, 415, 840, 415, sw=3, stroke=ORANGE))
    p.append(text(700, 385, "pivot", size=28, color=ORANGE))
    return svg_doc(1400, 800, p)


def h1b_criteria():
    R = Rough(seed=61)
    p = []
    p.append(R.highlight(470, 70, 470, 50))
    p.append(text(700, 110, "Evidence you can start now", size=46, bold=True))
    # two roomy columns, three rows — nothing runs off the canvas
    rows = [
        ("Awards", "Press features"),
        ("Judging others", "Original work"),
        ("High salary", "Memberships"),
    ]
    col_check = (300, 830)
    col_text = (350, 880)
    for r, (left, right) in enumerate(rows):
        y = 280 + r * 130
        p.append(R.check(col_check[0], y, s=2.4, sw=5))
        p.append(text(col_text[0], y + 12, left, size=34, anchor="start"))
        p.append(R.check(col_check[1], y, s=2.4, sw=5))
        p.append(text(col_text[1], y + 12, right, size=34, anchor="start"))
    p.append(text(700, 700, "Pick 3. Document them in public.", size=32, color=ORANGE))
    return svg_doc(1400, 800, p)


# ============================================================ ARTICLE 3
# Tool Stack: "Want a job in 30 days? The 5-site system"

def jobs_header():
    R = Rough(seed=71)
    p = []
    p.append(text(600, 96, "700 apps. 3 interviews.", size=52, bold=True))
    # a person under a huge stack of applications
    p.append(R.stick(300, 360, scale=1.6))
    for i in range(9):
        yy = 210 + i * 20
        p.append(R.rect(150 + i * 3, yy, 300 - i * 6, 18, stroke=GRAY, sw=1.6))
    p.append(text(300, 560, "The manual way", size=32, color=GRAY))
    p.append(R.arrow(560, 360, 700, 360, sw=3, stroke=ORANGE))
    p.append(R.highlight(756, 320, 300, 52))
    p.append(text(910, 360, "Never again.", size=48, bold=True))
    p.append(text(910, 470, "One system,", size=32))
    p.append(text(910, 512, "5 sites, 30 days.", size=32))
    return svg_doc(1200, 675, p)


def jobs_funnel():
    R = Rough(seed=81)
    p = []
    p.append(text(700, 100, "Five sites, one funnel", size=46, bold=True))
    sites = ["Meteor", "HiringCafe", "LinkedIn", "Levels.fyi", "Referrals"]
    n = len(sites)
    top_w, bot_w = 1180, 300
    top_y, bot_y = 190, 470
    for i in range(n + 1):
        t = i / n
        w = top_w + (bot_w - top_w) * t
        y = top_y + (bot_y - top_y) * t
        p.append(R.line(700 - w / 2, y, 700 + w / 2, y, stroke=GRAY, sw=1.8))
    p.append(R.line(700 - top_w / 2, top_y, 700 - bot_w / 2, bot_y))
    p.append(R.line(700 + top_w / 2, top_y, 700 + bot_w / 2, bot_y))
    for i, s in enumerate(sites):
        y = top_y + (bot_y - top_y) * (i + 0.5) / n
        p.append(text(700, y + 12, s, size=32, bold=(i == 0),
                      color=ORANGE if i == 0 else INK))
    p.append(R.arrow(700, bot_y + 8, 700, bot_y + 78, sw=3, stroke=ORANGE))
    p += boxed(R, 540, bot_y + 90, 320, 96, "an offer", size=38, accent=True)
    return svg_doc(1400, 800, p)


def jobs_week():
    R = Rough(seed=91)
    p = []
    p.append(text(700, 100, "The 30-day plan", size=46, bold=True))
    y = 380
    p.append(R.arrow(120, y, 1300, y, sw=2.6))
    weeks = [
        (240, "Week 1", "Set up 5 sites"),
        (520, "Week 2", "Apply at scale"),
        (800, "Week 3", "Chase referrals"),
        (1080, "Week 4", "Interview loops"),
    ]
    for x, w, sub in weeks:
        p.append(R.line(x, y - 16, x, y + 16, sw=2.4))
        p.append(text(x, y - 40, w, size=34, bold=True))
        p.append(text(x, y + 62, sub, size=28, color=GRAY))
    p.append(R.scribble_ring(1080, y, 120, 70, stroke=ORANGE))
    p.append(text(700, 640, "Do this today: create the 5 accounts.", size=30, color=ORANGE))
    return svg_doc(1400, 800, p)


# ============================================================ ARTICLE 4
# Step-by-step: "How to study in the US for free"

def free_header():
    R = Rough(seed=101)
    p = []
    # graduation cap
    cx, cy = 360, 300
    p.append(R.curve([(cx - 140, cy), (cx, cy - 60), (cx + 140, cy),
                      (cx, cy + 60), (cx - 140, cy)]))
    p.append(R.line(cx + 140, cy, cx + 140, cy + 70))
    p.append(R.circle(cx + 140, cy + 78, 8, stroke=ORANGE))
    p.append(R.curve([(cx - 90, cy + 20), (cx - 90, cy + 90), (cx + 90, cy + 90),
                      (cx + 90, cy + 20)], stroke=GRAY, sw=1.8))
    p.append(R.highlight(690, 250, 300, 66))
    p.append(text(840, 300, "$0 tuition", size=72, bold=True))
    p.append(text(600, 520, "A US master's, paid for by the school.", size=36))
    return svg_doc(1200, 675, p)


def free_how():
    R = Rough(seed=111)
    p = []
    p.append(text(700, 110, "How the money actually works", size=44, bold=True))
    p += boxed(R, 120, 330, 380, 180, "TA / RA", size=40, sub="you teach or research")
    p.append(R.arrow(520, 420, 800, 420, sw=3, stroke=ORANGE))
    p += boxed(R, 820, 300, 460, 110, "Tuition waived", size=34, accent=True)
    p += boxed(R, 820, 440, 460, 110, "Monthly stipend", size=34, accent=True)
    p.append(text(700, 640, "Assistantships, not loans.", size=32, color=ORANGE))
    return svg_doc(1400, 800, p)


def free_timeline():
    R = Rough(seed=121)
    p = []
    p.append(text(700, 100, "Start 12 months out", size=46, bold=True))
    y = 380
    p.append(R.arrow(120, y, 1300, y, sw=2.6))
    marks = [
        (250, "Month 12", "Email 20 labs"),
        (560, "Month 9", "GRE + apps"),
        (870, "Month 6", "Ask for funding"),
        (1180, "Month 0", "Fly with a waiver"),
    ]
    for x, m, sub in marks:
        p.append(R.line(x, y - 16, x, y + 16, sw=2.4))
        p.append(text(x, y - 40, m, size=32, bold=True))
        p.append(text(x, y + 62, sub, size=27, color=GRAY))
    p.append(R.check(1180, y - 90, s=2.6, sw=5))
    p.append(text(700, 650, "The stipend beats the loan every time.", size=30, color=ORANGE))
    return svg_doc(1400, 800, p)


IMAGES = {
    "01-leetcode-header.svg": leetcode_header,
    "02-leetcode-myth.svg": leetcode_myth,
    "03-leetcode-loop.svg": leetcode_loop,
    "04-h1b-header.svg": h1b_header,
    "05-h1b-pivot.svg": h1b_pivot,
    "06-h1b-criteria.svg": h1b_criteria,
    "07-jobs-header.svg": jobs_header,
    "08-jobs-funnel.svg": jobs_funnel,
    "09-jobs-week.svg": jobs_week,
    "10-free-header.svg": free_header,
    "11-free-how.svg": free_how,
    "12-free-timeline.svg": free_timeline,
}

if __name__ == "__main__":
    for name, fn in IMAGES.items():
        save(name, fn())
        print("wrote", name)
