// Tell adapter-static that all routes can be prerendered at build time.
// Without this, the static adapter errors because it can't determine
// whether pages need a server for dynamic rendering.
export const prerender = true;
