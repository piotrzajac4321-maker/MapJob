"""Inline styles.css and design_refresh.css back into index.html
so the HTML is self-contained (user only uploaded index.html).
"""
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('styles.css', 'r', encoding='utf-8') as f:
    styles = f.read()

with open('design_refresh.css', 'r', encoding='utf-8') as f:
    design = f.read()

# Build replacement: two <style> blocks with the CSS content.
replacement = (
    '<style id="styles-inline">\n' + styles + '\n</style>\n'
    '<style id="design-refresh-inline">\n' + design + '\n</style>'
)

# The two <link> tags sit on adjacent lines in the file.
old = '<link rel="stylesheet" href="styles.css"/>\n<link rel="stylesheet" href="design_refresh.css"/>'
assert old in html, 'Could not locate the two <link> tags'
new_html = html.replace(old, replacement, 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f'Before: {len(html)} bytes')
print(f'After:  {len(new_html)} bytes')
print(f'Inlined: {len(styles) + len(design)} bytes of CSS')
