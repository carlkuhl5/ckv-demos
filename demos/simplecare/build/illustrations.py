# Decorative abstract illustrations used in place of on-site photography.
# Navy (#1B2A4A) + gold (#B8922A) abstract compositions themed to each service.
# Per PRD Section 7.4, these are placeholders — swap for Drew's real job-site
# photos before launch (owner-supplied photos take priority per branding continuity).

def _svg(inner, w=400, h=300):
    return f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">{inner}</svg>'


LAWN_CARE = _svg('''
<rect width="400" height="300" fill="#E8EDF5"/>
<circle cx="330" cy="60" r="70" fill="#FDF3DC"/>
<circle cx="330" cy="60" r="34" fill="#B8922A" opacity="0.85"/>
<g fill="#1B2A4A">
  <rect y="150" width="400" height="18"/>
  <rect y="178" width="400" height="18" fill="#28406b"/>
  <rect y="206" width="400" height="18"/>
  <rect y="234" width="400" height="18" fill="#28406b"/>
  <rect y="262" width="400" height="18"/>
</g>
<g stroke="#FDF3DC" stroke-width="3" stroke-linecap="round">
  <line x1="40" y1="150" x2="40" y2="130"/>
  <line x1="90" y1="150" x2="90" y2="125"/>
  <line x1="140" y1="150" x2="140" y2="132"/>
</g>
''')

PRESSURE_WASHING = _svg('''
<rect width="400" height="300" fill="#F1E8CE"/>
<rect x="40" y="60" width="220" height="200" fill="#1B2A4A"/>
<rect x="70" y="100" width="50" height="60" fill="#E8EDF5"/>
<rect x="180" y="100" width="50" height="60" fill="#E8EDF5"/>
<rect x="120" y="190" width="60" height="70" fill="#0f1830"/>
<g stroke="#B8922A" stroke-width="3" stroke-linecap="round" opacity="0.9">
  <line x1="300" y1="240" x2="230" y2="160"/>
  <line x1="310" y1="220" x2="245" y2="150"/>
  <line x1="320" y1="200" x2="255" y2="140"/>
</g>
<circle cx="330" cy="250" r="18" fill="#B8922A"/>
<rect x="320" y="255" width="60" height="10" rx="5" fill="#1B2A4A"/>
''')

LANDSCAPING = _svg('''
<rect width="400" height="300" fill="#FDF3DC"/>
<rect y="220" width="400" height="80" fill="#1B2A4A" opacity="0.08"/>
<g fill="#1B2A4A">
  <circle cx="90" cy="200" r="42"/>
  <circle cx="150" cy="180" r="30"/>
  <circle cx="60" cy="175" r="26"/>
</g>
<g fill="#B8922A">
  <circle cx="260" cy="210" r="36"/>
  <circle cx="310" cy="190" r="24"/>
</g>
<rect x="20" y="235" width="360" height="14" rx="7" fill="#D8D0BE"/>
<g stroke="#1B2A4A" stroke-width="3" stroke-linecap="round">
  <line x1="200" y1="260" x2="200" y2="220"/>
  <line x1="215" y1="260" x2="215" y2="230"/>
</g>
''')

CONCRETE_SEALING = _svg('''
<rect width="400" height="300" fill="#E8EDF5"/>
<polygon points="0,300 60,120 340,120 400,300" fill="#c7cfdd"/>
<polygon points="60,120 340,120 320,180 80,180" fill="#dfe4ee"/>
<g stroke="#1B2A4A" stroke-width="2" opacity="0.35">
  <line x1="130" y1="150" x2="118" y2="220"/>
  <line x1="200" y1="140" x2="200" y2="240"/>
  <line x1="270" y1="150" x2="282" y2="220"/>
</g>
<rect x="60" y="235" width="280" height="14" rx="4" fill="#B8922A" opacity="0.85"/>
<rect x="140" y="255" width="60" height="26" rx="5" fill="#1B2A4A"/>
<circle cx="150" cy="281" r="8" fill="#0f1830"/>
<circle cx="190" cy="281" r="8" fill="#0f1830"/>
''')

SNOW_REMOVAL = _svg('''
<rect width="400" height="300" fill="#1B2A4A"/>
<polygon points="0,300 60,150 340,150 400,300" fill="#E8EDF5"/>
<g fill="#ffffff">
  <circle cx="60" cy="60" r="4"/><circle cx="120" cy="40" r="3"/><circle cx="200" cy="70" r="4"/>
  <circle cx="280" cy="45" r="3"/><circle cx="340" cy="80" r="4"/><circle cx="30" cy="110" r="3"/>
  <circle cx="370" cy="120" r="3"/>
</g>
<path d="M100 260 L150 210 L250 210 L300 260 Z" fill="#c7cfdd"/>
<rect x="150" y="230" width="40" height="30" rx="4" fill="#B8922A"/>
<g stroke="#1B2A4A" stroke-width="4" stroke-linecap="round">
  <line x1="210" y1="255" x2="250" y2="200"/>
</g>
<polygon points="240,205 265,195 258,220" fill="#1B2A4A"/>
''')

