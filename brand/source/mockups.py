"""Writes the Boterra AI mockup HTML files; shoot.mjs renders every [data-shot] element to PNG."""

LOGO = "out/logos/svg/"
HEAD = '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="brand.css"><style>{css}</style></head><body style="background:#3a3f4a;padding:40px;display:flex;flex-direction:column;gap:40px;align-items:flex-start">{body}</body></html>'

# ---------- icon set: 24px grid, 1.75 stroke, round caps, one accent node ----------
ICONS = {
    "intake": '<path d="M4 13h4l2 3h4l2-3h4"/><path d="M5 6h14l1 7v5H4v-5z"/>',
    "calendar": '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    "invoice": '<path d="M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21z"/><path d="M10 8h4M10 12h4"/>',
    "document": '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
    "followup": '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4h-4"/>',
    "chart": '<path d="M4 20h16"/><path d="M7 16v-4M12 16V8M17 16v-7"/>',
    "shield": '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    "bolt": '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    "clock": '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    "check": '<path d="M5 12l4 4 10-10"/>',
    "users": '<circle cx="9" cy="9" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M16 11a3 3 0 1 0 0-6M21 20c0-3-1.8-5.2-4.5-5.8"/>',
    "flow": '<rect x="3" y="4" width="7" height="6" rx="2"/><rect x="14" y="14" width="7" height="6" rx="2"/><path d="M6.5 10v4a3 3 0 0 0 3 3H14"/>',
    "home": '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>',
    "settings": '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    "search": '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    "bell": '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>',
    "phone": '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    "globe": '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>',
    "play": '<path d="M8 5v14l11-7z"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
}
def icon(name, size=24, color="currentColor", node=True, sw=1.75):
    n = '<circle cx="20" cy="4" r="2.4" fill="#14E0C0" stroke="none"/>' if node else ""
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}{n}</svg>')

def logo(variant, h, kind="horizontal"):
    return f'<img src="{LOGO}boterra-{kind}-{variant}.svg" style="height:{h}px;width:auto;display:block;align-self:flex-start">'

AGENTS = [
    ("intake", "Intake Agent", "AGT-01 · INTAKE", "Captures enquiries from forms, calls and email, qualifies them and routes each one."),
    ("calendar", "Scheduling Agent", "AGT-02 · SCHEDULING", "Books, reschedules and reminds clients automatically, cutting no-shows."),
    ("invoice", "Billing Agent", "AGT-03 · BILLING", "Issues invoices, chases late payments and reconciles to your books."),
    ("document", "Document Agent", "AGT-04 · DOCUMENTS", "Drafts letters, engagement docs and summaries from your own templates."),
    ("followup", "Follow-up Agent", "AGT-05 · FOLLOW-UP", "Keeps every lead, client and review request warm without you lifting a finger."),
    ("chart", "Reporting Agent", "AGT-06 · REPORTING", "Sends a Monday briefing with the numbers, risks and wins that matter."),
]
PLANS = [
    ("Starter", "$0", "Free forever", ["9 core agents", "150 AI credits / month", "1 automated workflow", "Approval inbox"], False),
    ("Growth", "$49", "per month", ["19 agents", "2,000 AI credits / month", "Multi-agent workflows", "10 automations"], True),
    ("Scale", "$149", "per month", ["All 26 agents", "8,000 AI credits / month", "Autopilot mode", "Priority support"], False),
    ("Enterprise", "Custom", "tailored", ["Custom agents", "SSO & data residency", "Dedicated success team", "White-label"], False),
]

