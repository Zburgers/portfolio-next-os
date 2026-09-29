import { NextRequest, NextResponse } from 'next/server';
import { extractRepoFromUrl, fetchRepoFileContent, GitHubApiError, isSafeGitHubPath } from '@/lib/github';

export const revalidate = 30;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const githubUrl = searchParams.get('url');
    const filePath = searchParams.get('path');
    const branch = searchParams.get('branch') || undefined;

    if (!githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    if (!filePath || !isSafeGitHubPath(filePath)) {
      return NextResponse.json(
        { error: 'A valid repository-relative file path is required.' },
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

    const fileContent = await fetchRepoFileContent(repo, filePath, branch);
    
    if (!fileContent) {
      return NextResponse.json(
        { error: 'This path is not a UTF-8 text file that GitHub can preview.' },
        { status: 415 }
      );
    }

    return NextResponse.json({ file: fileContent }, { status: 200 });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status === 403 ? 429 : error.status });
    }
    console.error('Error fetching public GitHub file:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch file content.' },
      { status: 502 }
    );
  }
}
