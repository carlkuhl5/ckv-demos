#!/usr/bin/env python3
"""Static site generator for Simple Care Services LLC (residential improvements,
Louisville, KY — owner Drew Johnson). Assembles all pages from shared
header/footer/nav partials + per-page content, per
SimpleCareServicesLLC_WebsiteRedesign_PRD.docx. Run: python3 build/build.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from icons import icon
import illustrations as art

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------- constants
SITE_NAME = "Simple Care Services LLC"
TAGLINE = "Simply done the right way"
DOMAIN = "simplecarellc.com"
BASE_URL = f"https://{DOMAIN}"
OWNER_NAME = "Drew Johnson"
PHONE = "502-472-5166"
PHONE_TEL = "+15024725166"
EMAIL = "drewwjohn@icloud.com"
LOCATION = "Louisville, KY"
INSTAGRAM_HANDLE = "@simplecareservices_llc"
INSTAGRAM_URL = "https://www.instagram.com/simplecareservices_llc"
FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61584220916955"

SERVICES = [
    {
        "slug": "lawn-care",
        "name": "Lawn Care",
        "seo_target": "Lawn care Louisville KY",
        "intro": "Keeping your lawn looking its best takes consistent care and the right equipment. Simple Care Services LLC provides reliable lawn care for Louisville homeowners — from routine mowing to seasonal cleanup.",
        "existing_copy": "From weekly mowing to fertilization, sod installation, and weed control, we provide the services needed to keep your lawn healthy and well-maintained year-round.",
        "included": ["Mowing & edging", "Trimming & blowing", "Seasonal cleanups", "Weed control assistance", "Year-round maintenance plans available"],
        "card_desc": "Routine mowing, edging, and seasonal cleanup to keep your lawn healthy year-round.",
        "icon": "grass",
        "photo": "assets/img/photos/service-lawn-care.jpg",
    },
    {
        "slug": "pressure-washing",
        "name": "Pressure Washing",
        "seo_target": "Pressure washing Louisville KY",
        "intro": "Years of dirt, grime, and mildew can dull any surface. Our pressure washing service restores driveways, siding, decks, fences, and more — leaving your property looking fresh and well-maintained.",
        "existing_copy": "Restore the life of your property with our pressure washing services. We clean driveways, houses, siding, limestone, brick and other outdoor surfaces, removing dirt, grime, mold, and stains to leave them looking brand new and clean.",
        "included": ["Driveway & concrete cleaning", "House / siding wash", "Deck & patio cleaning", "Fence cleaning", "Sidewalks & walkways"],
        "card_desc": "Restore driveways, siding, decks, and fences — dirt, grime, and mildew gone.",
        "icon": "droplet",
        "photo": "assets/img/photos/service-pressure-washing.jpg",
    },
    {
        "slug": "landscaping",
        "name": "Landscaping",
        "seo_target": "Landscaping Louisville KY",
        "intro": "Transform your outdoor space with professional landscaping from Simple Care Services. Whether you're starting from scratch or refreshing existing beds, we handle the details so you can enjoy the results.",
        "existing_copy": "Improve the look of your property with our landscaping services. We provide planting, mulching, trimming, general yard maintenance, and seasonal spring and fall cleanups to keep your property looking its best year-round.",
        "included": ["Mulching & bed maintenance", "Shrub and hedge trimming", "Planting & bed design", "Grading & drainage improvements", "Seasonal landscape refresh"],
        "card_desc": "Planting, mulching, and bed design to transform your outdoor space.",
        "icon": "leaf",
        "photo": "assets/img/photos/service-landscaping.jpg",
    },
    {
        "slug": "concrete-sealing",
        "name": "Concrete Sealing",
        "seo_target": "Concrete sealing Louisville KY",
        "intro": "Protect your driveway, patio, or walkway from weathering, staining, and cracking. Concrete sealing is one of the most cost-effective ways to extend the life of your concrete surfaces.",
        "existing_copy": "Protect your concrete from water, stains, and wear. We seal driveways, patios, and sidewalks to help them last longer and look better. We also fill cracks to prevent further damage and keep your concrete in great shape.",
        "included": ["Driveway sealing", "Patio & walkway sealing", "Surface prep & cleaning", "Crack treatment prior to sealing", "Weather-resistant sealant application"],
        "card_desc": "Protect driveways and patios from weathering, staining, and cracking.",
        "icon": "layers",
        "photo": "assets/img/photos/service-concrete-sealing.jpg",
    },
    {
        "slug": "snow-removal",
        "name": "Snow Removal",
        "seo_target": "Snow removal Louisville KY",
        "intro": "Don't let a Louisville winter slow you down. Simple Care Services provides prompt, reliable snow removal so your driveway and walkways are clear and safe when you need them.",
        "existing_copy": "Stay safe and worry-free during the winter season with our reliable snow removal services. We provide prompt snow plowing and clearing for driveways, sidewalks, walkways, and parking areas to help keep your property accessible and safe. Whether it's a light snowfall or a major winter storm, our team is ready to keep your property clear, protected, and looking its best.",
        "included": ["Driveway snow clearing", "Sidewalk & walkway clearing", "De-icing treatment", "Seasonal contracts available", "Residential service throughout Louisville"],
        "card_desc": "Prompt, reliable snow plowing and clearing for driveways and walkways.",
        "icon": "snowflake",
        "photo": "assets/img/photos/service-snow-removal.jpg",
    },
    {
        "slug": "outdoor-lighting",
        "name": "Outdoor Lighting",
        "seo_target": "Outdoor lighting installation Louisville KY",
        "intro": "Outdoor lighting enhances your property's curb appeal, security, and usability after dark. Simple Care Services installs quality outdoor lighting systems designed to complement your home and landscape.",
        "existing_copy": "Enhance the beauty, safety, and functionality of your property with professional outdoor lighting services. We install and maintain landscape, pathway, and holiday lighting, to highlight your home's best features while improving curb appeal. Whether you're looking to create a welcoming atmosphere or increase nighttime safety, we provide customized lighting solutions tailored to your needs.",
        "included": ["Landscape & accent lighting", "Pathway lighting", "Security / flood lighting", "Holiday / seasonal lighting setup", "Consultation on placement and design"],
        "card_desc": "Landscape, pathway, and security lighting that enhances curb appeal after dark.",
        "icon": "sun",
        "photo": "assets/img/photos/service-outdoor-lighting.jpg",
    },
]

NAV_ITEMS = [
    ("Home", "index.html", "home"),
    ("About", "about.html", "about"),
    ("Services", "services.html", "services"),
    ("Testimonials", "testimonials.html", "testimonials"),
]

FOOTER_QUICK_LINKS = [
    ("Home", "index.html"),
    ("About", "about.html"),
    ("Services", "services.html"),
    ("Testimonials", "testimonials.html"),
    ("Get a Free Estimate", "estimate.html"),
]

CARE_TYPE_OPTIONS = [s["name"] for s in SERVICES] + ["Other", "Not Sure"]

# Sample testimonial layout — real, client-approved reviews required before launch (PRD 6.2).
TESTIMONIALS = [
    {
        "text": "Drew and his crew showed up on time and did an incredible job on our lawn. It looks better than it has in years.",
        "name": "A Happy Homeowner",
        "location": "Louisville, KY",
        "service": "Lawn Care",
    },
    {
        "text": "Our driveway and siding were covered in years of grime. The pressure washing made the whole house look brand new.",
        "name": "A Happy Homeowner",
        "location": "Louisville, KY",
        "service": "Pressure Washing",
    },
    {
        "text": "Professional, honest, and reasonably priced. Simple Care Services sealed our patio and it looks fantastic.",
        "name": "A Happy Homeowner",
        "location": "Louisville, KY",
        "service": "Concrete Sealing",
    },
    {
        "text": "They cleared our driveway first thing during a big snowstorm so we could get to work. Really reliable team.",
        "name": "A Happy Homeowner",
        "location": "Louisville, KY",
        "service": "Snow Removal",
    },
    {
        "text": "The new landscape lighting completely transformed the front of our house at night. Great communication throughout.",
        "name": "A Happy Homeowner",
        "location": "Louisville, KY",
        "service": "Outdoor Lighting",
    },
]

# ---------------------------------------------------------------- helpers

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def head(title, description, path, root):
    canonical = f"{BASE_URL}/{path}" if path != "index.html" else f"{BASE_URL}/"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="{SITE_NAME}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="{root}assets/img/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/css/style.css?v=2">
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "{SITE_NAME}",
  "description": "Residential improvements in Louisville, KY: lawn care, pressure washing, landscaping, concrete sealing, snow removal, and outdoor lighting.",
  "url": "{BASE_URL}/",
  "telephone": "{PHONE_TEL}",
  "email": "{EMAIL}",
  "address": {{
    "@type": "PostalAddress",
    "addressLocality": "Louisville",
    "addressRegion": "KY",
    "addressCountry": "US"
  }},
  "areaServed": "Louisville, KY and surrounding areas",
  "sameAs": ["{INSTAGRAM_URL}", "{FACEBOOK_URL}"]
}}
</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
"""


