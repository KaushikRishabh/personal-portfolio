/** Prefix public assets when hosted under a GitHub Pages repository path. */
export const assetPath = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
