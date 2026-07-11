import os

for filename in os.listdir('.'):
    if filename.endswith('.html') and filename not in ['marquee.html', 'nav.html', 'footer.html']:
        filepath = os.path.join('.', filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'marquee-placeholder' in content:
            print(f"Skipping {filename} (already has marquee-placeholder)")
            continue
            
        lines = content.split('\n')
        new_lines = []
        modified = False
        for line in lines:
            if 'id="nav-placeholder"' in line or "id='nav-placeholder'" in line:
                # Get the indentation
                indent_length = len(line) - len(line.lstrip())
                indent = line[:indent_length]
                new_lines.append(f"{indent}<div id=" + '"' + "marquee-placeholder" + '"' + "></div>")
                new_lines.append(line)
                modified = True
            else:
                new_lines.append(line)
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))
            print(f"Updated {filename}")
