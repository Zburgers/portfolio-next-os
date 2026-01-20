import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
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
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
      headers,
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${response.status}` },
        { status: response.status }
      );
    }

    const repos = await response.json();

    // Return only necessary fields
    const simplifiedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      updatedAt: repo.updated_at,
      cloneUrl: repo.clone_url,
      htmlUrl: repo.html_url,
      private: repo.private
    }));

    return NextResponse.json({ repos: simplifiedRepos }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}