import { NextRequest, NextResponse } from 'next/server';
import { fetchRepoTree, extractRepoFromUrl } from '@/lib/github';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const githubUrl = searchParams.get('url');
    const branch = searchParams.get('branch') || 'main';

    if (!githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    const repo = extractRepoFromUrl(githubUrl);
    if (!repo) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format' },
        { status: 400 }
      );
    }

    const tree = await fetchRepoTree(repo, branch);
    
    return NextResponse.json({ tree }, { status: 200 });
  } catch (error) {
    console.error('Error fetching repo tree:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository tree' },
      { status: 500 }
    );
  }
}