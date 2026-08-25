# ckv-demos

One-off demo sites built for prospects, before they become paying clients.

Each folder under `demos/<slug>/` is a fully built, static site — the exact
output you would deploy, not source. It is served live at
`ckvmedia.co/demo-<slug>/` the moment its folder exists here and the admin
panel is told to connect that slug.

## Workflow

- **Add a demo**: build it locally, copy the built output into `demos/<slug>/`
  here, commit, push. In the CKV Media client portal admin panel
  (Leads -> a lead -> "Attach demo site"), enter that same slug — it pulls
  this repo and goes live immediately.
- **Update a demo**: overwrite `demos/<slug>/`, commit, push. The portal
  re-pulls this repo on the next connect/remove action; no re-upload needed.
- **Remove a demo**: use "Remove demo" in the admin panel — it deletes the
  folder here (via `git rm`, committed and pushed) and takes the live link
  down, in one action. You do not need to touch this repo by hand to clean
  up a dead lead.
- **A demo converts to a real client**: move its folder out into its own
  dedicated repo and Forge site (it is no longer a disposable demo), then
  remove it from here the same way.

Build with the site's base path set to `/demo-<slug>/` so its own asset
URLs resolve correctly under that subpath.
