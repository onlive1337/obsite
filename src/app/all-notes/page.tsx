import { fetchAllNotes } from "@/lib/github";
import NoteCard from "@/components/NoteCard";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { FiArrowLeft } from "react-icons/fi";

export default async function AllNotes() {
  // Получаем все заметки, включая приватные
  const notes = await fetchAllNotes();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <Link href="/">
          <Button variant="outline" className="mb-6 flex items-center">
            <FiArrowLeft className="mr-2" /> Вернуться на главную
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
          Все заметки ({notes.length})
        </h1>
        
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-300">
            На этой странице отображаются все заметки, включая приватные.
            В реальной версии этот раздел может быть защищен паролем или доступен только администраторам.
          </p>
        </div>
        
        {notes.length === 0 ? (
          <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Заметки не найдены. Проверьте настройки GitHub и директорию с заметками.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.slug} className="relative">
                {!note.isPublic && (
                  <div className="absolute top-4 right-4 z-10 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                    Приватная
                  </div>
                )}
                <NoteCard note={note} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8 p-6 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800/50 rounded-lg">
        <h2 className="text-xl font-bold mb-2 text-yellow-800 dark:text-yellow-400">Инструкция по отладке</h2>
        <p className="mb-4">
          Если у вас возникают проблемы с отображением заметок, проверьте следующее:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Убедитесь, что в файле <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">.env.local</code> указаны корректные значения для GitHub.</li>
          <li>Проверьте, что директория <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{process.env.NOTES_PATH || 'notes'}</code> существует в вашем репозитории.</li>
          <li>Убедитесь, что токен GitHub имеет права на чтение содержимого репозитория.</li>
          <li>Формат заметок должен соответствовать требованиям: включать frontmatter с полем title и использовать Markdown для содержимого.</li>
        </ul>
      </div>
    </div>
  );
} 