# ======================= WEBSITE =======================
def website(theme):
    d = theme == "dark"
    lv = "gradient" if d else "color-light"
    mesh = "out/patterns/mesh-dark.svg" if d else "out/patterns/mesh-light.svg"
    grid = "grid-bg-dark" if d else "grid-bg-light"
    hero_bg = ("radial-gradient(900px 600px at 78% 20%, rgba(123,92,255,.28), transparent 60%), radial-gradient(700px 500px at 10% 0%, rgba(43,92,255,.30), transparent 60%), #0A1230"
               if d else "radial-gradient(900px 600px at 78% 20%, rgba(123,92,255,.12), transparent 60%), radial-gradient(700px 500px at 10% 0%, rgba(43,92,255,.12), transparent 60%), #F7F9FC")
    steps = [("01", "Map", "In a 30-minute call we map the workflow that eats most of your week."),
             ("02", "Automate", "Agents run it end to end, with your approval on every critical step."),
             ("03", "Monitor", "A live dashboard, full audit trail and a weekly hours-saved report.")]
    wf = [("intake", "New intake form", "Trigger", "done"), ("users", "Qualify & check insurance", "Intake Agent", "done"),
          ("calendar", "Book first appointment", "Scheduling Agent", "run"), ("bell", "Reminder 24h before", "Follow-up Agent", "wait")]
    status = {"done": ("Done", "#19C37D"), "run": ("Running", "#14E0C0"), "wait": ("Queued", "#9AA5BF" if d else "#5E6A85")}
    wf_html = "".join(f'''<div style="display:flex;align-items:center;gap:16px;padding:16px 18px;border-radius:14px;border:1px solid var(--line);background:{'rgba(255,255,255,.03)' if d else '#F7F9FC'}">
        <span style="width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:{'rgba(43,92,255,.18)' if d else 'rgba(43,92,255,.08)'};color:{'#C9D5FF' if d else '#2B5CFF'}">{icon(ic, 22, node=False)}</span>
        <div style="flex:1"><div style="font-weight:700;font-size:16px;color:var(--fg)">{t}</div><div class="label" style="font-size:11px;margin-top:3px">{sub}</div></div>
        <span class="pill" style="font-size:12px;border-color:transparent;background:{'rgba(255,255,255,.06)' if d else '#EEF1F6'};color:{status[s][1]}">● {status[s][0]}</span></div>''' for ic, t, sub, s in wf)
    feats = "".join(f'''<div class="card" style="padding:30px;display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;justify-content:space-between;align-items:center"><span style="width:52px;height:52px;border-radius:14px;display:grid;place-items:center;background:{'linear-gradient(135deg,rgba(43,92,255,.35),rgba(123,92,255,.2))' if d else 'linear-gradient(135deg,rgba(43,92,255,.12),rgba(123,92,255,.08))'};color:{'#E6ECFF' if d else '#2B5CFF'}">{icon(ic, 26)}</span><span class="label" style="font-size:11px">{code}</span></div>
        <div class="display" style="font-size:22px;letter-spacing:-0.015em">{t}</div><p style="font-size:16px;line-height:1.6;color:var(--muted)">{txt}</p></div>''' for ic, t, code, txt in AGENTS)
    plans = "".join(f'''<div class="card" style="padding:30px;display:flex;flex-direction:column;gap:18px;{'border:1.5px solid transparent;background:linear-gradient(var(--planbg),var(--planbg)) padding-box,linear-gradient(135deg,#2B5CFF,#7B5CFF,#14E0C0) border-box;' if hl else ''}">
        <div style="display:flex;justify-content:space-between;align-items:center"><div class="display" style="font-size:20px">{n}</div>{'<span class="pill" style="font-size:11px;background:var(--bt-blue);color:#fff;border:0">MOST POPULAR</span>' if hl else ''}</div>
        <div><span class="display" style="font-size:48px">{p}</span><span style="color:var(--muted);font-size:15px;margin-left:8px">{per}</span></div>
        <div style="display:flex;flex-direction:column;gap:10px">{''.join(f'<div style="display:flex;gap:10px;align-items:center;font-size:15px;color:var(--fg)"><span style="color:var(--accentText)">{icon("check", 18, node=False, sw=2.2)}</span>{f}</div>' for f in fs)}</div>
        <div class="btn {'btn-primary' if hl else 'btn-ghost'}" style="justify-content:center;margin-top:auto">{'Start 14-day trial' if p not in ('$0', 'Custom') else ('Start free' if p == '$0' else 'Talk to sales')}</div></div>''' for n, p, per, fs, hl in PLANS)
    inputs = "".join(f'<div style="display:flex;flex-direction:column;gap:8px"><span class="label" style="font-size:11px">{l}</span><div style="height:52px;border-radius:12px;border:1px solid var(--line);background:{"rgba(255,255,255,.03)" if d else "#fff"};padding:0 16px;display:flex;align-items:center;color:{"#6F7A96" if d else "#8A94A8"};font-size:15px">{ph}</div></div>' for l, ph in [("Full name", "Dr. Maya Chen"), ("Work email", "maya@northshoreclinic.ca"), ("Business type", "Clinic ▾")])
    return f'''<div data-shot="web-{theme}" class="{theme}" style="width:1440px;--planbg:{'#0F1838' if d else '#FFFFFF'}">
  <section data-shot="web-{theme}-hero" style="position:relative;overflow:hidden;background:{hero_bg};padding:0 96px 96px">
    <div class="{grid}" style="position:absolute;inset:0;opacity:.9"></div>
    <img src="{mesh}" style="position:absolute;right:-120px;top:-40px;width:1100px;opacity:{'.55' if d else '.7'}">
    <nav style="position:relative;display:flex;align-items:center;justify-content:space-between;height:96px">{logo(lv, 34)}
      <div style="display:flex;gap:36px;font-size:15px;font-weight:600;color:var(--muted)"><span>Product</span><span>Agents</span><span>Industries</span><span>Pricing</span><span>Resources</span></div>
      <div style="display:flex;gap:12px;align-items:center"><span style="font-weight:600;font-size:15px;color:var(--fg);padding:0 12px">Log in</span><span class="btn btn-primary" style="height:46px">Book a demo</span></div></nav>
    <div style="position:relative;display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center;margin-top:64px">
      <div style="display:flex;flex-direction:column;gap:28px">
        <span class="pill" style="align-self:flex-start;background:{'rgba(255,255,255,.04)' if d else '#fff'}"><span class="dot"></span>Agents that run your workflows 24/7</span>
        <h1 class="display" style="font-size:84px;line-height:1.02;letter-spacing:-0.04em">Your busiest workflow,<br>now on <span class="grad-text">autopilot.</span></h1>
        <p style="font-size:21px;line-height:1.55;color:var(--muted);max-width:600px">Boterra AI turns your most painful repetitive workflow into an AI-powered system that runs 24/7 and never gets tired.</p>
        <div style="display:flex;gap:14px"><span class="btn btn-primary" style="height:58px;font-size:17px;padding:0 28px">Automate my first workflow {icon("arrow", 20, node=False, sw=2)}</span><span class="btn btn-ghost" style="height:58px;font-size:17px">{icon("play", 18, node=False)} Watch the 2-min demo</span></div>
        <div style="display:flex;gap:26px;font-size:14px;color:var(--muted);font-weight:600">{''.join(f'<span style="display:flex;gap:8px;align-items:center"><span style="color:var(--accentText)">{icon("check", 16, node=False, sw=2.4)}</span>{x}</span>' for x in ["Live in days, not months", "Human approval on key steps", "Cancel anytime"])}</div>
      </div>
      <div class="card" style="padding:26px;display:flex;flex-direction:column;gap:12px;background:{'rgba(15,24,56,.72)' if d else 'rgba(255,255,255,.9)'}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div><div class="label" style="font-size:11px">WORKFLOW · CLINIC INTAKE</div><div class="display" style="font-size:22px;margin-top:6px">New patient → first visit</div></div><span class="pill" style="font-size:12px"><span class="dot"></span>Live</span></div>
        {wf_html}
        <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:16px;border-top:1px solid var(--line)"><div><div class="display" style="font-size:30px">6.5 h</div><div class="label" style="font-size:10px">SAVED THIS WEEK</div></div><div><div class="display" style="font-size:30px">42 s</div><div class="label" style="font-size:10px">AVG. RESPONSE</div></div><div><div class="display" style="font-size:30px">0</div><div class="label" style="font-size:10px">MISSED ENQUIRIES</div></div></div>
      </div>
    </div>
  </section>
  <section style="padding:40px 96px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between">
    <span class="label">Built for service businesses in Canada &amp; the US</span>
    <div style="display:flex;gap:40px;font-family:var(--bt-font-display);font-weight:600;font-size:18px;color:var(--muted)">{''.join(f'<span>{x}</span>' for x in ["Clinics", "Law firms", "Accounting", "Coaching", "Agencies", "Home services"])}</div>
  </section>
  <section data-shot="web-{theme}-features" style="padding:112px 96px;display:flex;flex-direction:column;gap:56px" class="{grid}">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:40px"><div style="display:flex;flex-direction:column;gap:16px;max-width:900px"><span class="label" style="color:var(--accentText)">Agents</span><h2 class="display" style="font-size:56px;line-height:1.06">Agents that take the repetitive work off your plate.</h2></div>
      <p style="font-size:18px;line-height:1.6;color:var(--muted);max-width:420px">Each agent owns one job, works with your existing tools and hands anything risky to you for approval.</p></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">{feats}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">{''.join(f'<div style="display:flex;gap:20px;padding:28px 0;border-top:1px solid var(--line)"><span class="mono grad-text" style="font-size:28px;font-weight:500">{n}</span><div><div class="display" style="font-size:24px">{t}</div><p style="margin-top:8px;font-size:16px;line-height:1.6;color:var(--muted)">{x}</p></div></div>' for n, t, x in steps)}</div>
  </section>
  <section data-shot="web-{theme}-pricing" style="padding:112px 96px;display:flex;flex-direction:column;gap:48px;background:{'#0C1534' if d else '#EEF1F6'}">
    <div style="text-align:center;display:flex;flex-direction:column;gap:16px;align-items:center"><span class="label" style="color:var(--accentText)">Pricing</span><h2 class="display" style="font-size:56px">Simple plans. Serious leverage.</h2><p style="font-size:18px;color:var(--muted)">Start free, then pay for the automation you actually use. Prices in USD; CAD billing available.</p></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">{plans}</div>
  </section>
  <section data-shot="web-{theme}-cta" style="padding:112px 96px;position:relative;overflow:hidden">
    <img src="out/patterns/orbits.svg" style="position:absolute;left:-260px;top:-240px;width:1000px;opacity:{'.5' if d else '.35'}">
    <div class="card" style="position:relative;display:grid;grid-template-columns:1fr 1fr;gap:56px;padding:56px;border-radius:28px;background:{'linear-gradient(135deg,rgba(43,92,255,.16),rgba(123,92,255,.10) 50%,rgba(20,224,192,.08))' if d else '#FFFFFF'}">
      <div style="display:flex;flex-direction:column;gap:22px"><span class="label" style="color:var(--accentText)">Contact</span><h2 class="display" style="font-size:52px;line-height:1.06">Tell us the workflow you hate most.</h2>
        <p style="font-size:18px;line-height:1.6;color:var(--muted)">We'll send a free automation plan within one business day, showing what to automate, how and how many hours it saves.</p>
        <div style="display:flex;flex-direction:column;gap:12px;font-size:16px;color:var(--fg);font-weight:600">{''.join(f'<span style="display:flex;gap:12px;align-items:center"><span style="color:var(--accentText)">{icon(i, 20, node=False)}</span>{t}</span>' for i, t in [("mail", "hello@boterra.io"), ("globe", "www.boterra.io"), ("users", "Serving Canada &amp; the US · remote-first")])}</div></div>
      <div style="display:flex;flex-direction:column;gap:16px">{inputs}
        <div style="display:flex;flex-direction:column;gap:8px"><span class="label" style="font-size:11px">The workflow to automate</span><div style="height:110px;border-radius:12px;border:1px solid var(--line);background:{'rgba(255,255,255,.03)' if d else '#fff'};padding:16px;color:{'#6F7A96' if d else '#8A94A8'};font-size:15px">New-patient intake: forms, insurance checks, booking and reminders…</div></div>
        <span class="btn btn-primary" style="justify-content:center;height:58px;font-size:17px">Get my free automation plan {icon("arrow", 20, node=False, sw=2)}</span></div>
    </div>
  </section>
  <footer style="padding:48px 96px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center">{logo(lv, 28)}<span style="font-size:14px;color:var(--muted)">© 2026 Boterra AI · Privacy · Terms · Security</span></footer>
</div>'''

