# SLICC Integration Example

SLICC is an external browser operator for the A2UI/AG-UI authoring experience.
The A2UI client remains responsible for rendering generated interfaces and
the AG-UI layer remains responsible for streaming events and HITL interrupts.

## Start

```bash
cd client
npm install
npm run dev
```

Use the deterministic `?demo=1` mode for the first SLICC run. If testing the
Universal Editor extension, follow the extension's separate IMS and App Builder
setup instructions.

## Example request

> Generate an on-brand hero draft for the demo page. Show the preview, brand
> score, and proposed changes. Do not sync or publish anything.

Expected operator flow:

1. Enter the request in the assistant UI.
2. Observe streamed AG-UI lifecycle and tool-call events.
3. Inspect the A2UI preview and brand/SEO feedback.
4. Stop at the HITL approval interrupt.
5. Only continue to sync after explicit user approval.

## Verification

```bash
cd client
npm run build
npm run test:visual
```

The visual test requires the repository's Playwright browser setup. Keep SLICC
and A2UI on demo content until the approval flow has been validated.