def nav(root, active):
    def cur(key):
        return ' class="current"' if key == active else ""

    services_open = ' class="has-dropdown open"' if active == "services" else ' class="has-dropdown"'
    links = []
    for label, href, key in NAV_ITEMS:
        if key == "services":
            sub = "".join(
                f'<li><a href="{root}services/{s["slug"]}.html">{esc(s["name"])}</a></li>'
                for s in SERVICES
            )
            links.append(
                f'<li{services_open}><a href="{root}{href}"{cur(key)} aria-haspopup="true">Services {icon("chevron-down", 14, 2)}</a>'
                f'<ul class="dropdown">{sub}<li><a href="{root}services.html"><strong>View All Services</strong></a></li></ul></li>'
            )
        else:
            links.append(f'<li><a href="{root}{href}"{cur(key)}>{esc(label)}</a></li>')

    return f"""<header class="site-header">
  <div class="header-inner">
    <a href="{root}index.html" class="brand" aria-label="{SITE_NAME} — Home">
      <img src="{root}assets/img/logo.svg" alt="{SITE_NAME}" width="200" height="46">
    </a>
    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <nav class="main-nav" aria-label="Primary">
      <ul>
        {''.join(links)}
        <li><a href="{root}estimate.html" class="btn btn-primary nav-cta">Get a Free Estimate</a></li>
      </ul>
    </nav>
  </div>
</header>
<div class="nav-backdrop"></div>
"""


