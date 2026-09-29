export function extractRepoFromUrl(githubUrl: string): string | null {
  try {
    const url = new URL(githubUrl);
    if (url.hostname.toLowerCase() !== 'github.com' || !['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) return null;
    const [owner, rawRepo] = url.pathname.split('/').filter(Boolean);
    const repo = rawRepo?.replace(/\.git$/i, '');
    return owner && repo && /^[\w.-]+$/.test(owner) && /^[\w.-]+$/.test(repo)
      ? `${owner}/${repo}`
      : null;
  } catch {
    return null;
  }
}
