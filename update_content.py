import re

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the description
content = content.replace(
    'A heartfelt digital journey crafted with love and dedication.',
    'A hilarious interactive quiz with 25 Bangla questions to discover your Chapri score!'
)
content = content.replace(
    'Experience an interactive story that transcends the ordinary.',
    'Stunning animations, dynamic background, and epic meme gallery.'
)

# Replace the tags
content = content.replace('💍 Romantic', '🔥 Interactive Quiz')
content = content.replace('🎭 Story-Driven', '😎 Fun & Engaging')

# Write back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated successfully!")