def footer(root):
    quick = "".join(f'<li><a href="{root}{href}">{esc(label)}</a></li>' for label, href in FOOTER_QUICK_LINKS)
    service_links = "".join(
        f'<li><a href="{root}services/{s["slug"]}.html">{esc(s["name"])}</a></li>' for s in SERVICES
    )
    return f"""<footer class="site-footer">
  <div class="container footer-top">
    <div class="footer-brand">
      <img src="{root}assets/img/logo-white.svg" alt="{SITE_NAME}" width="200" height="46">
      <p>&ldquo;{TAGLINE}&rdquo;<br>Locally owned and operated in {LOCATION}.</p>
      <div class="footer-social">
        <a href="{INSTAGRAM_URL}" aria-label="{SITE_NAME} on Instagram" target="_blank" rel="noopener">{icon('instagram', 18, 1.8)}</a>
        <a href="{FACEBOOK_URL}" aria-label="{SITE_NAME} on Facebook" target="_blank" rel="noopener">{icon('facebook', 18, 1.8)}</a>
      </div>
    </div>
    <div>
      <h4>Quick Links</h4>
      <ul>{quick}</ul>
    </div>
    <div>
      <h4>Services</h4>
      <ul>{service_links}</ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>&copy; <span data-year>2026</span> {SITE_NAME}. All rights reserved.</span>
    <span><a href="tel:{PHONE_TEL}">{PHONE}</a> &nbsp;·&nbsp; {LOCATION}</span>
  </div>
</footer>
<script src="{root}assets/js/main.js"></script>
</body>
</html>
"""


