# Ecosystem Position: skintwin-salon

> This repository is part of the [SkinTwin-AI ecosystem](https://github.com/jax-a11y/skintwin-ecosystem-design).
> Its machine-readable manifest lives at [`.skintwin/manifest.json`](./.skintwin/manifest.json); the ecosystem-wide
> source of truth is the hub's [`registry/ecosystem.json`](https://github.com/jax-a11y/skintwin-ecosystem-design/blob/main/registry/ecosystem.json).

**Layer:** commerce-surface · **Role:** storefront

SkinTwin Salon is the customer-facing booking and checkout storefront of the ecosystem: a Gatsby 4 site
covering service discovery, appointment scheduling, client intake/consent, and Paystack Terminal payment
with Pusher-powered real-time status updates. Its Gatsby Functions (`src/api/`) handle appointments,
clients, and payments locally, and its `src/api/integrations/` connector syncs data upstream to the
integration hub rather than talking to backend platforms directly.

## Provides

Nothing — as a commerce-surface storefront it exposes no ecosystem contracts; its serverless functions
serve only its own frontend.

## Consumes

- `integration-api` — Unified gateway to Wix/OpenCart/Shopify B2B: health, sync (appointments/clients/products), B2B companies

## Events

| Topic                 | Direction  |
|-----------------------|------------|
| `order.placed`        | publishes  |
| `appointment.created` | publishes  |

Payload schemas live at `contracts/events/<topic>.schema.json` in the
[hub repo](https://github.com/jax-a11y/skintwin-ecosystem-design).

## Service discovery

Consumed services are located via environment variables — never hardcoded URLs:

- `SKINTWIN_INTEGRATION_HUB_URL` — Base URL of the integration hub (default `http://localhost:5000`)

## CI

CI runs in this repo's own workflows — `ci.yml` (lint, typecheck, unit, Gatsby build), plus e2e, Lighthouse,
security, and release pipelines — and does not currently call the hub's reusable templates. Reusable
`workflow_call` CI templates are documented in the hub repo's `ci/README.md`.