# ======================= PRODUCT =======================
BADGE = '<span style="margin-left:auto;font-size:11px;background:#F5B53D;color:#0A1230;border-radius:999px;padding:2px 8px">3</span>'
def dashboard():
    nav = [("home", "Overview", True), ("users", "Agents", False), ("flow", "Workflows", False), ("check", "Approvals", False), ("chart", "Reports", False), ("settings", "Settings", False)]
    nav_html = "".join(f'<div style="display:flex;gap:12px;align-items:center;padding:11px 14px;border-radius:10px;font-size:14px;font-weight:600;{"background:rgba(43,92,255,.18);color:#fff" if a else "color:#9AA5BF"}">{icon(i, 18, node=False)}{t}{BADGE if t == "Approvals" else ""}</div>' for i, t, a in nav)
    kpis = [("Hours saved · this week", "31.5", "h", "+18% vs last week"), ("Tasks automated", "1,284", "", "+212 today"), ("Avg. response time", "42", "s", "−63% since launch"), ("Waiting for approval", "3", "", "Oldest: 12 min")]
    kpi_html = "".join(f'<div class="card" style="padding:22px;display:flex;flex-direction:column;gap:10px"><span class="label" style="font-size:10.5px">{l}</span><div><span class="display" style="font-size:40px">{v}</span><span style="font-size:20px;color:var(--muted);margin-left:4px">{u}</span></div><span style="font-size:13px;color:{"#F5B53D" if "Oldest" in s else "#14E0C0"};font-weight:600">{s}</span></div>' for l, v, u, s in kpis)
    vals = [3.2, 4.1, 3.8, 5.0, 5.6, 4.4, 5.4]; days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    W, H, P = 560, 200, 24; mx = 6
    pts = [(P + i * (W - 2 * P) / 6, H - P - v / mx * (H - 2 * P)) for i, v in enumerate(vals)]
    line = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    area = f"M{pts[0][0]:.1f},{H - P} L" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + f" L{pts[-1][0]:.1f},{H - P} Z"
    chart = (f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}"><defs><linearGradient id="ca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B5CFF" stop-opacity=".45"/><stop offset="1" stop-color="#2B5CFF" stop-opacity="0"/></linearGradient><linearGradient id="cl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2B5CFF"/><stop offset=".6" stop-color="#7B5CFF"/><stop offset="1" stop-color="#14E0C0"/></linearGradient></defs>'
             + "".join(f'<line x1="{P}" x2="{W - P}" y1="{H - P - g / mx * (H - 2 * P):.1f}" y2="{H - P - g / mx * (H - 2 * P):.1f}" stroke="rgba(185,193,211,.10)"/><text x="0" y="{H - P - g / mx * (H - 2 * P) + 4:.1f}" fill="#6F7A96" font-size="11" font-family="JetBrains Mono">{g}h</text>' for g in (0, 2, 4, 6))
             + f'<path d="{area}" fill="url(#ca)"/><polyline points="{line}" fill="none" stroke="url(#cl)" stroke-width="3" stroke-linejoin="round"/>'
             + f'<circle cx="{pts[-1][0]:.1f}" cy="{pts[-1][1]:.1f}" r="6" fill="#14E0C0"/><circle cx="{pts[-1][0]:.1f}" cy="{pts[-1][1]:.1f}" r="12" fill="#14E0C0" opacity=".2"/>'
             + "".join(f'<text x="{x:.1f}" y="{H - 4}" fill="#6F7A96" font-size="11" font-family="JetBrains Mono" text-anchor="middle">{dd}</text>' for (x, _), dd in zip(pts, days)) + '</svg>')
    agents = [("Intake Agent", "Running", "#14E0C0", "148 enquiries · 2 min ago"), ("Scheduling Agent", "Running", "#14E0C0", "96 bookings · just now"), ("Billing Agent", "Needs approval", "#F5B53D", "2 invoices > $2,000"), ("Follow-up Agent", "Running", "#14E0C0", "61 reminders · 5 min ago"), ("Reporting Agent", "Scheduled", "#9AA5BF", "Mon 08:00 briefing")]
    ag_html = "".join(f'<div style="display:flex;align-items:center;gap:14px;padding:13px 0;border-top:1px solid var(--line)"><img src="out/logos/svg/boterra-agent-avatar.svg" style="width:34px;height:34px"><div style="flex:1"><div style="font-weight:700;font-size:14.5px;color:var(--fg)">{n}</div><div style="font-size:12.5px;color:var(--muted)">{m}</div></div><span style="font-size:12px;font-weight:700;color:{c}">● {s}</span></div>' for n, s, c, m in agents)
    log = [("09:41:07", "Intake Agent", "Qualified enquiry from J. Alvarez → booked Tue 10:30"), ("09:38:52", "Billing Agent", "Drafted invoice #1042 ($2,450) — waiting for approval"), ("09:36:10", "Follow-up Agent", "Sent 12 appointment reminders (SMS + email)"), ("09:31:44", "Document Agent", "Generated engagement letter for Patel &amp; Co."), ("09:25:03", "Scheduling Agent", "Rescheduled 3 visits after provider sick day")]
    log_html = "".join(f'<div style="display:grid;grid-template-columns:86px 150px 1fr;gap:12px;padding:11px 0;border-top:1px solid var(--line);font-size:13.5px"><span class="mono" style="color:#6F7A96">{t}</span><span style="font-weight:700;color:#C9D5FF">{a}</span><span style="color:var(--fg)">{m}</span></div>' for t, a, m in log)
    return f'''<div data-shot="product-dashboard" class="dark" style="width:1440px;height:900px;display:grid;grid-template-columns:240px 1fr;background:#0A1230">
  <aside style="border-right:1px solid var(--line);padding:24px 16px;display:flex;flex-direction:column;gap:6px;background:#08102A">{logo("gradient", 26)}<div style="height:22px"></div>{nav_html}
    <div style="margin-top:auto" class="card"><div style="padding:16px;display:flex;flex-direction:column;gap:8px"><span class="label" style="font-size:10px">Plan · Growth</span><div style="height:6px;border-radius:9px;background:rgba(255,255,255,.08)"><div style="width:62%;height:100%;border-radius:9px;background:var(--bt-grad-aurora)"></div></div><span style="font-size:12px;color:var(--muted)">1,240 / 2,000 credits</span></div></div></aside>
  <main style="padding:24px 32px;display:flex;flex-direction:column;gap:20px;overflow:hidden">
    <div style="display:flex;justify-content:space-between;align-items:center"><div><div class="label" style="font-size:11px">Northshore Clinic · Overview</div><div class="display" style="font-size:30px;margin-top:4px">Good morning, Maya</div></div>
      <div style="display:flex;gap:12px;align-items:center"><div style="width:320px;height:44px;border-radius:12px;border:1px solid var(--line);display:flex;align-items:center;gap:10px;padding:0 14px;color:#6F7A96;font-size:14px">{icon("search", 18, node=False)} Search agents, workflows, clients…<span class="mono" style="margin-left:auto;font-size:11px;border:1px solid var(--line);border-radius:6px;padding:2px 6px">⌘K</span></div>
      <span style="color:var(--muted)">{icon("bell", 22)}</span><span class="btn btn-primary" style="height:44px;font-size:14px">{icon("plus", 18, node=False, sw=2)} New workflow</span></div></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">{kpi_html}</div>
    <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:16px">
      <div class="card" style="padding:22px"><div style="display:flex;justify-content:space-between"><div><div class="display" style="font-size:18px">Hours saved</div><div style="font-size:13px;color:var(--muted)">Last 7 days · all agents</div></div><span class="pill" style="font-size:12px">This week ▾</span></div><div style="margin-top:10px">{chart}</div></div>
      <div class="card" style="padding:22px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="display" style="font-size:18px">Agents</div><span style="font-size:13px;color:#C9D5FF;font-weight:600">View all</span></div>{ag_html}</div>
    </div>
    <div class="card" style="padding:20px 22px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><div class="display" style="font-size:18px">Live activity &amp; audit trail</div><span class="pill" style="font-size:12px"><span class="dot"></span>Streaming</span></div>{log_html}</div>
  </main></div>'''

