import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function GET() {
  // Проверка переменных окружения
  const environment = {
    node_env: process.env.NODE_ENV || 'not set',
    github_owner: process.env.GITHUB_OWNER || 'not set',
    github_repo: process.env.GITHUB_REPO || 'not set',
    github_token: process.env.GITHUB_TOKEN ? 'set (masked)' : 'not set',
    notes_path: process.env.NOTES_PATH || 'not set',
    missing_vars: [] as string[],
    octokit_version: 'installed'
  };

  // Проверка наличия необходимых переменных
  if (!process.env.GITHUB_TOKEN) environment.missing_vars.push('GITHUB_TOKEN');
  if (!process.env.GITHUB_OWNER) environment.missing_vars.push('GITHUB_OWNER');
  if (!process.env.GITHUB_REPO) environment.missing_vars.push('GITHUB_REPO');
  if (!process.env.NOTES_PATH) environment.missing_vars.push('NOTES_PATH');

  // Статус GitHub
  const github_status: any = {
    token_status: 'Not checked',
    repo_info: null,
    notes_directory: null,
    api_methods: {
      // Проверяем наличие методов getContent и getContents
      has_getContent: false,
      has_getContents: false
    }
  };

  // Если токен отсутствует, не выполняем проверки GitHub
  if (!process.env.GITHUB_TOKEN) {
    github_status.token_status = 'Error: GitHub token is not set';
    return NextResponse.json({ environment, github_status });
  }

  try {
    // Инициализация Octokit с токеном
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Проверяем наличие методов getContent и getContents
    github_status.api_methods.has_getContent = typeof octokit.rest.repos.getContent === 'function';
    github_status.api_methods.has_getContents = typeof (octokit.rest.repos as any).getContents === 'function';

    // Проверка токена
    try {
      const { data: user } = await octokit.users.getAuthenticated();
      github_status.token_status = `Valid (authenticated as ${user.login})`;
    } catch (error: any) {
      github_status.token_status = `Error: ${error.message || 'Failed to authenticate with GitHub'}`;
      return NextResponse.json({ environment, github_status });
    }

    // Если отсутствует имя владельца или репозитория, не выполняем проверки репозитория
    if (!process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      github_status.repo_info = { error: 'GitHub owner or repo is not set' };
      return NextResponse.json({ environment, github_status });
    }

    // Проверка репозитория
    try {
      const { data: repo } = await octokit.repos.get({
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO
      });

      github_status.repo_info = {
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        visibility: repo.visibility,
        default_branch: repo.default_branch
      };
    } catch (error: any) {
      github_status.repo_info = { 
        error: `Error accessing repository: ${error.message || 'Unknown error'}`
      };
      return NextResponse.json({ environment, github_status });
    }

    // Если путь к заметкам не указан, не выполняем проверку директории
    if (!process.env.NOTES_PATH) {
      github_status.notes_directory = { error: 'Notes path is not set' };
      return NextResponse.json({ environment, github_status });
    }

    // Проверка директории с заметками
    try {
      // Примечание: В зависимости от версии Octokit, метод может называться getContent или getContents
      // В текущей версии используется getContent
      const { data: contents } = await octokit.repos.getContent({
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        path: process.env.NOTES_PATH
      });

      if (Array.isArray(contents)) {
        // Это директория
        const markdownFiles = contents
          .filter(item => item.type === 'file' && item.name.endsWith('.md'))
          .map(item => item.name);

        github_status.notes_directory = {
          status: 'Found',
          items_count: contents.length,
          markdown_files: markdownFiles.slice(0, 10), // Ограничиваем список первыми 10 файлами
          has_more_files: markdownFiles.length > 10
        };
      } else {
        // Это файл, а не директория
        github_status.notes_directory = {
          status: 'Not a directory',
          type: 'file'
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('404')) {
        github_status.notes_directory = {
          status: 'Not found',
          error: `Directory not found: ${process.env.NOTES_PATH}`
        };
      } else {
        github_status.notes_directory = {
          status: 'Error',
          error: `Error accessing notes directory: ${errorMessage}`
        };
      }
    }
  } catch (error: any) {
    github_status.token_status = `Error: ${error.message || 'Unknown error during GitHub checks'}`;
  }

  return NextResponse.json({ environment, github_status });
} 