'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

export default function DebugPage() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnosticData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/debug');
      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setDiagnosticData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnosticData();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/">
        <Button variant="outline" className="mb-6 flex items-center">
          <FiArrowLeft className="mr-2" /> Вернуться на главную
        </Button>
      </Link>
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
          Диагностика GitHub-конфигурации
        </h1>
        
        <Button 
          onClick={fetchDiagnosticData} 
          disabled={loading}
          className="flex items-center"
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>
      
      {error && (
        <Card className="mb-8 p-6 border-red-500 bg-red-50 dark:bg-red-900/20">
          <h2 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400">Ошибка</h2>
          <p>{error}</p>
        </Card>
      )}
      
      {loading && !error ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : diagnosticData && (
        <div className="space-y-8">
          {/* Переменные окружения */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Переменные окружения</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-2 pr-6 font-medium">NODE_ENV</td>
                    <td className="py-2">{diagnosticData.environment.node_env}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 font-medium">GITHUB_OWNER</td>
                    <td className="py-2">{diagnosticData.environment.github_owner}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 font-medium">GITHUB_REPO</td>
                    <td className="py-2">{diagnosticData.environment.github_repo}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 font-medium">GITHUB_TOKEN</td>
                    <td className="py-2">{diagnosticData.environment.github_token}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 font-medium">NOTES_PATH</td>
                    <td className="py-2">{diagnosticData.environment.notes_path}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {diagnosticData.environment.missing_vars.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="font-bold text-yellow-800 dark:text-yellow-400">Отсутствующие переменные:</p>
                <ul className="list-disc pl-5 mt-2">
                  {diagnosticData.environment.missing_vars.map((variable: string) => (
                    <li key={variable}>{variable}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
          
          {/* Статус GitHub */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Статус GitHub</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Токен GitHub</h3>
              <p className={`px-3 py-1 rounded-full inline-block ${
                diagnosticData.github_status.token_status.startsWith('Valid') 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {diagnosticData.github_status.token_status}
              </p>
            </div>
            
            {diagnosticData.github_status.repo_info && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Информация о репозитории</h3>
                {diagnosticData.github_status.repo_info.error ? (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    {diagnosticData.github_status.repo_info.error}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="py-2 pr-6 font-medium">Имя</td>
                          <td className="py-2">{diagnosticData.github_status.repo_info.name}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-6 font-medium">Полное имя</td>
                          <td className="py-2">{diagnosticData.github_status.repo_info.full_name}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-6 font-medium">Описание</td>
                          <td className="py-2">{diagnosticData.github_status.repo_info.description || '—'}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-6 font-medium">Видимость</td>
                          <td className="py-2">{diagnosticData.github_status.repo_info.visibility}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-6 font-medium">Основная ветка</td>
                          <td className="py-2">{diagnosticData.github_status.repo_info.default_branch}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {diagnosticData.github_status.notes_directory && (
              <div>
                <h3 className="font-semibold mb-2">Директория заметок</h3>
                {diagnosticData.github_status.notes_directory.error ? (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    {diagnosticData.github_status.notes_directory.error}
                  </div>
                ) : diagnosticData.github_status.notes_directory.status === 'Found' ? (
                  <div>
                    <p className="mb-2">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 inline-block">
                        Директория найдена
                      </span>
                      <span className="ml-2">
                        Элементов: {diagnosticData.github_status.notes_directory.items_count}
                      </span>
                    </p>
                    
                    {diagnosticData.github_status.notes_directory.markdown_files.length > 0 ? (
                      <div>
                        <h4 className="font-medium mt-4 mb-2">Найдены Markdown-файлы:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {diagnosticData.github_status.notes_directory.markdown_files.map((file: string) => (
                            <li key={file}>{file}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="italic text-gray-500 dark:text-gray-400">
                        Markdown-файлы не найдены в директории.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p>Статус: {diagnosticData.github_status.notes_directory.status}</p>
                    {diagnosticData.github_status.notes_directory.type && (
                      <p>Тип: {diagnosticData.github_status.notes_directory.type}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
          
          {/* Рекомендации по устранению проблем */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Рекомендации</h2>
            
            <div className="space-y-4">
              {diagnosticData.environment.missing_vars.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Отсутствующие переменные окружения</h3>
                  <p>Создайте или отредактируйте файл <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">.env.local</code> и добавьте следующие переменные:</p>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mt-2 overflow-x-auto">
                    {diagnosticData.environment.missing_vars.map((variable: string) => (
                      `${variable}=ваше_значение\n`
                    )).join('')}
                  </pre>
                </div>
              )}
              
              {diagnosticData.github_status.token_status.startsWith('Error') && (
                <div>
                  <h3 className="font-semibold mb-2">Проблема с токеном GitHub</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Убедитесь, что токен действителен и не истек</li>
                    <li>Токен должен иметь права доступа к вашему репозиторию (repo или public_repo)</li>
                    <li>Создайте новый токен на странице <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">GitHub Developer Settings</a></li>
                  </ol>
                </div>
              )}
              
              {diagnosticData.github_status.repo_info?.error && (
                <div>
                  <h3 className="font-semibold mb-2">Проблема с репозиторием</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Убедитесь, что репозиторий существует и доступен</li>
                    <li>Проверьте правильность написания имени пользователя и репозитория</li>
                    <li>Убедитесь, что токен имеет права доступа к этому репозиторию</li>
                  </ol>
                </div>
              )}
              
              {diagnosticData.github_status.notes_directory?.error && (
                <div>
                  <h3 className="font-semibold mb-2">Проблема с директорией заметок</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Создайте директорию <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{diagnosticData.environment.notes_path}</code> в корне вашего репозитория</li>
                    <li>Добавьте в директорию файл с расширением .md, например <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">example.md</code></li>
                    <li>Файл должен содержать frontmatter с полями: title, description, isPublic</li>
                    <li>Пример содержимого файла:</li>
                  </ol>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mt-2 overflow-x-auto">
{`---
title: Пример заметки
description: Описание моей первой заметки
date: ${new Date().toISOString().split('T')[0]}
tags: [example, test]
isPublic: true
---

# Моя первая заметка

Это содержимое моей заметки в формате Markdown.`}
                  </pre>
                </div>
              )}
              
              {(!diagnosticData.environment.missing_vars.length && 
                !diagnosticData.github_status.token_status.startsWith('Error') && 
                !diagnosticData.github_status.repo_info?.error && 
                !diagnosticData.github_status.notes_directory?.error) && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="font-bold text-green-800 dark:text-green-400">Все настройки выглядят корректно!</p>
                  <p className="mt-2">Если у вас все еще возникают проблемы:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Проверьте формат ваших markdown-файлов</li>
                    <li>Убедитесь, что в frontmatter указано поле title</li>
                    <li>Перезапустите сервер разработки</li>
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 