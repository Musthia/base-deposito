#!/usr/bin/env python3
"""
Generador de abecedario SVG — letras gruesas, redondeadas y legibles.
Genera un SVG combinado a partir de un texto.

Uso:
    python generar_abecedario.py "HOLA MUNDO" -o salida.svg
    python generar_abecedario.py "DATACORR" --spacing 180 --scale 1.5
"""

import argparse
import os

LETRAS = {}

def L(ch, paths):
    LETRAS[ch] = paths

# Cada entrada es una cadena de path (d) — sin nodos circulares
# Las letras usan curvas suaves (Q, C) donde corresponde para mayor legibilidad

L('A', [
    "M 50,218 L 50,158 Q 50,142 64,142 L 96,62 Q 102,52 108,62 L 140,142 Q 154,142 154,158 L 154,218",
    "M 66,132 L 134,132",
])

L('B', [
    "M 45,218 L 45,46 Q 45,34 57,34 L 132,34 Q 168,34 168,70 L 168,108 Q 168,144 132,144 L 57,144 Q 45,144 45,132 L 45,218",
    "M 64,54 L 64,100 Q 64,118 82,118 L 120,118 Q 150,118 150,90 L 150,54 Q 150,42 130,42",
    "M 64,144 L 64,182 Q 64,200 82,200 L 118,200 Q 148,200 148,172 L 148,144",
])

L('C', [
    "M 55,42 L 130,42 Q 168,42 168,80 L 168,160 Q 168,198 130,198 L 55,198 Q 42,198 42,185",
    "M 60,62 L 60,178 Q 60,170 68,170 L 125,170 Q 155,170 155,145 L 155,54 Q 155,42 142,42",
])

L('D', [
    "M 42,218 L 42,46 Q 42,34 54,34 L 132,34 Q 168,34 168,72 L 168,168 Q 168,204 132,204 L 54,204 Q 42,204 42,192 L 42,218",
    "M 62,54 L 126,54 Q 150,54 150,82 L 150,158 Q 150,186 126,186 L 62,186",
])

L('E', [
    "M 40,218 L 40,46 L 148,46",
    "M 40,132 L 128,132",
    "M 40,218 L 138,218",
    "M 60,64 L 120,64 L 120,110",
    "M 60,154 L 110,154 L 110,200",
])

L('F', [
    "M 40,218 L 40,46 L 148,46",
    "M 40,132 L 120,132",
    "M 60,64 L 115,64 L 115,108",
    "M 55,154 L 55,200",
])

L('G', [
    "M 130,42 L 168,42 L 168,52",
    "M 42,90 L 42,145 Q 42,198 68,210 L 105,214 Q 140,218 155,195 L 168,172",
    "M 62,100 L 62,152 Q 62,158 68,158 L 140,158",
    "M 118,158 L 155,158",
    "M 52,72 L 128,72",
])

L('H', [
    "M 40,218 L 40,46 L 48,46",
    "M 152,46 L 152,218 L 144,218",
    "M 48,132 L 152,132",
    "M 60,64 L 60,200",
    "M 140,64 L 140,200",
    "M 32,46 L 48,46",
    "M 152,46 L 168,46",
])

L('I', [
    "M 100,46 L 100,218",
    "M 70,46 L 130,46",
    "M 70,218 L 130,218",
    "M 108,64 L 108,200",
])

L('J', [
    "M 140,46 L 140,170 L 130,200 L 108,218 L 78,214 L 55,195 L 42,175",
    "M 112,46 L 140,46",
    "M 122,64 L 122,160 L 115,182 L 98,195 L 78,190",
])

L('K', [
    "M 40,218 L 40,46 L 48,46",
    "M 48,132 L 148,46",
    "M 58,142 L 158,218",
    "M 32,46 L 48,46",
])

L('L', [
    "M 40,46 L 40,218 L 152,218",
    "M 60,64 L 60,200 L 128,200",
    "M 32,46 L 48,46",
])

L('M', [
    "M 40,218 L 40,46 L 48,46",
    "M 152,46 L 152,218 L 144,218",
    "M 48,46 L 110,140 L 152,46",
    "M 68,64 L 110,115 L 152,64",
    "M 32,46 L 48,46",
    "M 152,46 L 168,46",
])

L('N', [
    "M 40,218 L 40,46 L 48,46",
    "M 152,46 L 152,218 L 144,218",
    "M 48,46 L 152,218",
    "M 68,64 L 140,190",
    "M 32,46 L 48,46",
    "M 152,46 L 168,46",
])

L('O', [
    "M 100,42 L 62,48 L 42,80 L 38,120 L 42,160 L 62,190 L 100,200 L 135,194 L 158,165 L 168,125 Q 168,110 160,92 L 140,72 L 110,62",
    "M 56,96 L 52,125 Q 52,128 55,130 L 115,130 Q 145,130 145,108 L 145,72 Q 145,58 132,52 Z",
])

L('P', [
    "M 40,218 L 40,46 L 48,46",
    "M 48,46 L 132,46 Q 162,46 162,78 L 162,108 Q 162,140 132,140 L 48,140",
    "M 66,64 L 118,64 Q 142,64 142,88 L 142,100 Q 142,118 118,118 L 66,118",
    "M 55,160 L 55,200",
])