def breadcrumb(root, trail):
    parts = [f'<a href="{root}index.html">Home</a>']
    for label, href in trail:
        if href:
            parts.append(f'<a href="{root}{href}">{esc(label)}</a>')
        else:
            parts.append(esc(label))
    return f'<nav class="breadcrumb" aria-label="Breadcrumb">{" &nbsp;/&nbsp; ".join(parts)}</nav>'


def page_hero(title, lead, root, trail):
    return f"""<section class="page-hero">
  <div class="container">
    {breadcrumb(root, trail)}
    <h1>{esc(title)}</h1>
    <p class="lead">{lead}</p>
  </div>
</section>
"""


def art_figure(svg, extra_class=""):
    return f'<div class="art-figure {extra_class}">{svg}</div>'


def photo_figure(root, src, alt, extra_class=""):
    return f'<div class="art-figure {extra_class}"><img src="{root}{src}" alt="{esc(alt)}" loading="lazy"></div>'


def trust_bar():
    items = [
        ("shield-check", "Locally Owned &amp; Operated"),
        ("map-pin", "Louisville, KY"),
        ("award", "4+ Years Experience"),
    ]
    inner = '<div class="trust-divider"></div>'.join(
        f'<div class="trust-item">{icon(i, 22, 1.8)}<span>{label}</span></div>' for i, label in items
    )
    return f"""<div class="trust-bar"><div class="container"><div class="trust-list">{inner}</div></div></div>"""


def services_preview_grid(root):
    cards = ""
    for s in SERVICES:
        cards += f"""<a href="{root}services/{s['slug']}.html" class="svc-card reveal">
      <div class="svc-media"><img src="{root}{s['photo']}" alt="{esc(s['name'])} in Louisville, KY" loading="lazy"></div>
      <div class="svc-overlay"></div>
      <div class="svc-content">
        <h3>{esc(s['name'])}</h3>
        <span class="svc-link">Learn More {icon('arrow-right', 14, 2)}</span>
      </div>
    </a>"""
    return f'<div class="grid grid-3">{cards}</div>'


def testimonial_cards(items):
    cards = ""
    for t in items:
        stars = icon("star", 16, 0) * 5
        cards += f"""<div class="testimonial-card reveal" data-testimonial-service="{esc(t['service'])}">
      <div class="testimonial-stars" aria-label="5 out of 5 stars">{stars}</div>
      <p class="testimonial-text">&ldquo;{esc(t['text'])}&rdquo;</p>
      <p class="testimonial-name">{esc(t['name'])}</p>
      <p class="testimonial-rel">{esc(t['location'])} &middot; {esc(t['service'])}</p>
    </div>"""
    return cards


def testimonials_preview_section(root):
    return f"""<section class="section">
  <div class="container">
    <div class="section-head center">
      <div class="eyebrow">Testimonials &amp; Reviews</div>
      <h2>What Our Customers Say</h2>
    </div>
    <div class="testimonial-row">{testimonial_cards(TESTIMONIALS[:3])}</div>
    <div class="center" style="margin-top:32px;"><a href="{root}testimonials.html" class="btn-ghost">See All Reviews {icon('arrow-right', 15, 2)}</a></div>
  </div>
</section>
"""


def estimate_cta_block(root, message):
    return f"""<div class="center" style="margin-top:32px;">
  <p class="lead" style="max-width:600px;margin:0 auto 20px;">{message}</p>
  <a href="{root}estimate.html" class="btn btn-primary">Get a Free Estimate</a>
</div>
"""