def builder():
    nodes = [  # x, y, kind, title, sub, icon, accent — two-column flow that fits the canvas
        (50, 60, "TRIGGER", "New intake form", "Website · Jotform", "intake", "#3BD8FF"),
        (50, 250, "AGENT", "Qualify &amp; check insurance", "Intake Agent", "users", "#7B5CFF"),
        (380, 150, "AGENT", "Book first appointment", "Scheduling Agent", "calendar", "#7B5CFF"),
        (380, 330, "AGENT", "Reminder 24h before", "Follow-up Agent", "bell", "#7B5CFF"),
        (380, 560, "HUMAN", "Review complex case", "Approval · Dr. Chen", "shield", "#F5B53D"),
    ]
    def node(x, y, k, t, s, ic, ac, sel=False):
        return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:260px;border-radius:16px;background:#111B40;border:{"2px solid #2B5CFF" if sel else "1px solid rgba(185,193,211,.16)"};box-shadow:{"0 0 0 6px rgba(43,92,255,.18)," if sel else ""}0 20px 40px -20px rgba(0,0,0,.6);padding:16px">'
                f'<div style="display:flex;justify-content:space-between;align-items:center"><span class="mono" style="font-size:10.5px;letter-spacing:.14em;color:{ac}">{k}</span><span style="width:8px;height:8px;border-radius:50%;background:#19C37D"></span></div>'
                f'<div style="display:flex;gap:12px;align-items:center;margin-top:12px"><span style="width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:rgba(123,92,255,.16);color:#DCD3FF">{icon(ic, 20, node=False)}</span><div><div style="font-weight:700;font-size:14.5px;color:#F2F5FB">{t}</div><div style="font-size:12.5px;color:#9AA5BF">{s}</div></div></div></div>')
    edges = [((180, 164), (180, 250), "v"), ((310, 300), (380, 202), "h"), ((310, 300), (380, 612), "h"), ((510, 254), (510, 330), "v")]
    paths = "".join((f'<path d="M{a[0]} {a[1]} C{a[0] + 50} {a[1]} {b[0] - 50} {b[1]} {b[0]} {b[1]}"' if o == "h" else f'<path d="M{a[0]} {a[1]} L{b[0]} {b[1]}"') + f' fill="none" stroke="url(#eg)" stroke-width="2.5"/><circle cx="{b[0]}" cy="{b[1]}" r="5" fill="#14E0C0"/>' for a, b, o in edges)
    cond = ''.join(f'<div style="position:absolute;left:{x}px;top:{y}px;padding:5px 10px;border-radius:8px;background:#0A1230;border:1px solid rgba(185,193,211,.2);font-size:11.5px;color:#9AA5BF" class="mono">{t}</div>' for x, y, t in [(250, 210, "if insurance ✓"), (250, 450, "if urgent")])
    canvas = (f'<div class="grid-bg-dark" style="position:relative;flex:1;overflow:hidden;background-color:#0A1230">'
              f'<svg width="1400" height="800" style="position:absolute;inset:0"><defs><linearGradient id="eg" x1="0" x2="1"><stop offset="0" stop-color="#2B5CFF"/><stop offset="1" stop-color="#7B5CFF"/></linearGradient></defs>{paths}</svg>'
              + "".join(node(*n, sel=(i == 1)) for i, n in enumerate(nodes)) + cond +
              '<div style="position:absolute;left:24px;bottom:24px;display:flex;gap:8px">' + "".join(f'<span style="width:38px;height:38px;border-radius:10px;border:1px solid rgba(185,193,211,.16);background:#0F1838;display:grid;place-items:center;color:#C9D5FF;font-weight:700">{c}</span>' for c in ["+", "−", "⤢"]) + '</div>'
              '<div style="position:absolute;right:24px;bottom:24px;width:200px;height:120px;border-radius:12px;border:1px solid rgba(185,193,211,.16);background:rgba(15,24,56,.8)"><div style="position:absolute;left:20px;top:50px;width:30px;height:12px;background:#3BD8FF;border-radius:3px;opacity:.7"></div><div style="position:absolute;left:70px;top:50px;width:30px;height:12px;background:#7B5CFF;border-radius:3px"></div><div style="position:absolute;left:120px;top:25px;width:30px;height:12px;background:#7B5CFF;border-radius:3px;opacity:.7"></div><div style="position:absolute;left:120px;top:75px;width:30px;height:12px;background:#F5B53D;border-radius:3px;opacity:.7"></div><div style="position:absolute;left:160px;top:25px;width:30px;height:12px;background:#7B5CFF;border-radius:3px;opacity:.7"></div></div></div>')
    field = lambda l, v: f'<div style="display:flex;flex-direction:column;gap:7px"><span class="label" style="font-size:10.5px">{l}</span><div style="min-height:42px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.03);padding:11px 13px;font-size:13.5px;color:#E9EDF6;line-height:1.45">{v}</div></div>'
    inspector = (f'<aside style="width:360px;border-left:1px solid var(--line);background:#08102A;padding:22px;display:flex;flex-direction:column;gap:16px">'
                 f'<div><span class="label" style="font-size:10.5px;color:#7B5CFF">Agent step</span><div class="display" style="font-size:20px;margin-top:6px">Qualify &amp; check insurance</div></div>'
                 + field("Agent", "Intake Agent · AGT-01") + field("Instructions", "Read the intake form. Confirm the reason for visit, verify insurance eligibility, and flag anything urgent.")
                 + field("Tools", '<span class="pill" style="font-size:11.5px;margin:2px">Jotform</span><span class="pill" style="font-size:11.5px;margin:2px">Insurance API</span><span class="pill" style="font-size:11.5px;margin:2px">Jane App</span>')
                 + field("Approval rule", "Ask a human when the case is marked urgent or insurance can't be verified")
                 + '<div style="margin-top:auto;display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:12px;background:rgba(20,224,192,.08);border:1px solid rgba(20,224,192,.25)"><span class="label" style="font-size:10.5px;color:#14E0C0">Last test run</span><span style="font-size:13.5px;color:#E9EDF6">✓ 12 sample forms · 11 auto-qualified · 1 sent for review · 3.1 s avg</span></div></aside>')
    return f'''<div data-shot="product-builder" class="dark" style="width:1440px;height:900px;display:flex;flex-direction:column;background:#0A1230">
  <header style="height:68px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:18px;padding:0 22px;background:#08102A">{logo("gradient", 24, "symbol")}<span style="color:#6F7A96">/</span><span style="font-weight:700;font-size:15px">Workflows</span><span style="color:#6F7A96">/</span><span class="display" style="font-size:16px">Clinic intake → first visit</span><span class="pill" style="font-size:11.5px;color:#14E0C0;border-color:rgba(20,224,192,.3)">● Live · v3</span>
    <div style="margin-left:auto;display:flex;gap:10px"><span class="btn btn-ghost" style="height:40px;font-size:14px">{icon("play", 16, node=False)} Test run</span><span class="btn btn-primary" style="height:40px;font-size:14px">Publish changes</span></div></header>
  <div style="flex:1;display:flex;min-height:0">
    <aside style="width:230px;border-right:1px solid var(--line);background:#08102A;padding:18px;display:flex;flex-direction:column;gap:10px"><span class="label" style="font-size:10.5px">Add a step</span>
      {''.join(f'<div style="display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:10px;border:1px solid var(--line);font-size:13.5px;font-weight:600;color:#E9EDF6"><span style="color:{c}">{icon(i, 18, node=False)}</span>{t}</div>' for i, t, c in [("bolt", "Trigger", "#3BD8FF"), ("users", "Agent", "#7B5CFF"), ("shield", "Human approval", "#F5B53D"), ("flow", "Condition", "#9AA5BF"), ("mail", "Send message", "#14E0C0"), ("clock", "Wait / delay", "#9AA5BF")])}</aside>
    {canvas}{inspector}</div></div>'''

