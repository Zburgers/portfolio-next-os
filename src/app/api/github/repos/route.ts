import { NextRequest, NextResponse } from 'next/server';
import type { GitHubRepository } from '@/lib/github';

export const revalidate = 30;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username || !/^[A-Za-z0-9-]{1,39}$/.test(username)) {
      return NextResponse.json(
        { error: 'A valid GitHub username is required.' },
        { status: 400 }
      );
    }

    // Get GitHub token from environment variables
    const token = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-OS/1.0'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Fetch user repositories
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&direction=desc&type=owner`, {
      headers,
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      const status = response.status === 403 ? 429 : response.status;
      return NextResponse.json(
        { error: response.status === 404 ? 'GitHub user was not found.' : response.status === 403 ? 'GitHub rate limit reached. Try again shortly.' : `GitHub API returned ${response.status}.` },
        { status }
      );
    }

    const repos: Array<{
      id: number;
      name: string;
      full_name: string;
      description: string | null;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      pushed_at: string;
      updated_at: string;
      html_url: string;
      private: boolean;
    }> = await response.json();

    // Token-authenticated GitHub requests can include private repositories.
    const simplifiedRepos: GitHubRepository[] = repos.filter((repo) => !repo.private).map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      pushedAt: repo.pushed_at,
      updatedAt: repo.updated_at,
      htmlUrl: repo.html_url,
    }));

    return NextResponse.json({ repos: simplifiedRepos }, { status: 200 });
  } catch (error) {
    console.error('Error fetching public GitHub repositories:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
