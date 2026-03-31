import { Card, CardContent } from '@/components/ui/card';
import { BarChart2, Upload, Users, CheckCircle2 } from 'lucide-react';

export function ProjectInfo() {
  return (
    <Card className="mb-5">
      <CardContent className="pt-5 space-y-5 text-sm text-muted-foreground">

        {/* О проекте */}
        <div>
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            О проекте
          </h3>
          <p>
            «Мониторинг заболеваний» — это универсальный аналитический инструмент, который позволяет
            пользователям загружать собственные данные о любых инфекционных заболеваниях (гепатит B,
            ВИЧ, туберкулез, корь и другие) и получать наглядную аналитику в виде интерактивных
            графиков, таблиц и ключевых показателей.
          </p>
        </div>

        {/* Как это работает */}
        <div>
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Как это работает
          </h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Зарегистрируйтесь или войдите в личный кабинет.</li>
            <li>Загрузите свой файл с данными в формате CSV, Excel или JSON.</li>
            <li>Система автоматически определит структуру данных (страны, годы, показатели заболеваемости, смертности, вакцинации и др.) и построит графики.</li>
            <li>Вы получите готовый дашборд с визуализацией, фильтрами и возможностью скачать отчет.</li>
          </ol>
        </div>

        {/* Для кого этот сервис */}
        <div>
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Для кого этот сервис
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Исследователи и аналитики в области общественного здоровья</li>
            <li>Студенты медицинских и биологических специальностей</li>
            <li>Сотрудники организаций здравоохранения</li>
            <li>Все, кто хочет быстро визуализировать эпидемиологические данные</li>
          </ul>
        </div>

        {/* Что вы получите */}
        <div>
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Что вы получите
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Интерактивные графики (линейные, столбчатые, круговые, тепловые карты, древовидные карты)</li>
            <li>Ключевые показатели (общее число случаев, смертность, успешность лечения)</li>
            <li>Фильтры по годам, регионам, странам, уровням дохода</li>
            <li>Возможность скачать отчет в PDF и выгрузить данные в CSV</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}
