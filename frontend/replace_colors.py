import os
import glob
import re

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replacements mapping
    replacements = {
        r'bg-\[\#0a0a0f\]': 'bg-background',
        r'bg-\[\#12121a\]': 'bg-card',
        r'bg-\[\#1a1a24\]': 'bg-muted',
        r'border-white/5': 'border-border',
        r'border-white/10': 'border-border',
        r'border-white/20': 'border-border/50',
        r'text-white': 'text-foreground',
        r'text-zinc-300': 'text-muted-foreground',
        r'text-zinc-400': 'text-muted-foreground',
        r'text-zinc-500': 'text-muted-foreground',
        r'text-zinc-600': 'text-muted-foreground',
        r'bg-white/5': 'bg-muted/50',
        r'bg-white/10': 'bg-muted',
        r'bg-white/20': 'bg-muted',
        r'bg-black/40': 'bg-black/40 dark:bg-black/40', # Mockup top bar
        r'hover:text-white': 'hover:text-foreground',
    }

    new_content = content
    for old, new in replacements.items():
        new_content = re.sub(old, new, new_content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('/home/hasan/Desktop/codes/vinentoAI/frontend/src'):
    for file in files:
        if file.endswith('.tsx'):
            replace_in_file(os.path.join(root, file))