def mobile():
    def phone(content, title):
        return (f'<div style="width:390px;height:844px;border-radius:56px;background:#05091A;padding:12px;box-shadow:0 40px 80px -30px rgba(0,0,0,.8),0 0 0 2px #2A3352 inset">'
                f'<div class="dark" style="width:100%;height:100%;border-radius:46px;overflow:hidden;background:#0A1230;position:relative;display:flex;flex-direction:column">'
                f'<div style="height:50px;display:flex;justify-content:space-between;align-items:center;padding:0 28px;font-size:14px;font-weight:700;color:#fff"><span>9:41</span><span style="width:110px;height:30px;border-radius:20px;background:#000"></span><span>●●●</span></div>'
                f'<div style="padding:8px 22px 0;display:flex;justify-content:space-between;align-items:center">{logo("gradient", 22, "symbol")}<span class="display" style="font-size:16px">{title}</span><span style="color:#9AA5BF">{icon("bell", 20)}</span></div>{content}'
                f'<div style="position:absolute;left:0;right:0;bottom:0;height:78px;border-top:1px solid var(--line);background:#08102A;display:flex;justify-content:space-around;align-items:center;color:#6F7A96">{"".join(icon(i, 22, node=False) for i in ["home", "users", "check", "chart"])}</div></div></div>')
    home = ('<div style="padding:18px 22px;display:flex;flex-direction:column;gap:14px">'
            '<div class="card" style="padding:18px;background:linear-gradient(135deg,rgba(43,92,255,.3),rgba(123,92,255,.18))"><span class="label" style="font-size:10px;color:#C9D5FF">This week</span><div class="display" style="font-size:40px;margin-top:4px">31.5 h</div><div style="font-size:13px;color:#C9D5FF">saved by 5 agents</div></div>'
            '<span class="label" style="font-size:10.5px">Needs you · 3</span>'
            + "".join(f'<div class="card" style="padding:14px;display:flex;gap:12px;align-items:center"><span style="width:36px;height:36px;border-radius:10px;background:rgba(245,181,61,.15);color:#F5B53D;display:grid;place-items:center">{icon(i, 18, node=False)}</span><div style="flex:1"><div style="font-weight:700;font-size:13.5px;color:#fff">{t}</div><div style="font-size:12px;color:#9AA5BF">{s}</div></div></div>' for i, t, s in [("invoice", "Invoice #1042 · $2,450", "Billing Agent"), ("shield", "Urgent intake: knee injury", "Intake Agent"), ("document", "Engagement letter draft", "Document Agent")])
            + '</div>')
    agent = ('<div style="padding:18px 22px;display:flex;flex-direction:column;gap:14px;align-items:center">'
             f'<img src="out/logos/svg/boterra-agent-avatar.svg" style="width:96px;height:96px;margin-top:10px"><div class="display" style="font-size:24px">Intake Agent</div><span class="pill" style="font-size:12px;color:#14E0C0"><span class="dot"></span>Running · AGT-01</span>'
             '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%">' + "".join(f'<div class="card" style="padding:14px"><div class="display" style="font-size:24px">{v}</div><div class="label" style="font-size:9.5px">{l}</div></div>' for v, l in [("148", "Enquiries"), ("42 s", "Avg. reply"), ("96%", "Auto-handled"), ("4", "Escalated")]) + '</div>'
             '<div class="card" style="padding:14px;width:100%;font-size:13px;line-height:1.5;color:#E9EDF6"><span class="label" style="font-size:9.5px;color:#7B5CFF">Latest</span><br>Qualified J. Alvarez and booked Tue 10:30 with Dr. Chen.</div></div>')
    approve = ('<div style="padding:18px 22px;display:flex;flex-direction:column;gap:14px">'
               '<div class="card" style="padding:20px;display:flex;flex-direction:column;gap:12px"><span class="label" style="font-size:10px;color:#F5B53D">Approval needed · High value</span><div class="display" style="font-size:22px">Send invoice #1042</div>'
               '<div style="font-size:13.5px;color:#C9D5FF;line-height:1.5">Patel &amp; Co. · Q3 bookkeeping<br>Amount: <b style="color:#fff">$2,450.00</b> · Due in 14 days</div>'
               '<div style="border-radius:12px;background:rgba(255,255,255,.04);padding:12px;font-size:12.5px;color:#9AA5BF;line-height:1.5">Billing Agent: "Matches the signed engagement letter and 18.5 logged hours."</div></div>'
               '<div style="display:flex;gap:12px"><span class="btn btn-ghost" style="flex:1;justify-content:center">Edit</span><span class="btn btn-primary" style="flex:1;justify-content:center">Approve &amp; send</span></div>'
               '<span class="label" style="font-size:10px;text-align:center">Logged to audit trail</span></div>')
    return (f'<div data-shot="product-mobile" class="dark" style="width:1440px;height:1000px;position:relative;overflow:hidden;background:radial-gradient(800px 500px at 50% 0%, rgba(43,92,255,.35), transparent 70%),#0A1230;display:flex;gap:56px;justify-content:center;align-items:center">'
            f'<img src="out/patterns/orbits.svg" style="position:absolute;width:1300px;left:70px;top:-150px;opacity:.35">'
            f'<div style="position:relative;transform:translateY(40px)">{phone(home, "Home")}</div><div style="position:relative;transform:translateY(-20px)">{phone(agent, "Agent")}</div><div style="position:relative;transform:translateY(40px)">{phone(approve, "Approve")}</div></div>')

# ======================= PITCH DECK =======================
def slide(i, inner, bg="#0A1230", theme="dark"):
    return (f'<div data-shot="deck-{i:02d}" class="{theme}" style="width:1920px;height:1080px;position:relative;overflow:hidden;background:{bg};padding:96px 120px;display:flex;flex-direction:column">'
            f'{inner}<div style="position:absolute;left:120px;right:120px;bottom:48px;display:flex;justify-content:space-between;align-items:center">{logo("gradient" if theme == "dark" else "color-light", 26)}<span class="mono" style="font-size:16px;color:var(--muted)">{i:02d} / 07</span></div></div>')
def plan_feats(fs):
    return "".join(f'<div style="font-size:26px;color:var(--fg)">✓ {f}</div>' for f in fs[:4])
