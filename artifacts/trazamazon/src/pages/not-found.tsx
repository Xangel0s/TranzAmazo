import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border-[#deded2] bg-[#fffdf8]">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-[#a66f31]" />
            <h1 className="text-2xl font-bold text-[#1b4332]">
              404 · Página no encontrada
            </h1>
          </div>

          <p className="mt-4 text-sm text-[#68746a]">
            No encontramos esta página. Vuelve al inicio y sigue explorando.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