def related_services(root, current_slug):
    links = "".join(
        f'<a href="{root}services/{s["slug"]}.html">{esc(s["name"])}</a>'
        for s in SERVICES if s["slug"] != current_slug
    )
    return f"""<div style="margin-top:56px;">
  <h3>Related Services</h3>
  <div class="related-services">{links}</div>
</div>
"""


def cta_panel(root, service_name=None):
    heading = f"Get a Free {service_name} Estimate" if service_name else "Get a Free Estimate"
    return f"""<aside class="cta-panel">
  <h3>{heading}</h3>
  <div class="contact-line">{icon('phone', 18, 1.8)}<span><a href="tel:{PHONE_TEL}" style="color:#fff;">{PHONE}</a></span></div>
  <div class="contact-line">{icon('mail', 18, 1.8)}<span><a href="mailto:{EMAIL}" style="color:#fff;">{EMAIL}</a></span></div>
  <div class="contact-line">{icon('map-pin', 18, 1.8)}<span>{LOCATION}</span></div>
  <a href="{root}estimate.html" class="btn btn-primary btn-block">Request Estimate</a>
</aside>
"""


def honeypot():
    return '<div class="honeypot-field" aria-hidden="true"><label for="hp_field">Leave this field empty</label><input type="text" id="hp_field" name="hp_field" tabindex="-1" autocomplete="off"></div>'


def form_success(message):
    return f"""<div class="form-success" role="alert">
  {icon('check', 32, 2)}
  <h3 style="color:var(--color-primary);">Thanks!</h3>
  <p style="margin:0;">{message}</p>
</div>
"""

# ---------------------------------------------------------------- pages

def page_home(root):
    hero = f"""<section class="home-hero" style="background-image: linear-gradient(180deg, rgba(10,16,28,0.7) 0%, rgba(10,16,28,0.55) 45%, rgba(10,16,28,0.82) 100%), url('{root}assets/img/photos/hero-home.jpg');">
  <div class="container">
    <h1>Simply Done the Right Way.</h1>
    <p class="lead">Residential improvements for Louisville, KY homeowners. Lawn care, pressure washing, landscaping, and more.</p>
    <div class="hero-actions">
      <a href="{root}estimate.html" class="btn btn-primary">Get a Free Estimate</a>
      <a href="{root}services.html" class="btn btn-secondary-white">See Our Services</a>
    </div>
    <div class="hero-trust">{icon('shield-check', 18, 1.8)}<span>Locally owned &amp; operated &middot; Louisville, KY &middot; 4+ Years Experience</span></div>
  </div>
</section>
"""
    services_section = f"""<section class="section">
  <div class="container">
    <div class="section-head center">
      <div class="eyebrow">What We Do</div>
      <h2>Residential Services Built for Louisville Homes</h2>
    </div>
    {services_preview_grid(root)}
    <div class="center" style="margin-top:40px;"><a href="{root}services.html" class="btn btn-secondary">View All Services</a></div>
  </div>
</section>
"""
    about_snapshot = f"""<section class="section section-offwhite">
  <div class="container">
    <div class="feature-split">
      <div class="feature-media reveal">{art_figure(art.ABOUT_OWNER, 'wide')}</div>
      <div class="reveal">
        <div class="eyebrow">About Simple Care Services</div>
        <h2>About Simple Care Services</h2>
        <p>With over four years of experience in the service industry, Simple Care Services is dedicated to providing reliable, high-quality work and exceptional customer care. From the initial consultation to the completion of the job, we focus on professionalism, integrity, and attention to detail.</p>
        <a href="{root}about.html" class="btn-ghost">Meet {OWNER_NAME.split()[0]} {icon('arrow-right', 15, 2)}</a>
      </div>
    </div>
  </div>
</section>
"""
    bottom_cta = f"""<section class="section section-navy cta-band">
  <div class="container">
    <h2>Ready to get started?</h2>
    <p>Call for a free estimate today. No pressure, no obligation.</p>
    <a href="{root}estimate.html" class="btn btn-primary">Get a Free Estimate</a>
  </div>
</section>
"""
    return hero + services_section + about_snapshot + testimonials_preview_section(root) + bottom_cta


