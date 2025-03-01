import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';

// Конфигурация GitHub
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_OWNER = process.env.GITHUB_OWNER || '';
const GITHUB_REPO = process.env.GITHUB_REPO || '';
const NOTES_PATH = process.env.NOTES_PATH || 'notes'; // Путь к директории с заметками

// Проверка наличия необходимых переменных окружения
const hasGitHubCredentials = GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO;

// Инициализация GitHub API клиента, только если есть учетные данные
// Примечание: В некоторых версиях Octokit метод называется getContents (с 's' на конце)
// В текущей версии используется getContent
const octokit = hasGitHubCredentials ? new Octokit({ auth: GITHUB_TOKEN }) : null;

// Интерфейсы для типизации
export interface NoteMetadata {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  slug: string;
  isPublic: boolean;
  coverImage?: string;
}

export interface NoteContent {
  content: string;
  metadata: NoteMetadata;
}

// Тестовые заметки для отображения, когда нет GitHub-авторизации
const TEST_NOTES: NoteMetadata[] = [
  {
    title: "Начало работы с Obsidian",
    description: "Руководство по началу работы с Obsidian и настройке рабочего процесса",
    date: "2023-01-15",
    tags: ["obsidian", "tutorial", "productivity"],
    slug: "getting-started-with-obsidian",
    isPublic: true,
    coverImage: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?q=80&w=1266&auto=format&fit=crop",
  },
  {
    title: "Markdown синтаксис",
    description: "Полное руководство по синтаксису Markdown для оформления заметок",
    date: "2023-02-20",
    tags: ["markdown", "tutorial", "formatting"],
    slug: "markdown-syntax",
    isPublic: true,
  },
  {
    title: "Продвинутые плагины Obsidian",
    description: "Обзор полезных плагинов для расширения функциональности Obsidian",
    date: "2023-03-10",
    tags: ["obsidian", "plugins", "productivity"],
    slug: "advanced-obsidian-plugins",
    isPublic: true,
    coverImage: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1170&auto=format&fit=crop",
  },
];

const TEST_NOTE_CONTENT = `
# Пример заметки Obsidian

Это **демонстрационная** заметка, созданная для тестирования функциональности сайта.

## Поддерживаемые возможности

- Маркированные списки
- *Курсив* и **жирный** текст
- [Ссылки](https://obsidian.md)
- И многое другое!

### Пример кода

\`\`\`javascript
function hello() {
  console.log("Hello from Obsidian!");
}
\`\`\`

## Изображения

Вот пример того, как выглядят изображения:

![Пример изображения](https://images.unsplash.com/photo-1468421870903-4df1664ac249?w=800&auto=format&fit=crop)

А также Obsidian изображения:

![[Pasted image 20250301151803.png]]
`;

/**
 * Получает список всех заметок из репозитория
 */
export async function fetchAllNotes(): Promise<NoteMetadata[]> {
  // Если нет учетных данных GitHub, возвращаем тестовые заметки
  if (!hasGitHubCredentials) {
    console.log('Используются тестовые заметки, так как не указаны учетные данные GitHub');
    return TEST_NOTES;
  }

  try {
    // Получаем содержимое директории с заметками
    // Примечание: Если возникает ошибка, возможно, в вашей версии Octokit метод называется getContents
    const { data: files } = await octokit!.rest.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: NOTES_PATH,
    });

    if (!Array.isArray(files)) {
      throw new Error('Notes path is not a directory');
    }

    // Фильтруем только markdown файлы
    const markdownFiles = files.filter(
      (file) => file.type === 'file' && file.name.endsWith('.md')
    );

    // Получаем метаданные каждой заметки
    const notes = await Promise.all(
      markdownFiles.map(async (file) => {
        try {
          // Примечание: Если возникает ошибка, возможно, в вашей версии Octokit метод называется getContents
          const { data: fileContent } = await octokit!.rest.repos.getContent({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: file.path,
          });

          if ('content' in fileContent) {
            const content = Buffer.from(fileContent.content, 'base64').toString();
            const { data } = matter(content);
            
            return {
              ...data,
              slug: file.name.replace('.md', ''),
              isPublic: data.isPublic ?? false,
            } as NoteMetadata;
          }
          return null;
        } catch (error) {
          console.error(`Error fetching note ${file.name}:`, error);
          return null;
        }
      })
    );

    return notes.filter((note): note is NoteMetadata => note !== null);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
}

/**
 * Конвертирует Obsidian-синтаксис в обычный Markdown
 */