def deck():
    s = []
    s.append(slide(1, f'''<img src="out/patterns/mesh-dark.svg" style="position:absolute;right:-200px;top:-80px;width:1500px;opacity:.6"><img src="out/patterns/orbits.svg" style="position:absolute;right:-260px;bottom:-420px;width:1200px;opacity:.5">
      <div style="position:relative;margin-top:auto;margin-bottom:auto;display:flex;flex-direction:column;gap:32px">{logo("gradient", 64, "symbol")}<span class="label" style="font-size:18px;color:var(--bt-teal)">Seed round · 2026</span>
      <h1 class="display" style="font-size:132px;line-height:.98;letter-spacing:-0.045em">Workflows that<br><span class="grad-text">run themselves.</span></h1>
      <p style="font-size:30px;color:var(--muted);max-width:1100px;line-height:1.45">AI agents that take over the most painful repetitive workflow in a service business, and run it 24/7.</p></div>''',
      bg="radial-gradient(1200px 800px at 85% 10%, rgba(123,92,255,.35), transparent 60%), radial-gradient(1000px 700px at 0% 100%, rgba(43,92,255,.30), transparent 60%), #0A1230"))
    pains = [("clock", "Hours lost", "Owners and staff of service businesses spend their week on intake, scheduling, billing and follow-up."), ("followup", "Leads go cold", "Slow replies and missed calls quietly send new clients to competitors."), ("users", "Hiring won't fix it", "Admin staff are expensive, hard to keep, and can't work nights or weekends.")]
    s.append(slide(2, f'''<span class="label" style="font-size:18px;color:var(--bt-teal)">The problem</span><h2 class="display" style="font-size:84px;line-height:1.04;margin-top:20px;max-width:1500px">Service businesses are drowning in repetitive work.</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:72px">{''.join(f'<div class="card" style="padding:56px;display:flex;flex-direction:column;gap:28px;min-height:440px"><span style="color:#C9D5FF">{icon(i, 72)}</span><div class="display" style="font-size:48px">{t}</div><p style="font-size:30px;line-height:1.5;color:var(--muted)">{x}</p></div>' for i, t, x in pains)}</div>'''))
    s.append(slide(3, f'''<span class="label" style="font-size:18px;color:var(--bt-tealInk)">The solution</span><h2 class="display" style="font-size:84px;line-height:1.04;margin-top:20px">One painful workflow in.<br><span class="grad-text">An AI system out.</span></h2>
      <div style="display:flex;align-items:center;gap:28px;margin-top:80px">{''.join(f'<div class="card" style="flex:1;padding:56px;display:flex;flex-direction:column;gap:24px;min-height:440px"><span class="mono grad-text" style="font-size:56px;font-weight:500">{n}</span><div class="display" style="font-size:52px">{t}</div><p style="font-size:30px;line-height:1.5;color:var(--muted)">{x}</p></div>' + ('<span style="color:#7B5CFF">' + icon("arrow", 56, node=False, sw=1.5) + '</span>' if n != "03" else '') for n, t, x in [("01", "Map", "A 30-minute call maps the workflow that hurts most."), ("02", "Automate", "Agents run it end to end, asking for approval on critical steps."), ("03", "Monitor", "Live dashboard, audit trail and a weekly hours-saved report.")])}</div>''',
      bg="radial-gradient(1000px 700px at 100% 0%, rgba(123,92,255,.12), transparent 60%), #F7F9FC", theme="light"))
    s.append(slide(4, f'''<div style="display:grid;grid-template-columns:600px 1fr;gap:64px;align-items:center;height:100%">
      <div style="display:flex;flex-direction:column;gap:28px"><span class="label" style="font-size:18px;color:var(--bt-teal)">The product</span><h2 class="display" style="font-size:72px;line-height:1.05">A command centre for your AI workforce.</h2>
      {''.join(f'<div style="display:flex;gap:16px;align-items:center;font-size:26px;color:var(--fg)"><span style="color:var(--bt-teal)">{icon("check", 30, node=False, sw=2.2)}</span>{t}</div>' for t in ["Agents for intake, scheduling, billing, documents", "Visual workflow builder", "Approval inbox and full audit trail", "Hours-saved reporting"])}</div>
      <img src="out/mockups/product-dashboard.png" style="width:1100px;border-radius:24px;box-shadow:0 40px 100px -30px rgba(0,0,0,.8),0 0 0 1px rgba(185,193,211,.15)"></div>''',
      bg="radial-gradient(1000px 700px at 90% 50%, rgba(43,92,255,.30), transparent 60%), #0A1230"))
    s.append(slide(5, f'''<span class="label" style="font-size:18px;color:var(--bt-teal)">The market</span><h2 class="display" style="font-size:84px;line-height:1.04;margin-top:20px">A huge market, barely automated.</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:72px">{''.join(f'<div class="card" style="padding:56px;display:flex;flex-direction:column;gap:24px;min-height:420px;justify-content:space-between"><span class="display {g}" style="font-size:132px;line-height:1">{v}</span><p style="font-size:32px;line-height:1.45;color:var(--muted)">{t}</p></div>' for v, t, g in [("36.2M", "small businesses in the United States (SBA, 2025)", "grad-text"), ("$10.9B", "global AI agents market in 2026, up from $7.6B in 2025", ""), ("17.7%", "of US small businesses have paid for an AI tool, so most of the market is still open", "")])}</div>
      <p class="mono" style="margin-top:28px;font-size:16px;color:var(--muted)">Sources: SBA Office of Advocacy 2025; AI agents market reports 2026; US small-business AI adoption data 2026. Canada sizing to be added.</p>'''))
    s.append(slide(6, f'''<span class="label" style="font-size:18px;color:var(--bt-tealInk)">Pricing</span><h2 class="display" style="font-size:84px;line-height:1.04;margin-top:20px">Start free. Scale with usage.</h2>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:64px">{''.join(f'<div class="card" style="padding:48px;display:flex;flex-direction:column;gap:22px;min-height:520px;{"border:3px solid #2B5CFF;" if hl else ""}"><div class="display" style="font-size:36px">{n}</div><div><span class="display" style="font-size:96px">{p}</span></div><span style="font-size:24px;color:var(--muted)">{per}</span>{plan_feats(fs)}</div>' for n, p, per, fs, hl in PLANS)}</div>''',
      bg="#F7F9FC", theme="light"))
    s.append(slide(7, f'''<img src="out/patterns/orbits.svg" style="position:absolute;right:-200px;top:-200px;width:1400px;opacity:.55">
      <div style="position:relative;margin:auto 0;display:flex;flex-direction:column;gap:36px"><h2 class="display" style="font-size:120px;line-height:1">Let's automate<br><span class="grad-text">what slows you down.</span></h2>
      <div style="display:flex;gap:56px;font-size:30px;font-weight:600;color:var(--fg)">{''.join(f'<span style="display:flex;gap:14px;align-items:center"><span style="color:var(--bt-teal)">{icon(i, 34, node=False)}</span>{t}</span>' for i, t in [("globe", "www.boterra.io"), ("mail", "hello@boterra.io"), ("users", "[Founder name]")])}</div></div>''',
      bg="radial-gradient(1200px 800px at 85% 0%, rgba(123,92,255,.35), transparent 60%), #0A1230"))
    return "".join(s)

