import { NextRequest, NextResponse } from 'next/server';
import { fetchRepoFileContent, extractRepoFromUrl } from '@/lib/github';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const githubUrl = searchParams.get('url');
    const filePath = searchParams.get('path');

    if (!githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
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

    const fileContent = await fetchRepoFileContent(repo, filePath);
    
    if (!fileContent) {
      return NextResponse.json(
        { error: 'File not found or unable to fetch content' },
        { status: 404 }
      );
    }

    return NextResponse.json({ file: fileContent }, { status: 200 });
  } catch (error) {
    console.error('Error fetching file content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file content' },
      { status: 500 }
    );
  }
}