# Choose Your Porsche — by Marcos

An unofficial, personal learning project for building a premium interactive automotive configurator.

## Current milestone: Phase 01 foundation

This first version validates the architecture and visual language before a licensed, configurable Porsche 911 GT3 RS 3D asset is introduced.

Implemented:

- Next.js, TypeScript and Tailwind CSS
- React Three Fiber / Three.js scene
- dark reflective circular platform
- animated red and white speed-light environment
- touch/mouse 360° orbit controls
- procedural development vehicle proxy
- animated paint changes using selected Porsche color names
- headlights, taillights and hazard controls
- English and Portuguese interface
- Performance, Balanced and Ultra rendering modes
- landscape-oriented tablet/mobile experience
- intro screen with optional synthesized placeholder audio
- cinematic build-summary camera mode
- PNG canvas capture
- shareable configuration URL parameters

## Important asset note

The current car is intentionally a generic procedural proxy. It must not be presented as the final GT3 RS model. A final asset needs:

- an appropriate license for public web use
- separated body, wheels, brakes, lights, wing and carbon components
- editable materials
- optimized geometry and textures
- tested performance on iPad and modern phones

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate production

```bash
npm run lint
npm run build
```

## Planned next milestones

1. Replace the development proxy with a properly licensed 992 GT3 RS asset.
2. Add wheel and brake options.
3. Add Weissach and exterior package controls.
4. Add graphics and stripe materials.
5. Add DRS animation and concept wing-delete mode.
6. Add suspension-height presentation controls.
7. Replace synthesized audio with licensed automotive recordings.
8. Improve screenshot composition with title and MMC signature rendered into the export.

## Trademark notice

This is an unofficial personal coding project and is not affiliated with, endorsed by, or sponsored by Porsche AG. Product names are used only to describe the intended learning concept.