def page_about(root):
    hero = page_hero("About Simple Care Services LLC", f"{OWNER_NAME}, Owner", root, [("About", None)])
    story = f"""<section class="section">
  <div class="container">
    <div class="feature-split">
      <div class="feature-media reveal">{art_figure(art.ABOUT_OWNER, 'tall')}</div>
      <div class="reveal">
        <div class="eyebrow">{OWNER_NAME}, Owner</div>
        <p>With over four years of experience in the service industry, Simple Care Services is dedicated to providing reliable, high-quality work and exceptional customer care.</p>
        <p>We believe every customer deserves honesty, respect, and outstanding service. We are committed to excellence and ensuring that every client is satisfied with the work we provide. Our goal is to leave a lasting positive impression with every project.</p>
        <p>Our team takes great care in every project we complete. We are committed to ensuring that each customer is fully satisfied with the work provided, and we continuously work to exceed expectations whenever possible. From the initial consultation to the completion of the job, we focus on professionalism, integrity, and attention to detail.</p>
        <a href="{root}estimate.html" class="btn btn-primary">Get a Free Estimate</a>
      </div>
    </div>
  </div>
</section>
"""
    values = [
        ("handshake", "Honesty &amp; Respect", "Every customer deserves straightforward communication and to be treated right."),
        ("award", "Excellence in Every Project", "We hold our work to a high standard from the first visit to the final walkthrough."),
        ("shield-check", "Professionalism &amp; Integrity", "We show up, do what we say, and take pride in the details."),
    ]
    value_cards = "".join(
        f"""<div class="value-card reveal"><div class="value-icon">{icon(i, 28, 1.8)}</div><h3>{t}</h3><p style="color:var(--color-muted);font-size:15px;">{d}</p></div>"""
        for i, t, d in values
    )
    core_values = f"""<section class="section section-offwhite">
  <div class="container">
    <div class="section-head center"><div class="eyebrow">Our Values</div><h2>What Guides Our Work</h2></div>
    <div class="grid grid-3">{value_cards}</div>
  </div>
</section>
"""
    return hero + story + core_values


def page_services_overview(root):
    hero = page_hero("Our Services", "Here at Simple Care Services LLC, caring is our expression of excellence. Whatever the project, we deliver quality residential improvement services to Louisville, KY homeowners.", root, [("Services", None)])
    cards = ""
    for s in SERVICES:
        cards += f"""<div class="svc-card-lg reveal">
      <a href="{root}services/{s['slug']}.html" class="svc-card">
        <div class="svc-media"><img src="{root}{s['photo']}" alt="{esc(s['name'])} in Louisville, KY" loading="lazy"></div>
        <div class="svc-overlay"></div>
        <div class="svc-content"><h3>{esc(s['name'])}</h3></div>
      </a>
      <p>{esc(s['card_desc'])}</p>
      <a href="{root}services/{s['slug']}.html" class="card-link">Learn More {icon('arrow-right', 16, 2)}</a>
    </div>"""
    body = f"""<section class="section">
  <div class="container">
    <div class="grid grid-3">{cards}</div>
  </div>
</section>
"""
    return hero + body


def page_service_detail(root, service):
    trail = [("Services", "services.html"), (service["name"], None)]
    hero = page_hero(service["name"], service["intro"], root, trail)
    included = "".join(
        f'<li>{icon("check", 18, 2)}<span>{esc(item)}</span></li>' for item in service["included"]
    )
    content = f"""<section class="section">
  <div class="container">
    <div class="service-layout">
      <div class="reveal">
        {photo_figure(root, service['photo'], f"{service['name']} in Louisville, KY", 'wide')}
        <div style="margin-top:32px;">
          <p>{esc(service['existing_copy'])}</p>
          <h3 style="margin-top:32px;">What's Included</h3>
          <ul class="included-list">{included}</ul>
        </div>
        {related_services(root, service['slug'])}
      </div>
      <div class="reveal">{cta_panel(root, service['name'])}</div>
    </div>
  </div>
</section>
"""
    return hero + content


