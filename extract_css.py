"""
One-shot extractor: wyciąga dwa top-level <style>...</style> (blok 1: linie 50-102,
blok 4: linia 5447) z index.html do styles.css. Zostawia inline <style> wewnątrz
stringow JS (blok 2 na linii 3052 i blok 3 na linii 3368).
"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find top-level style blocks by line position (not regex, because grep earlier
# already confirmed exact positions and regex over 1.2MB with JS is risky).
lines = html.split('\n')

# Block 1: begins on line 50 (index 49), ends on line 102 (index 101)
# The <style> opening and </style> closing are on those lines respectively.
block1_start_line = 49  # 0-indexed
block1_end_line = 101

# Block 4: single-line block on line 5447 (index 5446)
block4_line = 5446

# Extract block 1 content
b1_open_line = lines[block1_start_line]
b1_close_line = lines[block1_end_line]
b1_open_idx = b1_open_line.index('<style>')
b1_close_idx = b1_close_line.index('</style>')

if block1_start_line == block1_end_line:
    block1_css = b1_open_line[b1_open_idx+len('<style>'):b1_close_idx]
else:
    head = b1_open_line[b1_open_idx+len('<style>'):]
    middle = '\n'.join(lines[block1_start_line+1:block1_end_line])
    tail = b1_close_line[:b1_close_idx]
    parts = [head] if head else []
    if middle: parts.append(middle)
    if tail: parts.append(tail)
    block1_css = '\n'.join(parts)

# Extract block 4 (single line)
b4 = lines[block4_line]
b4_open = b4.index('<style>')
b4_close = b4.index('</style>')
block4_css = b4[b4_open+len('<style>'):b4_close]

# Write styles.css
css_content = '/* === Main styles (extracted from index.html block 1) === */\n'
css_content += block1_css
css_content += '\n\n/* === Beta button (extracted from index.html block 4) === */\n'
css_content += block4_css
css_content += '\n'

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

# Now replace the style blocks in the HTML.
# Block 1: replace the entire span from <style> on line 50 to </style> on line 102
# with a <link> tag (preserve surrounding line structure).
# Block 4: replace the entire <style>...</style> with empty.

# Rebuild lines list with replacements.
new_lines = []
for i, line in enumerate(lines):
    if i == block1_start_line:
        # Replace from <style> onwards on this line
        prefix = line[:b1_open_idx]
        replacement = prefix + '<link rel="stylesheet" href="styles.css"/>'
        new_lines.append(replacement)
    elif block1_start_line < i < block1_end_line:
        # Skip these lines (content was between <style> tags)
        continue
    elif i == block1_end_line:
        # Keep only what's after </style>
        suffix = b1_close_line[b1_close_idx+len('</style>'):]
        if suffix.strip():
            new_lines.append(suffix)
        # else: drop the line entirely (it was just the closing tag)
    elif i == block4_line:
        # Replace the whole <style>...</style> with empty (or whatever surrounds it)
        before = line[:b4_open]
        after = line[b4_close+len('</style>'):]
        combined = before + after
        if combined.strip():
            new_lines.append(combined)
        # else: drop
    else:
        new_lines.append(line)

new_html = '\n'.join(new_lines)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f'Original HTML: {len(html)} chars, {len(lines)} lines')
print(f'New HTML: {len(new_html)} chars, {new_html.count(chr(10))+1} lines')
print(f'styles.css: {len(css_content)} chars')
print(f'Reduction: {len(html) - len(new_html)} chars ({(len(html)-len(new_html))*100//len(html)}%)')
