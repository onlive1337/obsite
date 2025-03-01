import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 h-[70vh] flex items-center justify-center">
      <Card className="max-w-md w-full p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
          404
        </h1>
        <h2 className="text-xl mb-6">Страница не найдена</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Возможно, она была удалена или указан неверный адрес.
        </p>
        <div className="flex justify-center">
          <Link href="/">
            <Button>
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
} 