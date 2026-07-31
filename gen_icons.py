#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成台风实况 PWA 图标 (纯标准库 PNG 编码, 无第三方依赖)。"""
import zlib, struct, math

def write_png(path, w, h, buf):
    raw = bytearray()
    for y in range(h):
        raw.append(0)  # filter type 0 (None)
        raw.extend(buf[y*w*4:(y+1)*w*4])
    comp = zlib.compress(bytes(raw), 9)
    def chunk(typ, data):
        return (struct.pack(">I", len(data)) + typ + data +
                struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff))
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)  # 8-bit RGBA
    with open(path, "wb") as f:
        f.write(sig + chunk(b"IHDR", ihdr) +
                chunk(b"IDAT", comp) + chunk(b"IEND", b""))

def new_buf(w, h, bg):
    r, g, b = bg
    return bytearray([r, g, b, 255] * (w * h))

def set_px(buf, w, h, x, y, col, a=255):
    if x < 0 or y < 0 or x >= w or y >= h or a <= 0:
        return
    i = (y * w + x) * 4
    br, bg, bb = buf[i], buf[i+1], buf[i+2]
    t = a / 255.0
    buf[i]   = int(br * (1 - t) + col[0] * t)
    buf[i+1] = int(bg * (1 - t) + col[1] * t)
    buf[i+2] = int(bb * (1 - t) + col[2] * t)
    if buf[i+3] < 255:
        buf[i+3] = 255

def disk(buf, w, h, cx, cy, rad, col, a=255):
    r2 = rad * rad
    x0, x1 = max(0, int(cx-rad)), min(w, int(cx+rad)+1)
    y0, y1 = max(0, int(cy-rad)), min(h, int(cy+rad)+1)
    for y in range(y0, y1):
        for x in range(x0, x1):
            dx, dy = x - cx, y - cy
            if dx*dx + dy*dy <= r2:
                set_px(buf, w, h, x, y, col, a)

def draw_typhoon(buf, N, scale=1.0):
    cx = cy = N / 2.0
    cyan = (93, 173, 226)      # #5dade2
    cyan_bright = (120, 200, 240)
    r0 = N * 0.045 * scale
    rmax = N * 0.42 * scale
    k = math.log(rmax / r0) / (4 * math.pi)   # 两圈螺旋
    arm_w = N * 0.052 * scale
    steps = 900
    for arm in range(2):
        phase = arm * math.pi
        for i in range(steps + 1):
            th = (i / steps) * 4 * math.pi
            r = r0 * math.exp(k * th)
            x = cx + r * math.cos(th + phase)
            y = cy + r * math.sin(th + phase)
            a = 120 + int(135 * (1 - i / steps))   # 外圈略淡
            disk(buf, N, N, x, y, arm_w * (1 - 0.35 * i / steps), cyan, a)
    # 台风眼 (白色) + 眼壁高光环
    disk(buf, N, N, cx, cy, N * 0.058 * scale, (235, 245, 255), 255)
    ring_r = N * 0.085 * scale
    for yy in range(int(cy-ring_r-arm_w), int(cy+ring_r+arm_w)+1):
        for xx in range(int(cx-ring_r-arm_w), int(cx+ring_r+arm_w)+1):
            d = math.hypot(xx-cx, yy-cy)
            if abs(d - ring_r) <= arm_w:
                set_px(buf, N, N, xx, yy, cyan_bright, 150)

def make(path, N, scale):
    buf = new_buf(N, N, (10, 22, 40))   # 深蓝底
    draw_typhoon(buf, N, scale)
    write_png(path, N, N, buf)
    print("written", path, N, "scale", scale)

if __name__ == "__main__":
    make("icons/icon-192.png", 192, 1.0)
    make("icons/icon-512.png", 512, 1.0)
    make("icons/icon-maskable-512.png", 512, 0.78)