function convertObsidianToMarkdown(content: string): string {
  // Конвертация Obsidian изображений: ![[image.png]] -> ![image](files/image.png)
  const obsidianImageRegex = /!\[\[(.*?)\]\]/g;
  
  return content.replace(obsidianImageRegex, (match, filename) => {
    // Извлекаем имя файла для использования в alt тексте
    const imageName = filename.split('/').pop();
    
    // Если путь содержит obsidianvault, используем его как есть
    if (filename.startsWith('obsidianvault/')) {
      return `![${imageName}](${filename})`;
    }
    
    // Если путь уже содержит директорию, используем его как есть, иначе добавляем files/
    const imagePath = filename.includes('/') ? filename : `files/${filename}`;
    
    // Не нужно вручную кодировать URL здесь, так как это будет сделано в getGitHubImageUrl
    // и в компоненте img уже есть обработка для этого
    return `![${imageName}](${imagePath})`;
  });
}

/**
 * Получает содержимое конкретной заметки по слагу
 */
export async function fetchNoteBySlug(slug: string): Promise<NoteContent | null> {
  // Если нет учетных данных GitHub, возвращаем тестовую заметку
  if (!hasGitHubCredentials) {
    const testNote = TEST_NOTES.find(note => note.slug === slug);
    
    if (!testNote) {
      // Если запрашиваемой заметки нет среди тестовых, возвращаем первую тестовую заметку
      return {
        content: TEST_NOTE_CONTENT,
        metadata: TEST_NOTES[0],
      };
    }
    
    return {
      content: TEST_NOTE_CONTENT,
      metadata: testNote,
    };
  }

  try {
    const filePath = `${NOTES_PATH}/${slug}.md`;
    
    // Примечание: Если возникает ошибка, возможно, в вашей версии Octokit метод называется getContents
    const { data: fileContent } = await octokit!.rest.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
    });

    if ('content' in fileContent) {
      const content = Buffer.from(fileContent.content, 'base64').toString();
      const { content: markdownContent, data } = matter(content);
      
      // Конвертируем Obsidian синтаксис в стандартный Markdown
      const processedContent = convertObsidianToMarkdown(markdownContent);
      
      return {
        content: processedContent,
        metadata: {
          ...data,
          slug,
          isPublic: data.isPublic ?? false,
        } as NoteMetadata,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching note ${slug}:`, error);
    return null;
  }
}

/**
 * Преобразует URL изображения GitHub в прямую ссылку
 */
export function getGitHubImageUrl(path: string): string {
  // Если это уже абсолютный URL, возвращаем его без изменений
  if (path.startsWith('http')) {
    return path;
  }
  
  // Если нет учетных данных GitHub, возвращаем путь с закодированными пробелами
  if (!hasGitHubCredentials) {
    // Для тестового режима возвращаем URL для тестовых изображений
    if (path.startsWith('files/')) {
      const fileName = path.substring(6); // удаляем 'files/'
      // Возвращаем URL для тестовых изображений - используем несплеш как замену
      return `https://source.unsplash.com/random/800x600?${encodeURIComponent(fileName)}`;
    }
    // Кодируем пробелы в пути, если они еще не закодированы
    return path.includes(' ') ? encodeURI(path) : path;
  }
  
  // Обрабатываем путь, чтобы он корректно работал с GitHub raw URL
  // Удаляем начальный слеш, если он есть
  let cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Проверяем, содержит ли путь префикс obsidianvault
  if (!cleanPath.startsWith('obsidianvault/') && !cleanPath.includes('://')) {
    // Если путь не начинается с obsidianvault/ и не является URL, добавляем префикс
    cleanPath = `obsidianvault/${cleanPath}`;
  }
  
  // Используем encodeURI для правильного кодирования пробелов и других специальных символов
  const encodedPath = encodeURI(cleanPath);
  
  // Формируем URL для доступа к "сырым" файлам из GitHub репозитория
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${encodedPath}`;
}

/**
 * Проверяет, существует ли заметка с указанным слагом
 */
export async function checkNoteExists(slug: string): Promise<boolean> {
  // Если нет учетных данных GitHub, проверяем среди тестовых заметок
  if (!hasGitHubCredentials) {
    return TEST_NOTES.some(note => note.slug === slug) || slug === TEST_NOTES[0].slug;
  }

  try {
    const filePath = `${NOTES_PATH}/${slug}.md`;
    
    // Примечание: Если возникает ошибка, возможно, в вашей версии Octokit метод называется getContents
    await octokit!.rest.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
    });
    
    return true;
  } catch (error) {
    return false;
  }
} 