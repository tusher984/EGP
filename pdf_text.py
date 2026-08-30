#!/usr/bin/env python3
"""Pure-stdlib text extraction for the e-GP source PDFs (prototype).

The notices were printed from the portal by Chromium, so they are PDF 1.4 with
FlateDecode content streams and /Type0 fonts in /Identity-H encoding: the bytes
in a text-showing operator are 2-byte glyph ids, not characters. Each font
carries a /ToUnicode CMap that maps those ids back to Unicode, so text is
recoverable without any third-party library.
"""
import re
import sys
import zlib

OBJ = re.compile(rb'(\d+)\s+(\d+)\s+obj\b(.*?)\bendobj', re.S)
STREAM = re.compile(rb'stream\r?\n(.*?)\r?\nendstream', re.S)


def objects(raw):
    """number -> raw body bytes for every top-level indirect object."""
    return {int(m.group(1)): m.group(3) for m in OBJ.finditer(raw)}


def stream_of(body):
    """Decompressed stream payload of an object body, or None."""
    m = STREAM.search(body)
    if not m:
        return None
    data = m.group(1)
    if b'/FlateDecode' in body.split(b'stream', 1)[0]:
        try:
            return zlib.decompress(data)
        except zlib.error:
            try:
                return zlib.decompressobj().decompress(data)
            except zlib.error:
                return None
    return data


def cmap_of(payload):
    """glyph id -> text, parsed from a /ToUnicode CMap stream."""
    out = {}
    if not payload:
        return out
    txt = payload.decode('latin-1')

    def uni(h):
        b = bytes.fromhex(h)
        try:
            return b.decode('utf-16-be')
        except UnicodeDecodeError:
            return ''

    for blk in re.findall(r'beginbfchar(.*?)endbfchar', txt, re.S):
        for src, dst in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            out[int(src, 16)] = uni(dst)
    for blk in re.findall(r'beginbfrange(.*?)endbfrange', txt, re.S):
        for lo, hi, dst in re.findall(
                r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            lo, hi = int(lo, 16), int(hi, 16)
            base = int(dst, 16)
            for i in range(lo, min(hi, lo + 65535) + 1):
                out[i] = chr(base + (i - lo))
    return out


def fonts(objs):
    """font object number -> glyph map, following /DescendantFonts if present."""
    maps = {}
    for num, body in objs.items():
        if b'/ToUnicode' not in body:
            continue
        m = re.search(rb'/ToUnicode\s+(\d+)\s+0\s+R', body)
        if m and int(m.group(1)) in objs:
            maps[num] = cmap_of(stream_of(objs[int(m.group(1))]))
    return maps


TOK = re.compile(rb'''
    /(?P<name>[A-Za-z0-9#+._-]+)\s+(?P<size>[\d.]+)?\s*Tf   # font select
  | \[(?P<arr>[^\]]*)\]\s*TJ                                # show array
  | (?P<hex><[0-9A-Fa-f\s]*>)\s*(?P<hop>Tj|')               # show hex string
  | \((?P<lit>(?:\\.|[^()\\])*)\)\s*(?P<lop>Tj|')           # show literal
  | (?P<tx>-?[\d.]+)\s+(?P<ty>-?[\d.]+)\s+(?P<mv>Td|TD)     # move
  | (?P<m>(?:-?[\d.]+\s+){6})Tm                             # text matrix
  | (?P<star>T\*)
''', re.X)
STR_IN_ARR = re.compile(rb'<([0-9A-Fa-f\s]*)>|\((?:\\.|[^()\\])*\)')


def show(raw_str, gmap, is_hex):
    """Decode one text-showing operand through the active font's glyph map."""
    if is_hex:
        h = re.sub(rb'\s', b'', raw_str)
        if len(h) % 2:
            h += b'0'
        data = bytes.fromhex(h.decode('ascii'))
    else:
        data = re.sub(rb'\\([nrtbf()\\])', lambda m: {
            b'n': b'\n', b'r': b'\r', b't': b'\t', b'b': b'\b',
            b'f': b'\f'}.get(m.group(1), m.group(1)), raw_str)
    if not gmap:
        return data.decode('latin-1')
    out = []
    for i in range(0, len(data) - 1, 2):
        out.append(gmap.get((data[i] << 8) | data[i + 1], ''))
    return ''.join(out)


def page_text(content, resfonts, fmaps):
    """Content stream -> text, one line per distinct baseline."""
    lines, cur, y = [], [], None
    gmap = None

    def flush():
        if cur:
            lines.append(''.join(cur).strip())
        del cur[:]

    for m in TOK.finditer(content):
        if m.group('name') is not None:
            gmap = fmaps.get(resfonts.get(m.group('name').decode('latin-1')))
        elif m.group('arr') is not None:
            for s in STR_IN_ARR.finditer(m.group('arr')):
                if s.group(1) is not None:
                    cur.append(show(s.group(1), gmap, True))
                else:
                    cur.append(show(s.group(0)[1:-1], gmap, False))
        elif m.group('hex') is not None:
            cur.append(show(m.group('hex')[1:-1], gmap, True))
        elif m.group('lit') is not None:
            cur.append(show(m.group('lit'), gmap, False))
        elif m.group('mv') is not None or m.group('m') is not None:
            # Tm sets the text matrix absolutely; Td/TD shift it relative to the
            # current line start. Treating a horizontal-only "x 0 Td" as an
            # absolute y=0 move is what splits words onto their own lines.
            if m.group('m') is not None:
                ny = float(m.group('m').split()[-1])
            else:
                ny = (y or 0.0) + float(m.group('ty'))
            if y is None or abs(ny - y) > 0.6:
                flush()
            y = ny
        elif m.group('star'):
            flush()
    flush()
    return '\n'.join(l for l in lines if l)


def extract(path):
    raw = open(path, 'rb').read()
    objs = objects(raw)
    fmaps = fonts(objs)
    pages = []
    for num, body in objs.items():
        if not re.search(rb'/Type\s*/Page\b', body):
            continue
        resfonts = {}
        fm = re.search(rb'/Font\s*<<(.*?)>>', body, re.S)
        blob = fm.group(1) if fm else b''
        if not fm:
            rr = re.search(rb'/Resources\s+(\d+)\s+0\s+R', body)
            if rr and int(rr.group(1)) in objs:
                fm2 = re.search(rb'/Font\s*<<(.*?)>>', objs[int(rr.group(1))], re.S)
                blob = fm2.group(1) if fm2 else b''
        for nm, ref in re.findall(rb'/([A-Za-z0-9#+._-]+)\s+(\d+)\s+0\s+R', blob):
            resfonts[nm.decode('latin-1')] = int(ref)
        parts = []
        for ref in re.findall(rb'/Contents\s+(?:(\d+)\s+0\s+R|\[(.*?)\])', body):
            ids = [ref[0]] if ref[0] else re.findall(rb'(\d+)\s+0\s+R', ref[1])
            for i in ids:
                s = stream_of(objs.get(int(i), b''))
                if s:
                    parts.append(s)
        pages.append((num, page_text(b'\n'.join(parts), resfonts, fmaps)))
    pages.sort()
    return '\n'.join(t for _, t in pages)


if __name__ == '__main__':
    print(extract(sys.argv[1]))
