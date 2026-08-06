# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is the **frontend/proxy** half of a two-codebase referral management system:

1. **This repository** (`referral/`) — legacy-style PHP 5.3-compatible frontend, deployed as a subdirectory of a larger legacy application at `C:\laragon\www\odb`. It renders the UI (PHP + Bootstrap 5 + jQuery) and proxies data calls to the Laravel API using JWT.
2. **`referral-api`** (sibling project — path depends on environment: `C:\laragon\www\referral-api` on local dev, `C:\xampp\htdocs\referral-api` on production) — the actual Laravel REST API and source of truth for business logic, validation, and the MySQL database (`referrals`, `referral_hierarchies`, `referral_details`, `business_units`, `staff`, etc.). Not part of this repo; check it separately when a bug could be server-side (validation rules, authorization, status transitions).

There is no Composer/Node build in this repo (no `composer.json`/`package.json`). PHP files are consumed directly by Apache/Laragon; JS/CSS are plain `<script>`/`<link>` includes with cache-busting via `?v=<?php echo time()/filemtime(...); ?>`.

### Critical dependency on the parent app

This repo is **not self-contained** — it must be deployed at `odb/referral/` alongside the legacy sibling app, because nearly every entry-point PHP file starts with:

```php
require_once('../lock_adv.php');   // session/login gate, sets $id_user, $department, $outlet, staff auth flags
include('../common/index_adv.php'); // derives $businessUnitId, opens legacy mysqli $conn
```

These live one directory above this repo root and are **not tracked in this git repository**. When investigating a bug, check `lock_adv.php` and `common/index_adv.php` in the parent `odb` directory — they're frequently where session/permission values originate (e.g. `$id_user` from `stripslashes($row['id'])` is a **string**, `$outlet` is a **raw comma-separated string**, never pre-split into an array).

## Running/testing locally

There is no automated test suite, linter, or build step in this repo. Development loop is:
- Serve via Laragon/Apache (already configured at `C:\laragon\www\odb`).
- Verify PHP syntax: `php -l path/to/file.php`
- Verify JS syntax: `node --check path/to/file.js`
- For anything touching real data, use `php artisan tinker` in the sibling `referral-api` Laravel project to inspect actual DB rows (referrals, referral_hierarchies) rather than guessing — the legacy `odb` MySQL connection is often not reachable directly from a dev shell, but the Laravel app's DB usually is.

## Architecture

### Request flow

Browser → PHP page (e.g. `view.php`, `create.php`, `index.php`) renders HTML + emits JS globals from PHP session data → jQuery (`js/*.js`) drives all dynamic behavior via AJAX to **local PHP proxy endpoints** (`api-jwt.php`, `update.php`, `post.php`) → those proxy endpoints call `getApiDataWithJWT($endpoint, $data, $method)` in `api-jwt.php`, which mints a JWT (via `getJWTToken`/`getJWTTokenByBU`/`getAuthToken`) and forwards the request to the Laravel `referral-api`.

Key point: **the legacy PHP proxy layer does very little validation of its own** — form/status validation lives client-side in the relevant `js/*.js` file (e.g. `validateForm()` in `view.js`) and server-side in Laravel's `FormRequest` classes (e.g. `UpdateReferralRequest`). When a bug looks like a permissions/workflow issue, check three places, in order: the JS gating logic, the PHP proxy (usually a thin passthrough), and the Laravel `FormRequest`/controller.

### `api-jwt.php`

Dual-purpose file (~2000+ lines):
- **Included** by other PHP pages for its helper functions (`getApiDataWithJWT`, `getJWTToken`, `getAuthToken`, `getStaffAuthData`, etc.) — guarded so it doesn't emit a response when included rather than hit directly.
- **Hit directly** via AJAX as a request router: reads `$_POST['action']`, dispatches to the matching handler, returns JSON.

