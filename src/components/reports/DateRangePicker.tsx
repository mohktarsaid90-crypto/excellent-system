import * as React from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { DateRange, DateRangePreset } from '@/hooks/useReportsData';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const presets: { key: DateRangePreset; label: { en: string; ar: string } }[] = [
  { key: 'today', label: { en: 'Today', ar: 'اليوم' } },
  { key: 'yesterday', label: { en: 'Yesterday', ar: 'أمس' } },
  { key: 'this_week', label: { en: 'This Week', ar: 'هذا الأسبوع' } },
  { key: 'this_month', label: { en: 'This Month', ar: 'هذا الشهر' } },
  { key: 'last_month', label: { en: 'Last Month', ar: 'الشهر الماضي' } },
  { key: 'this_year', label: { en: 'This Year', ar: 'هذا العام' } },
  { key: 'custom', label: { en: 'Custom Range', ar: 'نطاق مخصص' } },
];

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const { language } = useLanguage();
  const [selectedPreset, setSelectedPreset] = React.useState<DateRangePreset>('this_month');
  const locale = language === 'ar' ? ar : enUS;

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    const today = new Date();

    switch (preset) {
      case 'today':
        onDateRangeChange({ from: today, to: today });
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        onDateRangeChange({ from: yesterday, to: yesterday });
        break;
      case 'this_week':
        onDateRangeChange({ from: startOfWeek(today, { weekStartsOn: 0 }), to: endOfWeek(today, { weekStartsOn: 0 }) });
        break;
      case 'this_month':
        onDateRangeChange({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
      case 'last_month':
        const lastMonth = subMonths(today, 1);
        onDateRangeChange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
        break;
      case 'this_year':
        onDateRangeChange({ from: startOfYear(today), to: endOfYear(today) });
        break;
      case 'custom':
        // Keep current range for custom
        break;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <Select value={selectedPreset} onValueChange={(value) => handlePresetChange(value as DateRangePreset)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={language === 'en' ? 'Select period' : 'اختر الفترة'} />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.key} value={preset.key}>
              {preset.label[language]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPreset === 'custom' && (
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? format(dateRange.from, "PP", { locale }) : (language === 'en' ? 'From' : 'من')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => date && onDateRangeChange({ ...dateRange, from: date })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">→</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.to ? format(dateRange.to, "PP", { locale }) : (language === 'en' ? 'To' : 'إلى')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) => date && onDateRangeChange({ ...dateRange, to: date })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        {format(dateRange.from, "PP", { locale })} - {format(dateRange.to, "PP", { locale })}
      </div>
    </div>
  );
}
