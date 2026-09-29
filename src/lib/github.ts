import 'server-only';

export { extractRepoFromUrl } from '@/lib/github-url';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_REVALIDATE_SECONDS = 30;
const FILE_PREVIEW_LIMIT = 250_000;

export interface GitHubFileContent {
  name: string;
  path: string;
  content: string;
  type: 'file';
}

export interface GitHubTreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  pushedAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface GitHubRepositoryTree {
  repository: string;
  branch: string;
  defaultBranch: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export class GitHubApiError extends Error {
  constructor(readonly status: number, message?: string) {
    super(message || (status === 404 ? 'The requested GitHub resource was not found.' : `GitHub API returned ${status}.`));
    this.name = 'GitHubApiError';
  }
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

async function fetchGitHubJson<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: getHeaders(),
    next: { revalidate: GITHUB_REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new GitHubApiError(response.status);
  return response.json() as Promise<T>;
}

export function isSafeGitHubPath(path: string): boolean {
  return path.length > 0 && path.length <= 500 && !path.startsWith('/') &&
    !path.includes('\\') && !/[\u0000-\u001f\u007f]/.test(path) &&
    path.split('/').every((segment) => segment !== '.' && segment !== '..' && segment.length > 0);
}

export async function fetchRepoFileContent(repo: string, path: string, branch?: string): Promise<GitHubFileContent | null> {
  if (!isSafeGitHubPath(path)) return null;
  const repository = await fetchGitHubJson<{ private?: boolean }>(`/repos/${repo}`);
  if (repository.private !== false) throw new GitHubApiError(404, 'Public repository not found.');

  const safePath = path.split('/').map(encodeURIComponent).join('/');
  const query = branch ? `?ref=${encodeURIComponent(branch)}` : '';
  const data = await fetchGitHubJson<{
    name: string;
    path: string;
    type: string;
    size?: number;
    encoding?: string;
    content?: string;
  }>(`/repos/${repo}/contents/${safePath}${query}`);

  if ((data.size !== undefined && data.size > FILE_PREVIEW_LIMIT) ||
    (data.content?.length || 0) > Math.ceil(FILE_PREVIEW_LIMIT * 4 / 3) + 4) {
    throw new GitHubApiError(413, `File preview is limited to ${FILE_PREVIEW_LIMIT.toLocaleString()} bytes.`);
  }
  if (data.type !== 'file' || data.encoding !== 'base64' || data.content === undefined) return null;
  let content: string;
  try {
    content = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.from(data.content, 'base64'));
  } catch {
    return null;
  }
  return {
    name: data.name,
    path: data.path,
    content,
    type: 'file',
  };
}

export async function fetchRepoTree(repo: string, branch?: string): Promise<GitHubRepositoryTree> {
  const repoData = await fetchGitHubJson<{ full_name?: string; default_branch?: string; private?: boolean }>(`/repos/${repo}`);
  if (repoData.private !== false) throw new GitHubApiError(404, 'Public repository not found.');
  const defaultBranch = repoData.default_branch;
  const resolvedBranch = branch || defaultBranch;
  if (!resolvedBranch) throw new Error('GitHub did not return a default branch for this repository.');

  const branchData = await fetchGitHubJson<{
    commit?: { commit?: { tree?: { sha?: string } } };
  }>(`/repos/${repo}/branches/${encodeURIComponent(resolvedBranch)}`);
  const treeSha = branchData.commit?.commit?.tree?.sha;
  if (!treeSha) throw new Error('GitHub did not return a commit tree for this branch.');

  const treeData = await fetchGitHubJson<{ tree?: GitHubTreeItem[]; truncated?: boolean }>(`/repos/${repo}/git/trees/${treeSha}?recursive=1`);
  return {
    repository: repoData.full_name || repo,
    branch: resolvedBranch,
    defaultBranch: defaultBranch || resolvedBranch,
    tree: Array.isArray(treeData.tree) ? treeData.tree : [],
    truncated: treeData.truncated === true,
  };
}