def page_testimonials(root):
    hero = page_hero("What Louisville Homeowners Are Saying", "Real feedback from customers across Louisville, KY.", root, [("Testimonials", None)])
    filters = ["All Services"] + [s["name"] for s in SERVICES]
    filter_buttons = "".join(
        f'<button type="button" class="btn {"btn-primary" if i == 0 else "btn-secondary"}" data-filter="{"all" if i == 0 else esc(f)}" aria-pressed="{"true" if i == 0 else "false"}">{esc(f)}</button>'
        for i, f in enumerate(filters)
    )
    cards = "".join(
        f"""<div class="testimonial-card reveal" data-testimonial-service="{esc(t['service'])}">
      <div class="testimonial-stars" aria-label="5 out of 5 stars">{icon('star', 16, 0) * 5}</div>
      <p class="testimonial-text">&ldquo;{esc(t['text'])}&rdquo;</p>
      <p class="testimonial-name">{esc(t['name'])}</p>
      <p class="testimonial-rel">{esc(t['location'])} &middot; {esc(t['service'])}</p>
    </div>"""
        for t in TESTIMONIALS
    )
    body = f"""<section class="section">
  <div class="container">
    <div class="badge center" style="display:table;margin:0 auto 32px;">Sample layout — final reviews to be supplied by {OWNER_NAME} before launch</div>
    <div data-testimonial-filter style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:40px;">{filter_buttons}</div>
    <div class="grid grid-2">{cards}</div>
    <div class="mv-block center" style="margin-top:48px;">
      <h3 style="margin-bottom:8px;">Had a great experience?</h3>
      <p style="margin-bottom:16px;">We'd love for you to leave us a Google review.</p>
      <a href="https://www.google.com/search?q={SITE_NAME.replace(' ', '+')}+Louisville+KY" target="_blank" rel="noopener" class="btn btn-primary">Leave a Google Review</a>
    </div>
  </div>
</section>
"""
    return hero + body


def page_estimate(root):
    hero = page_hero("Get a Free Estimate", "Tell us about your project and we'll get back to you quickly. No pressure, no obligation.", root, [("Get a Free Estimate", None)])
    care_options = "".join(f'<option value="{esc(o)}">{esc(o)}</option>' for o in CARE_TYPE_OPTIONS)
    form = f"""<section class="section">
  <div class="container" style="max-width:640px;">
    <div class="mv-block center" style="margin-bottom:32px;">
      <p style="margin:0;"><strong>{LOCATION}</strong> &nbsp;·&nbsp; <a href="{INSTAGRAM_URL}" target="_blank" rel="noopener">{INSTAGRAM_HANDLE}</a></p>
    </div>
    <div class="form-wrap">
      <form data-simple-form novalidate>
        {honeypot()}
        <div class="form-row">
          <div class="form-group">
            <label for="e_name">Full Name</label>
            <input type="text" id="e_name" name="full_name" required>
            <span class="form-error">Please enter your full name.</span>
          </div>
          <div class="form-group">
            <label for="e_phone">Phone Number</label>
            <input type="tel" id="e_phone" name="phone" inputmode="tel" required>
            <span class="form-error">Please enter your phone number.</span>
          </div>
        </div>
        <div class="form-group">
          <label for="e_email">Email Address</label>
          <input type="email" id="e_email" name="email">
          <span class="hint">Optional, but helpful if you prefer email follow-up.</span>
        </div>
        <div class="form-group">
          <label for="e_service">Service Needed</label>
          <select id="e_service" name="service" required>
            <option value="">Select&hellip;</option>
            {care_options}
          </select>
          <span class="form-error">Please select a service.</span>
        </div>
        <div class="form-group">
          <label for="e_desc">Project Description</label>
          <textarea id="e_desc" name="project_description"></textarea>
        </div>
        <div class="form-group">
          <label>Preferred Contact Method</label>
          <div class="choice-grid">
            <div class="choice-card"><input type="radio" name="contact_method" id="cm_phone" value="Phone"><label for="cm_phone">Phone</label></div>
            <div class="choice-card"><input type="radio" name="contact_method" id="cm_email" value="Email"><label for="cm_email">Email</label></div>
            <div class="choice-card"><input type="radio" name="contact_method" id="cm_either" value="Either" checked><label for="cm_either">Either</label></div>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Request My Free Estimate</button>
        <p style="font-size:13px;color:var(--color-muted);margin-top:16px;text-align:center;">This is an estimate request, not a live booking. {OWNER_NAME.split()[0]} will follow up with you within 1 business day.</p>
      </form>
      {form_success(f"We've received your request. {OWNER_NAME.split()[0]} will follow up with you within 1 business day.")}
    </div>
  </div>
</section>
"""
    return hero + form