L('Q', [
    "M 100,42 L 62,48 L 42,80 L 38,120 L 42,160 L 62,190 L 100,200 L 135,194 L 158,165 L 168,125 Q 168,110 160,92 L 140,72 L 110,62",
    "M 56,96 L 52,125 Q 52,128 55,130 L 115,130 Q 145,130 145,108 L 145,72 Q 145,58 132,52 Z",
    "M 128,175 L 158,218",
])

L('R', [
    "M 40,218 L 40,46 L 48,46",
    "M 48,46 L 132,46 Q 162,46 162,78 L 162,108 Q 162,140 132,140 L 48,140",
    "M 66,64 L 118,64 Q 142,64 142,88 L 142,100 Q 142,118 118,118 L 66,118",
    "M 55,140 L 150,218",
    "M 68,152 L 138,198",
])

L('S', [
    "M 130,46 L 155,46 Q 168,46 168,62 L 168,78 Q 168,94 155,96 L 120,102 L 70,112 L 45,130 L 40,155 Q 40,172 52,180 L 80,190 Q 108,196 130,200",
    "M 115,62 L 140,62 Q 148,62 148,72 L 148,82 Q 148,90 138,92 L 108,98 L 72,108 L 58,118 Q 52,122 54,132",
    "M 70,172 L 100,178 Q 128,182 148,190",
])

L('T', [
    "M 32,46 L 168,46",
    "M 100,46 L 100,218",
    "M 82,64 L 82,200",
    "M 118,64 L 118,200",
    "M 42,80 L 158,80",
])

L('U', [
    "M 42,46 L 42,175 Q 42,205 62,215 L 100,218 Q 138,218 158,200 L 168,172",
    "M 60,64 L 60,155 Q 60,178 80,185 L 120,185 Q 140,185 145,165 L 145,64",
    "M 32,46 L 48,46",
    "M 160,46 L 175,46",
])

L('V', [
    "M 42,46 L 102,208 L 112,218",
    "M 158,46 L 102,208",
    "M 60,64 L 102,200",
    "M 140,64 L 108,200",
    "M 72,46 L 132,46",
])

L('W', [
    "M 42,46 L 72,208 L 82,218",
    "M 82,218 L 112,128 L 142,218",
    "M 142,218 L 158,46",
    "M 60,64 L 72,190",
    "M 96,118 L 108,200",
    "M 128,64 L 142,190",
    "M 68,46 L 148,46",
])

L('X', [
    "M 42,46 L 158,218",
    "M 158,46 L 42,218",
    "M 58,64 L 148,192",
    "M 148,64 L 58,192",
    "M 68,46 L 138,46",
    "M 68,218 L 138,218",
])

L('Y', [
    "M 42,46 L 102,128 L 102,218",
    "M 158,46 L 102,128",
    "M 60,64 L 102,115 L 144,64",
    "M 85,155 L 85,200",
    "M 119,155 L 119,200",
    "M 68,46 L 138,46",
    "M 102,155 L 102,200",
])

L('Z', [
    "M 42,46 L 158,46 L 158,58",
    "M 148,72 L 52,198",
    "M 42,218 L 158,218",
    "M 58,72 L 140,192",
    "M 58,200 L 148,200",
    "M 52,64 L 148,64",
])

L('0', [
    "M 100,42 L 62,48 L 42,80 L 38,120 L 42,160 L 62,190 L 100,200 L 135,194 L 158,165 L 168,125 Q 168,110 160,92 L 140,72 L 110,62",
    "M 56,96 L 52,125 Q 52,128 55,130 L 115,130 Q 145,130 145,108 L 145,72 Q 145,58 132,52 Z",
])

L('1', [
    "M 85,72 L 108,46 L 108,218",
    "M 78,218 L 138,218",
    "M 118,64 L 118,200",
])

L('2', [
    "M 42,78 L 58,66 L 88,62 L 122,68 L 148,82 L 160,108 L 162,132 L 148,155 L 105,178 L 55,202 L 38,218 L 168,218",
    "M 62,64 L 88,58 L 112,62 L 132,78 L 138,100 L 128,122 L 105,140",
])

L('3', [
    "M 62,68 L 128,62 Q 155,62 155,88 L 155,105 Q 155,122 138,130 L 108,134",
    "M 95,138 L 132,140 Q 158,142 162,165 L 162,182 Q 158,205 132,210 L 95,208",
    "M 72,78 L 110,72 Q 130,72 134,90 L 134,108",
    "M 70,160 L 105,158 Q 128,158 132,172 L 132,188 Q 128,202 105,205 L 78,205",
])

L('4', [
    "M 118,46 L 118,218",
    "M 42,138 L 138,138",
    "M 42,138 L 62,72 L 82,46",
    "M 62,88 L 58,125 L 72,128",
    "M 108,64 L 108,200",
    "M 132,64 L 132,200",
])