OUTDOOR_LIGHTING = _svg('''
<rect width="400" height="300" fill="#0f1830"/>
<circle cx="330" cy="55" r="46" fill="#B8922A" opacity="0.18"/>
<g stroke="#1B2A4A" stroke-width="4">
  <line x1="70" y1="300" x2="70" y2="150"/>
  <line x1="200" y1="300" x2="200" y2="120"/>
  <line x1="330" y1="300" x2="330" y2="150"/>
</g>
<g fill="#B8922A">
  <circle cx="70" cy="145" r="12"/>
  <circle cx="200" cy="115" r="14"/>
  <circle cx="330" cy="145" r="12"/>
</g>
<g fill="#FDF3DC" opacity="0.55">
  <circle cx="70" cy="145" r="26"/>
  <circle cx="200" cy="115" r="30"/>
  <circle cx="330" cy="145" r="26"/>
</g>
<polygon points="0,300 400,300 400,260 0,260" fill="#1B2A4A"/>
''')

ABOUT_OWNER = _svg('''
<rect width="400" height="300" fill="#E8EDF5"/>
<circle cx="330" cy="230" r="120" fill="#FDF3DC"/>
<circle cx="180" cy="120" r="44" fill="#1B2A4A"/>
<path d="M120 240c0-34 27-60 60-60s60 26 60 60" fill="#1B2A4A"/>
<rect x="150" y="235" width="60" height="8" rx="4" fill="#B8922A"/>
<g stroke="#B8922A" stroke-width="4" stroke-linecap="round">
  <line x1="255" y1="150" x2="290" y2="115"/>
  <line x1="290" y1="115" x2="270" y2="95"/>
</g>
''')

CREW_TEAM = _svg('''
<rect width="400" height="300" fill="#FDF3DC"/>
<circle cx="80" cy="70" r="90" fill="#F1E8CE"/>
<g fill="none" stroke="#1B2A4A" stroke-width="0">
</g>
<g>
  <circle cx="130" cy="150" r="30" fill="#1B2A4A"/>
  <path d="M90 230c0-24 18-42 40-42s40 18 40 42" fill="#1B2A4A"/>
  <circle cx="220" cy="130" r="34" fill="#B8922A"/>
  <path d="M174 230c0-28 20-48 46-48s46 20 46 48" fill="#B8922A"/>
  <circle cx="310" cy="160" r="26" fill="#1B2A4A" opacity="0.85"/>
  <path d="M276 230c0-20 15-36 34-36s34 16 34 36" fill="#1B2A4A" opacity="0.85"/>
</g>
<path d="M40 250h320" stroke="#1B2A4A" stroke-width="4" stroke-linecap="round" opacity="0.25"/>
''')

MISSION_ABSTRACT = _svg('''
<rect width="400" height="300" fill="#121D33"/>
<circle cx="80" cy="230" r="150" fill="#1B2A4A"/>
<circle cx="340" cy="60" r="120" fill="#24365c"/>
<path d="M140 190l40-70 40 70z" fill="none" stroke="#B8922A" stroke-width="5" stroke-linejoin="round"/>
<circle cx="200" cy="105" r="10" fill="#B8922A"/>
''')

# Ordered to match SERVICES list in build.py: lawn-care, pressure-washing,
# landscaping, concrete-sealing, snow-removal, outdoor-lighting
SERVICE_VARIANTS = [LAWN_CARE, PRESSURE_WASHING, LANDSCAPING, CONCRETE_SEALING, SNOW_REMOVAL, OUTDOOR_LIGHTING]

PHOTO_STRIP_EXTRA = [
    _svg('''<rect width="400" height="300" fill="#E8EDF5"/><rect y="180" width="400" height="120" fill="#1B2A4A"/><rect y="160" width="400" height="20" fill="#28406b"/><circle cx="330" cy="70" r="50" fill="#FDF3DC"/>'''),
    _svg('''<rect width="400" height="300" fill="#FDF3DC"/><circle cx="100" cy="150" r="70" fill="#1B2A4A"/><circle cx="260" cy="180" r="50" fill="#B8922A"/><rect y="250" width="400" height="50" fill="#D8D0BE"/>'''),
]