`getStaffAuthData($staff_id)` is the canonical place staff `outlet` (CSV) gets exploded into an int array and `staff_id` gets cast to int for the JWT payload — the *page-level* PHP (`lock_adv.php`) does **not** do this casting, which has been a repeated source of loose-vs-strict comparison bugs in JS (`$id_user`/`staffId` arrives client-side as a string; `staffOutlet` arrives as a raw CSV string, not an array).

### `view.js` — status/workflow gating (frequent source of bugs)

`view.js` computes two globals, `window.isLastSequence` and `window.hasReplyForms`, via a long if/else-if chain (look for `referralDetails[referralDetails.length - 1]`, i.e. the last `referral_hierarchies` row) that decides:
- whether the current logged-in staff member is allowed to change the referral's status (`isLastSequence` gates the `disabled` attribute on the status radios, see `loadStatusOptions`/`shouldDisableRadios`),
- whether the dynamic reply form is shown, and whether `displayContent()` runs (the **only** place that injects the hidden `bu_id_reply` input required by the Laravel `UpdateReferralRequest` validation on every submission — branches that skip `displayContent()` for legitimate UX reasons, e.g. "form already filled", must still inject that hidden field manually or submission will 422).

When debugging "user can't do X on this referral" reports:
1. Confirm real DB state for that referral via `referral-api`'s tinker (`referrals.status`, the relevant `referral_hierarchies` row's `staff_id`/`business_unit_id`/`location`/`is_filled`).
2. Trace which branch of the if/else-if chain that state falls into.
3. Watch for `===`/`==` mismatches — values from the legacy session (`staffId`, `staffOutlet`, `businessUnitId`) are PHP-`json_encode`d strings/raw CSVs, while values from the Laravel API JSON response (`lastSequence.staff_id`, `.business_unit_id`) are native ints/booleans (Eloquent casts some columns, e.g. `is_filled`/`is_read`, but not `staff_id`). Prefer `String(a) === String(b)` when comparing session-derived values against API-derived values.
4. `staffOutlet` can be a comma-separated list (multi-outlet staff) — compare via list membership (`.split(',').indexOf(...)`), matching the backend's `in_array($rh->location, $listOutlets)` check in `ReferralController::update()`, not exact string equality.

There are two separate `addStatusChangeListeners()` function definitions in `view.js`; the second silently overrides the first. Be aware of this when editing status-change behavior — check both if changing how the UI reacts to a status radio change, or consolidate them if doing a larger refactor.

### Directory layout

- `js/`, `css/` — one JS/CSS file per major page (`view.js`, `create.js`, `admin.js`, `report.js`, `report-monthly.js`, `report-yearly.js`), plus shared `errorLogger.js`/`toast.js`.
- `businessUnit/`, `customerFilter/`, `externalOrganization/` — self-contained widget-style submodules, each with its own `index.php` + `css/` + `js/`.
- `report/` — `monthly.php`/`yearly.php` reporting views.
- `api/index.php` — a separate, simpler token-authenticated JSON API (static bearer token, not JWT) exposing staff lookups (`getAllStaff`, `getStaffDetails`, `getByDepartment`) — distinct from `api-jwt.php`.
- `logs/jwt_operations.log` — JWT/API call logging.
- `.env` (see `.env.example`) — holds `TOKEN_SECRET`/`TOKEN_EXPIRY_DAYS`; loaded manually via `parse_ini_file()` (no dotenv package) — see `successful.php` for the loading pattern.
- `USER_MANUAL.md` / `WORKFLOW_GUIDE.md` — end-user documentation of features and step-by-step workflows; useful for understanding intended behavior when a bug report references a specific screen or step.

## Coding constraints (this repo specifically)

- Legacy PHP pages under this repo generally target **PHP 5.3-compatible syntax**: `array()` not `[]`, no namespaces/traits/short ternary/null coalescing. Match the existing style in the file you're editing.
- No build step for JS — edit `js/*.js` directly; verify with `node --check file.js` before considering a change done, since there's no linter/CI to catch syntax errors.
