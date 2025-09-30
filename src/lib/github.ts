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

export async function fetchRepoFileContent(repo: string, path: string): Promise<GitHubFileContent | null> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-OS/1.0'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${repo}/contents/${path}`, {
      headers,
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return null; // It's a directory, not a file
    }

    if (data.content && data.encoding === 'base64') {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return {
        name: data.name,
        path: data.path,
        content,
        type: 'file'
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching file content:', error);
    return null;
  }
}

export async function fetchRepoTree(repo: string, branch: string = 'main'): Promise<GitHubTreeItem[]> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-OS/1.0'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // First, get the branch info to get the tree SHA
    const branchResponse = await fetch(`${GITHUB_API_BASE}/repos/${repo}/branches/${branch}`, {
      headers,
      next: { revalidate: 3600 }
    });

    if (!branchResponse.ok) {
      // Try 'master' if 'main' doesn't exist
      const masterResponse = await fetch(`${GITHUB_API_BASE}/repos/${repo}/branches/master`, {
        headers,
        next: { revalidate: 3600 }
      });

      if (!masterResponse.ok) {
        console.error(`GitHub API error: ${branchResponse.status}`);
        return [];
      }

      const masterData = await masterResponse.json();
      const treeSha = masterData.commit.commit.tree.sha;

      // Get the tree
      const treeResponse = await fetch(`${GITHUB_API_BASE}/repos/${repo}/git/trees/${treeSha}?recursive=1`, {
        headers,
        next: { revalidate: 3600 }
      });

      if (!treeResponse.ok) {
        return [];
      }

      const treeData = await treeResponse.json();
      return treeData.tree || [];
    }

    const branchData = await branchResponse.json();
    const treeSha = branchData.commit.commit.tree.sha;

    // Get the tree
    const treeResponse = await fetch(`${GITHUB_API_BASE}/repos/${repo}/git/trees/${treeSha}?recursive=1`, {
      headers,
      next: { revalidate: 3600 }
    });

    if (!treeResponse.ok) {
      return [];
    }

    const treeData = await treeResponse.json();
    return treeData.tree || [];
  } catch (error) {
    console.error('Error fetching repo tree:', error);
    return [];
  }
}

export function extractRepoFromUrl(githubUrl: string): string | null {
  try {
    const match = githubUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}