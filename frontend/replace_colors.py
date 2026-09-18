import os
import re

dir_path = 'src'
extensions = ['.jsx', '.js', '.css']

replacements = {
    r'bg-\[\#0B3D20\]': 'bg-primary-dark',
    r'text-\[\#0B3D20\]': 'text-primary-dark',
    r'border-\[\#0B3D20\]': 'border-primary-dark',
    r'\[\#0B3D20\]': 'primary-dark',

    r'bg-\[\#39FF14\]': 'bg-primary',
    r'text-\[\#39FF14\]': 'text-primary',
    r'border-\[\#39FF14\]': 'border-primary',
    r'fill-\[\#39FF14\]': 'fill-primary',
    r'shadow-\[\#39FF14\]': 'shadow-primary',
    r'ring-\[\#39FF14\]': 'ring-primary',
    r'\[\#39FF14\]': 'primary',

    r'bg-\[\#111111\]': 'bg-slate-900',
    r'text-\[\#111111\]': 'text-slate-900',
    r'border-\[\#111111\]': 'border-slate-900',
    r'\[\#111111\]': 'slate-900',

    r'bg-\[\#E5E7E5\]': 'bg-slate-200',
    r'border-\[\#E5E7E5\]': 'border-slate-200',
    r'\[\#E5E7E5\]': 'slate-200',

    r'bg-\[\#F5F7F5\]': 'bg-slate-50',
    r'\[\#F5F7F5\]': 'slate-50',

    r'bg-\[\#8E1B1B\]': 'bg-dark-red',
    r'text-\[\#8E1B1B\]': 'text-dark-red',
    r'\[\#8E1B1B\]': 'dark-red',

    r'bg-\[\#EFFFF0\]': 'bg-emerald-50',
    r'\[\#EFFFF0\]': 'emerald-50',
    
    r'bg-\[\#FFF8F5\]': 'bg-light-green',
    r'\[\#FFF8F5\]': 'light-green',
    
    r'bg-\[\#C62828\]': 'bg-primary-dark',
    r'\[\#C62828\]': 'primary-dark',
}

for root, _, files in os.walk(dir_path):
    for file in files:
        if any(file.endswith(ext) for ext in extensions):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original = content
            for pattern, repl in replacements.items():
                content = re.sub(pattern, repl, content)
                
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