# ======================= SOCIAL =======================
def social():
    out = []
    out.append(f'''<div data-shot="social-ig-stat" class="dark" style="width:1080px;height:1080px;position:relative;overflow:hidden;background:radial-gradient(800px 600px at 80% 10%, rgba(123,92,255,.4), transparent 60%),#0A1230;padding:88px;display:flex;flex-direction:column">
      <img src="out/patterns/mesh-dark.svg" style="position:absolute;right:-300px;top:-100px;width:1300px;opacity:.5">{logo("gradient", 40)}
      <div style="position:relative;margin:auto 0"><span class="label" style="font-size:20px;color:var(--bt-teal)">Automation math</span><div class="display grad-text" style="font-size:280px;line-height:.95;margin-top:20px">6.5h</div><p class="display" style="font-size:58px;line-height:1.1;margin-top:20px">saved every week by automating just patient intake.</p></div>
      <span class="mono" style="position:relative;font-size:18px;color:var(--muted)">Illustrative example · www.boterra.io</span></div>''')
    out.append(f'''<div data-shot="social-ig-tip" class="light" style="width:1080px;height:1080px;position:relative;overflow:hidden;background:#F7F9FC;padding:88px;display:flex;flex-direction:column;gap:40px" >
      <div style="display:flex;justify-content:space-between;align-items:center">{logo("color-light", 40)}<span class="pill" style="font-size:18px;padding:10px 20px">Workflow tip #04</span></div>
      <h2 class="display" style="font-size:84px;line-height:1.04">The 3 workflows every law firm should automate first</h2>
      <div style="display:flex;flex-direction:column;gap:20px">{''.join(f'<div class="card" style="padding:40px 40px;display:flex;gap:30px;align-items:center"><span class="mono grad-text" style="font-size:48px;font-weight:500">{n}</span><span class="display" style="font-size:42px;letter-spacing:-0.02em">{t}</span></div>' for n, t in [("01", "Client intake &amp; conflict checks"), ("02", "Engagement letters"), ("03", "Billing follow-ups")])}</div>
      <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;font-size:24px;color:var(--muted);font-weight:600"><span>Save this for later ↗</span><span class="mono">www.boterra.io</span></div></div>''')
    out.append(f'''<div data-shot="social-ig-launch" class="dark" style="width:1080px;height:1080px;position:relative;overflow:hidden;background:#0A1230;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;text-align:center">
      <img src="out/patterns/orbits.svg" style="position:absolute;width:1500px;left:-210px;top:-210px;opacity:.7"><img src="out/logos/svg/boterra-app-icon.svg" style="position:relative;width:240px;filter:drop-shadow(0 30px 60px rgba(43,92,255,.5))">
      <h2 class="display" style="position:relative;font-size:96px;line-height:1.02">Now live in<br><span class="grad-text">Canada &amp; the US.</span></h2><span class="btn btn-primary" style="position:relative;height:76px;font-size:28px;padding:0 40px;border-radius:20px">Book a free automation plan</span></div>''')
    car = [("1 / 4", "Swipe →", "Your admin team doesn't need to be bigger.", "It needs to be automated."),
           ("2 / 4", "", "Step 1 · Map", "Pick the workflow you hate most. We map every step in 30 minutes."),
           ("3 / 4", "", "Step 2 · Automate", "Agents take over the repetitive work and ask you before anything critical."),
           ("4 / 4", "", "Get your free plan", "www.boterra.io")]
    for i, (n, sw, t, x) in enumerate(car):
        dark = i in (0, 3)
        out.append(f'''<div data-shot="social-carousel-{i + 1}" class="{'dark' if dark else 'light'}" style="width:1080px;height:1350px;position:relative;overflow:hidden;background:{'radial-gradient(900px 700px at 90% 0%, rgba(123,92,255,.35), transparent 60%),#0A1230' if dark else '#F7F9FC'};padding:96px;display:flex;flex-direction:column">
          {'<img src="out/patterns/mesh-dark.svg" style="position:absolute;left:-200px;bottom:-100px;width:1400px;opacity:.45">' if dark else '<div class="grid-bg-light" style="position:absolute;inset:0"></div>'}
          <div style="position:relative;display:flex;justify-content:space-between;align-items:center">{logo("gradient" if dark else "color-light", 40)}<span class="mono" style="font-size:22px;color:var(--muted)">{n}</span></div>
          <div style="position:relative;margin:auto 0;display:flex;flex-direction:column;gap:32px">{'' if dark or True else ''}
            {f'<span style="width:120px;height:120px;border-radius:32px;display:grid;place-items:center;background:linear-gradient(135deg,#2B5CFF,#7B5CFF);color:#fff">{icon(["flow", "bolt"][i - 1], 64)}</span>' if i in (1, 2) else ''}
            <h2 class="display" style="font-size:{'104' if i == 0 else '96'}px;line-height:1.02">{t}</h2><p class="display {'grad-text' if i in (0, 3) else ''}" style="font-size:{'104' if i == 0 else ('72' if i == 3 else '46')}px;line-height:{'1.02' if i in (0, 3) else '1.3'};{'' if i in (0, 3) else 'font-weight:500;color:var(--muted);letter-spacing:-0.01em'}">{x}</p></div>
          {'<span class="btn btn-primary" style="position:relative;align-self:flex-start;height:84px;font-size:30px;padding:0 44px;border-radius:22px;margin-bottom:48px">Book a free automation plan</span>' if i == 3 else ''}<span class="mono" style="position:relative;font-size:22px;color:var(--muted)">{sw or ('@boterraai' if i < 3 else 'Link in bio')}</span></div>''')
    out.append(f'''<div data-shot="social-linkedin-banner" class="dark" style="width:1584px;height:396px;position:relative;overflow:hidden;background:radial-gradient(700px 400px at 85% 0%, rgba(123,92,255,.4), transparent 60%),#0A1230;display:flex;align-items:center;justify-content:flex-end;padding:0 96px">
      <img src="out/patterns/mesh-dark.svg" style="position:absolute;left:0;top:-200px;width:1000px;opacity:.4">
      <div style="position:relative;text-align:right;display:flex;flex-direction:column;gap:18px;align-items:flex-end"><h2 class="display" style="font-size:60px;line-height:1.05">Workflows that <span class="grad-text">run themselves.</span></h2><span class="mono" style="font-size:20px;color:var(--muted)">AI agents for clinics, law firms, accountants &amp; agencies · www.boterra.io</span></div></div>''')
    out.append(f'''<div data-shot="social-x-header" class="dark" style="width:1500px;height:500px;position:relative;overflow:hidden;background:radial-gradient(700px 500px at 20% 100%, rgba(43,92,255,.45), transparent 60%),#0A1230;display:flex;align-items:center;justify-content:space-between;padding:0 110px">
      <img src="out/patterns/orbits.svg" style="position:absolute;right:-180px;top:-350px;width:1100px;opacity:.6"><div style="position:relative;display:flex;flex-direction:column;gap:20px">{logo("gradient", 56)}<h2 class="display" style="font-size:54px;line-height:1.08">Your busiest workflow,<br>now on <span class="grad-text">autopilot.</span></h2></div>
      <img src="out/logos/svg/boterra-agent-avatar.svg" style="position:relative;width:220px"></div>''')
    return "".join(out)

