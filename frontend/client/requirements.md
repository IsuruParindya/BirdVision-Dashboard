## Packages
react-webcam | For live camera feed in Live Detection page
react-dropzone | For drag and drop file uploads
framer-motion | For page transitions and smooth UI animations
recharts | For analytics charts

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  sans: ["var(--font-sans)"],
}
API Endpoints:
Assumes endpoints from shared/routes.ts are available. If not, mutations will fail gracefully.