L('5', [
    "M 148,46 L 60,46 L 50,100 L 55,108 L 128,112 L 155,128 L 160,158 L 148,192 L 118,212 L 80,218 L 52,200",
    "M 72,80 L 128,80 Q 140,80 140,92 L 135,102 Q 128,108 118,106",
    "M 62,140 L 112,142 Q 138,142 142,158 L 142,180 Q 138,200 112,202 L 82,202",
])

L('6', [
    "M 142,46 Q 165,46 165,70 L 165,95 Q 165,125 142,135 L 108,140 Q 78,144 55,125 L 42,105 Q 35,82 42,60 Q 48,42 68,36 L 92,30 L 118,34",
    "M 55,100 L 60,135 Q 65,168 90,180 L 120,172 Q 148,164 152,140 L 152,115",
    "M 72,152 L 78,185 Q 85,205 108,210 Q 128,210 140,192 L 142,168",
])

L('7', [
    "M 42,46 L 168,46 L 168,58",
    "M 148,72 L 128,135 L 105,185 L 85,218",
    "M 128,82 L 112,130 L 92,175",
    "M 52,62 L 152,62",
])

L('8', [
    "M 100,42 L 65,48 Q 42,52 42,78 L 42,105 Q 42,130 65,138 L 100,142 Q 130,146 150,135 L 160,115 Q 165,100 155,82 L 135,68 L 110,62",
    "M 55,160 L 50,185 Q 52,210 75,215 L 105,210 Q 135,205 145,180 L 148,155",
    "M 60,88 L 55,110 Q 52,128 72,138 L 100,140 Q 128,138 138,120 L 140,100 Q 138,82 120,75 L 98,72",
    "M 62,180 L 72,198 Q 95,210 118,202 L 132,188",
])

L('9', [
    "M 62,42 Q 42,42 38,65 L 42,95 Q 45,120 62,130 L 100,140 Q 140,142 155,125 L 162,105 Q 165,80 142,65 L 110,52",
    "M 148,168 L 152,198 Q 150,220 125,225 L 90,220 Q 58,212 52,188 L 55,160",
    "M 60,78 L 52,105 Q 50,125 68,135 L 100,138 Q 128,135 138,118 L 140,98",
    "M 125,180 L 132,200 Q 118,212 92,208",
])

L(' ', [])


def generar_svg(texto, spacing=200, scale=1.0):
    texto = texto.upper()
    letras = list(texto)
    L = 200
    H = 240
    total_width = len(letras) * spacing + (spacing - L)

    lines = []
    lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_width} {H}" width="{total_width * scale}" height="{H * scale}">')
    lines.append('  <style>')
    lines.append('    .pista { fill: none; stroke: #111111; stroke-width: 10; stroke-linecap: round; stroke-linejoin: round; }')
    lines.append('  </style>')

    for idx, ch in enumerate(letras):
        if ch not in LETRAS:
            continue
        paths = LETRAS[ch]
        offset_x = idx * spacing

        for d in paths:
            new_d = []
            tokens = d.split()
            for token in tokens:
                if token in ('M', 'L', 'C', 'Q', 'Z'):
                    new_d.append(token)
                elif ',' in token:
                    x, y = token.split(',')
                    new_d.append(f'{float(x) + offset_x},{y}')
                else:
                    new_d.append(token)
            translated = ' '.join(new_d)
            lines.append(f'  <path class="pista" d="{translated}" />')

    lines.append('</svg>')
    return '\n'.join(lines)


def generar_letras_individuales(dest_dir):
    os.makedirs(dest_dir, exist_ok=True)
    for ch, paths in LETRAS.items():
        if ch == ' ':
            continue
        lines = []
        lines.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">')
        lines.append('  <style>')
        lines.append('    .pista { fill: none; stroke: #111111; stroke-width: 10; stroke-linecap: round; stroke-linejoin: round; }')
        lines.append('  </style>')
        for d in paths:
            lines.append(f'  <path class="pista" d="{d}" />')
        lines.append('</svg>')
        filename = f"letra_{ch if ch.isalnum() else 'espacio'}.svg"
        filepath = os.path.join(dest_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"  Creado: {filename}")


def main():
    parser = argparse.ArgumentParser(description='Generador de abecedario SVG — estilo tipográfico limpio')
    parser.add_argument('texto', nargs='?', default='DATACORR', help='Texto a generar')
    parser.add_argument('-o', '--output', default='', help='Archivo SVG de salida')
    parser.add_argument('--spacing', type=int, default=200, help='Separación entre letras (default: 200)')
    parser.add_argument('--scale', type=float, default=1.0, help='Escala (default: 1.0)')
    parser.add_argument('--individuales', action='store_true', help='Generar SVGs individuales de cada letra')
    parser.add_argument('--dest', default='letras_svg', help='Directorio destino para letras individuales')

    args = parser.parse_args()

    if args.individuales:
        print("Generando letras individuales...")
        generar_letras_individuales(args.dest)
        print(f"Listo. Archivos en: {args.dest}")
        return

    svg = generar_svg(args.texto, args.spacing, args.scale)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(svg)
        print(f"SVG guardado en: {args.output}")
    else:
        print(svg)


if __name__ == '__main__':
    main()