import { NextRequest, NextResponse } from 'next/server';
import { extractRepoFromUrl, fetchRepoTree, GitHubApiError } from '@/lib/github';

export const revalidate = 30;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const githubUrl = searchParams.get('url');
    const branch = searchParams.get('branch') || undefined;

    if (!githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    if (branch && (branch.length > 255 || /[\u0000-\u001f\u007f]/.test(branch))) {
      return NextResponse.json({ error: 'Invalid branch name.' }, { status: 400 });
    }

    const repo = extractRepoFromUrl(githubUrl);
    if (!repo) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format' },
        { status: 400 }
      );
    }

    const snapshot = await fetchRepoTree(repo, branch);
    return NextResponse.json({ ...snapshot, fetchedAt: new Date().toISOString() }, { status: 200 });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status === 403 ? 429 : error.status });
    }
    console.error('Error fetching public repository tree:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch repository tree.' },
      { status: 502 }
    );
  }
}
