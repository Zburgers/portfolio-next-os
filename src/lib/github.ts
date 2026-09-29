const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubFileContent {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'dir';
}

export interface GitHubTreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Portfolio-OS',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

export async function fetchRepoFileContent(repo: string, path: string): Promise<GitHubFileContent | null> {
  const safePath = path.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repo}/contents/${safePath}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new Error(`GitHub file request failed (${response.status})`);

  const data = await response.json();
  if (Array.isArray(data) || data.type !== 'file' || data.encoding !== 'base64' || !data.content) return null;

  return {
    name: data.name,
    path: data.path,
    content: Buffer.from(data.content, 'base64').toString('utf-8'),
    type: 'file',
  };
}

export async function fetchRepoTree(repo: string, branch?: string): Promise<GitHubTreeItem[]> {
  const repoResponse = await fetch(`${GITHUB_API_BASE}/repos/${repo}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });
  if (!repoResponse.ok) throw new Error(`GitHub repository request failed (${repoResponse.status})`);

  const repoData = await repoResponse.json();
  const ref = branch || repoData.default_branch;
  if (!ref) throw new Error('GitHub did not return a default branch for this repository');

  const branchResponse = await fetch(`${GITHUB_API_BASE}/repos/${repo}/branches/${encodeURIComponent(ref)}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });
  if (!branchResponse.ok) throw new Error(`GitHub branch request failed (${branchResponse.status})`);

  const branchData = await branchResponse.json();
  const treeSha = branchData.commit?.commit?.tree?.sha;
  if (!treeSha) throw new Error('GitHub did not return a commit tree for this branch');

  const treeResponse = await fetch(`${GITHUB_API_BASE}/repos/${repo}/git/trees/${treeSha}?recursive=1`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });
  if (!treeResponse.ok) throw new Error(`GitHub tree request failed (${treeResponse.status})`);

  const treeData = await treeResponse.json();
  return Array.isArray(treeData.tree) ? treeData.tree : [];
}

export function extractRepoFromUrl(githubUrl: string): string | null {
  try {
    const url = new URL(githubUrl);
    if (url.hostname.toLowerCase() !== 'github.com') return null;
    const [owner, rawRepo] = url.pathname.split('/').filter(Boolean);
    const repo = rawRepo?.replace(/\.git$/i, '');
    return owner && repo && /^[\w.-]+$/.test(owner) && /^[\w.-]+$/.test(repo)
      ? `${owner}/${repo}`
      : null;
  } catch {
    return null;
  }
}