# ======================= COLLATERAL =======================
def collateral():
    out = []
    out.append(f'''<div data-shot="collateral-card-front" class="dark" style="width:1050px;height:600px;border-radius:24px;position:relative;overflow:hidden;background:radial-gradient(600px 400px at 100% 0%, rgba(123,92,255,.45), transparent 60%),#0A1230;display:flex;align-items:center;justify-content:center">
      <img src="out/patterns/orbits.svg" style="position:absolute;width:900px;right:-300px;top:-250px;opacity:.6"><div style="position:relative">{logo("gradient", 96)}</div></div>''')
    out.append(f'''<div data-shot="collateral-card-back" class="light" style="width:1050px;height:600px;border-radius:24px;position:relative;overflow:hidden;background:#F7F9FC;padding:72px;display:flex;flex-direction:column;justify-content:space-between">
      <div class="grid-bg-light" style="position:absolute;inset:0"></div><div style="position:absolute;left:0;top:0;bottom:0;width:14px;background:var(--bt-grad-aurora)"></div>
      <div style="position:relative;display:flex;justify-content:space-between;align-items:flex-start"><div><div class="display" style="font-size:46px">Maya Chen</div><div style="font-size:24px;color:var(--muted);margin-top:6px;font-weight:600">Head of Automation</div></div>{logo("color-light", 52, "symbol")}</div>
      <div style="position:relative;display:flex;flex-direction:column;gap:12px;font-size:24px;font-weight:600;color:#0A1230">{''.join(f'<span style="display:flex;gap:16px;align-items:center"><span style="color:var(--bt-tealInk)">{icon(i, 26, node=False)}</span>{t}</span>' for i, t in [("mail", "maya@boterra.io"), ("phone", "+1 (555) 014-2026"), ("globe", "www.boterra.io")])}</div></div>''')
    out.append(f'''<div data-shot="collateral-letterhead" class="light" style="width:1275px;height:1650px;position:relative;overflow:hidden;background:#FFFFFF;padding:110px 120px;display:flex;flex-direction:column">
      <div style="position:absolute;left:0;top:0;right:0;height:10px;background:var(--bt-grad-aurora)"></div>
      <div style="display:flex;justify-content:space-between;align-items:center">{logo("color-light", 46)}<div style="text-align:right;font-size:17px;line-height:1.6;color:var(--muted)">hello@boterra.io<br>www.boterra.io</div></div>
      <div style="margin-top:110px;font-size:20px;line-height:1.75;color:#1B2340;display:flex;flex-direction:column;gap:26px"><span class="mono" style="font-size:15px;color:var(--muted)">October 6, 2026</span>
        <span>Dr. Maya Chen<br>Northshore Clinic<br>Vancouver, BC</span><span>Dear Dr. Chen,</span>
        <span>Thank you for walking us through your new-patient intake process. As discussed, the attached automation plan shows how our Intake and Scheduling agents can take over the forms, insurance checks, booking and reminders, while your team keeps approval over every urgent case.</span>
        <span>Based on your current volume, we estimate the workflow will free up 6 to 8 hours a week for your front desk. We'd be glad to start with a two-week pilot.</span>
        <span>Warm regards,<br><b>Jordan Ellis</b><br>Automation Lead, Boterra AI</span></div>
      <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:28px;border-top:1px solid #E7EBF3;font-size:15px;color:var(--muted)"><span>Boterra AI · Workflows that run themselves</span>{logo("color-light", 28, "symbol")}</div></div>''')
    out.append(f'''<div data-shot="collateral-email-signature" class="light" style="width:640px;height:200px;background:#FFFFFF;padding:28px;display:flex;gap:24px;align-items:center;border-radius:12px">
      <img src="out/logos/svg/boterra-app-icon.svg" style="width:84px;border-radius:20px"><div style="width:1px;align-self:stretch;background:#E7EBF3"></div>
      <div style="display:flex;flex-direction:column;gap:4px"><div class="display" style="font-size:22px">Jordan Ellis</div><div style="font-size:14px;color:var(--muted);font-weight:600">Automation Lead · Boterra AI</div>
      <div style="font-size:14px;color:#1B2340;margin-top:6px">jordan@boterra.io · <span style="color:var(--bt-violetInk);font-weight:700">www.boterra.io</span></div><div class="mono" style="font-size:11.5px;color:var(--bt-tealInk);margin-top:4px">Workflows that run themselves.</div></div></div>''')
    out.append(f'''<div data-shot="collateral-brochure-cover" class="dark" style="width:1275px;height:1650px;position:relative;overflow:hidden;background:radial-gradient(1000px 800px at 90% 0%, rgba(123,92,255,.45), transparent 60%), radial-gradient(800px 700px at 0% 100%, rgba(43,92,255,.35), transparent 60%),#0A1230;padding:120px;display:flex;flex-direction:column">
      <img src="out/patterns/mesh-dark.svg" style="position:absolute;right:-400px;top:200px;width:1700px;opacity:.55">{logo("gradient", 56)}
      <div style="position:relative;margin-top:auto;display:flex;flex-direction:column;gap:36px"><span class="label" style="font-size:22px;color:var(--bt-teal)">Automation guide · Clinics edition</span><h1 class="display" style="font-size:124px;line-height:.98;letter-spacing:-0.045em">Give your front desk its <span class="grad-text">time back.</span></h1>
      <p style="font-size:34px;line-height:1.45;color:var(--muted)">How AI agents handle intake, scheduling and reminders, 24/7.</p></div></div>''')
    out.append(f'''<div data-shot="collateral-poster" class="dark" style="width:1200px;height:1800px;position:relative;overflow:hidden;background:#0A1230;padding:110px;display:flex;flex-direction:column;align-items:center;text-align:center">
      <img src="out/patterns/orbits.svg" style="position:absolute;width:2000px;left:-400px;top:200px;opacity:.75"><div style="position:relative">{logo("gradient", 60)}</div>
      <img src="out/logos/svg/boterra-icon-3d.svg" style="position:relative;width:820px;margin-top:40px;border-radius:40px;mask-image:radial-gradient(circle at 50% 45%, #000 52%, transparent 72%);-webkit-mask-image:radial-gradient(circle at 50% 45%, #000 52%, transparent 72%)">
      <h2 class="display" style="position:relative;font-size:112px;line-height:1;margin-top:10px">It never gets tired.</h2><p style="position:relative;font-size:38px;color:var(--muted);margin-top:28px;line-height:1.4">AI agents that run your busiest workflow 24/7.</p>
      <span class="btn btn-primary" style="position:relative;margin-top:auto;height:96px;font-size:38px;padding:0 56px;border-radius:24px">www.boterra.io</span></div>''')
    out.append(f'''<div data-shot="collateral-rollup-banner" class="dark" style="width:800px;height:1940px;position:relative;overflow:hidden;background:radial-gradient(800px 700px at 100% 0%, rgba(123,92,255,.45), transparent 60%),#0A1230;padding:90px 80px;display:flex;flex-direction:column;gap:60px">
      <img src="out/patterns/mesh-dark.svg" style="position:absolute;left:-500px;top:700px;width:1600px;opacity:.5">{logo("gradient", 52)}
      <h2 class="display" style="position:relative;font-size:96px;line-height:1">Workflows that <span class="grad-text">run themselves.</span></h2>
      <div style="position:relative;display:flex;flex-direction:column;gap:22px">{''.join(f'<div class="card" style="padding:26px 30px;display:flex;gap:20px;align-items:center"><span style="color:#C9D5FF">{icon(i, 40)}</span><span class="display" style="font-size:34px">{t}</span></div>' for i, t in [("intake", "Intake"), ("calendar", "Scheduling"), ("invoice", "Billing"), ("followup", "Follow-ups")])}</div>
      <div style="position:relative;margin-top:auto;display:flex;flex-direction:column;gap:20px;align-items:flex-start"><span class="label" style="font-size:22px;color:var(--bt-teal)">Get a free automation plan</span><span class="display" style="font-size:58px">www.boterra.io</span></div></div>''')
    return "".join(out)

CSS = ""
open("web.html", "w").write(HEAD.format(css=CSS, body=website("dark") + website("light")))
open("product.html", "w").write(HEAD.format(css=CSS, body=dashboard() + builder() + mobile()))
open("deck.html", "w").write(HEAD.format(css=CSS, body=deck()))
open("social.html", "w").write(HEAD.format(css=CSS, body=social()))
open("collateral.html", "w").write(HEAD.format(css=CSS, body=collateral()))
print("written")