def page_404(root):
    return f"""<section class="error-page">
  <div class="container center">
    <p class="error-code">404</p>
    <h1>Page Not Found</h1>
    <p class="lead" style="max-width:480px;margin:0 auto 28px;">The page you're looking for may have moved. Let's get you back on track.</p>
    <a href="{root}index.html" class="btn btn-primary">Return Home</a>
  </div>
</section>
"""

# ---------------------------------------------------------------- registry

def build_page(out_path, title, description, active, body_fn, root=""):
    rel = out_path.replace(os.sep, "/")
    html = head(title, description, rel, root) + nav(root, active) + f'<main id="main">{body_fn(root)}</main>' + footer(root)
    full_path = os.path.join(ROOT, out_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"wrote {out_path}")


def main():
    build_page("index.html",
        f"{SITE_NAME} | Residential Improvements in Louisville, KY",
        "Locally owned residential improvements in Louisville, KY: lawn care, pressure washing, landscaping, concrete sealing, snow removal, and outdoor lighting. Get a free estimate.",
        "home", page_home)

    build_page("about.html",
        f"About {SITE_NAME} | {OWNER_NAME} — Louisville, KY",
        f"Meet {OWNER_NAME}, owner of {SITE_NAME}, a locally owned residential improvements company serving Louisville, KY homeowners.",
        "about", page_about)

    build_page("services.html",
        f"Our Services | {SITE_NAME} — Louisville, KY",
        "Explore residential improvement services from Simple Care Services LLC: lawn care, pressure washing, landscaping, concrete sealing, snow removal, and outdoor lighting.",
        "services", page_services_overview)

    for s in SERVICES:
        build_page(f"services/{s['slug']}.html",
            f"{s['name']} {LOCATION.split(',')[0]} KY | {SITE_NAME}",
            f"{s['intro'][:150].rsplit(' ', 1)[0]}&hellip; Call {SITE_NAME} for a free estimate.",
            "services", lambda root, s=s: page_service_detail(root, s), root="../")

    build_page("testimonials.html",
        f"What Louisville Homeowners Are Saying | {SITE_NAME}",
        f"Read reviews and testimonials from homeowners served by {SITE_NAME} in {LOCATION}.",
        "testimonials", page_testimonials)

    build_page("estimate.html",
        f"Get a Free Estimate | {SITE_NAME} — Louisville, KY",
        f"Request a free estimate from {SITE_NAME}. Tell us about your project and we'll follow up within 1 business day.",
        "estimate", page_estimate)

    build_page("404.html",
        f"Page Not Found | {SITE_NAME}",
        "The page you're looking for could not be found.",
        "", page_404)


if __name__ == "__main__":
    main()
