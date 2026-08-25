# Inline line-style icon set (24x24, stroke=currentColor) used across the site.

def icon(name, size=24, stroke=1.8):
    paths = ICON_PATHS[name]
    return (
        f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" '
        f'stroke="currentColor" stroke-width="{stroke}" stroke-linecap="round" '
        f'stroke-linejoin="round" aria-hidden="true" focusable="false">{paths}</svg>'
    )

ICON_PATHS = {
    "shield-check": '<path d="M12 3l7 3v6c0 4.4-2.9 8.3-7 9.5-4.1-1.2-7-5.1-7-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
    "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    "heart": '<path d="M12 20s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.6-9.5 9-9.5 9z"/>',
    "phone": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    "mail": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/>',
    "star": '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.6L12 17.6l-5.8 3 1.1-6.6L2.5 9.4l6.6-.9z"/>',
    "quote": '<path d="M7 7c-2.2 0-4 1.8-4 4v6h6v-6H6.2C6.4 9.2 7.9 8 9.8 8V6.5A5.5 5.5 0 0 0 7 7z"/><path d="M17 7c-2.2 0-4 1.8-4 4v6h6v-6h-2.8c.2-1.8 1.7-3 3.6-3V6.5A5.5 5.5 0 0 0 17 7z"/>',
    "arrow-right": '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
    "calendar": '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M16 3v3M8 3v3M3 9.5h18"/>',
    "users": '<path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 20v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
    "home": '<path d="M4 11.5L12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>',
    "briefcase": '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M2.5 12h19"/>',
    "book-open": '<path d="M3 5.5c2.5-1.3 5.5-1.3 9 0v13c-3.5-1.3-6.5-1.3-9 0z"/><path d="M21 5.5c-2.5-1.3-5.5-1.3-9 0v13c3.5-1.3 6.5-1.3 9 0z"/>',
    "check": '<polyline points="20 6 9 17 4 12"/>',
    "chevron-down": '<polyline points="6 9 12 15 18 9"/>',
    "menu": '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    "external-link": '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    "instagram": '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1"/>',
    "facebook": '<path d="M14 9h3V5.5h-3A4 4 0 0 0 10 9.5V12H7.5v3.5H10V22h3.5v-6.5H16l.5-3.5h-3V10a1 1 0 0 1 1-1z"/>',
    "shield": '<path d="M12 3l7 3v6c0 4.4-2.9 8.3-7 9.5-4.1-1.2-7-5.1-7-9.5V6z"/>',
    "handshake": '<path d="M2 12l4-4 3 2 3-3 3 3 4-4 3 3-6 6-3-2-3 3-3-2z"/><path d="M8 10l4 4"/>',
    "compass": '<circle cx="12" cy="12" r="9"/><polygon points="15 9 13.5 13.5 9 15 10.5 10.5 15 9"/>',
    "smile": '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
    "award": '<circle cx="12" cy="8" r="5"/><path d="M8.5 12.5L7 21l5-2.5L17 21l-1.5-8.5"/>',
    "file-text": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>',
    "help-circle": '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.9.5-1.1 1-1.1 1.8"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    "grass": '<path d="M4 20c0-5 1-8 2-11"/><path d="M9 20c0-6 1-10 3-14"/><path d="M14 20c0-6-1-10-3-14"/><path d="M19 20c0-5-1-8-2-11"/>',
    "droplet": '<path d="M12 2.5s7 8 7 13a7 7 0 1 1-14 0c0-5 7-13 7-13z"/>',
    "leaf": '<path d="M20 4C10 4 4 10 4 18v2h2c8 0 14-6 14-16z"/><path d="M6 20c4-4 8-8 14-14"/>',
    "layers": '<polygon points="12 3 21 8 12 13 3 8"/><polyline points="3 13 12 18 21 13"/><polyline points="3 17.5 12 22.5 21 17.5"/>',
    "snowflake": '<line x1="12" y1="2" x2="12" y2="22"/><line x1="4" y1="7" x2="20" y2="17"/><line x1="20" y1="7" x2="4" y2="17"/><path d="M12 2l2 2M12 2l-2 2M12 22l2-2M12 22l-2-2"/>',
    "sun": '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    "thumbs-up": '<path d="M7 22V11l5-9 1 1v6h6a2 2 0 0 1 2 2.2l-1.2 8A2 2 0 0 1 17.8 22H7z"/><path d="M7 11H3v11h4"/>',
}
