import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
}

type PresetValue = 'today' | 'last7days' | 'thisMonth' | 'lastMonth' | 'custom';

export const DateRangeFilter = ({ onDateRangeChange }: DateRangeFilterProps) => {
  const { language } = useLanguage();
  const [preset, setPreset] = useState<PresetValue>('thisMonth');
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd, setCustomEnd] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { value: 'today', labelEn: 'Today', labelAr: 'اليوم' },
    { value: 'last7days', labelEn: 'Last 7 Days', labelAr: 'آخر 7 أيام' },
    { value: 'thisMonth', labelEn: 'This Month', labelAr: 'هذا الشهر' },
    { value: 'lastMonth', labelEn: 'Last Month', labelAr: 'الشهر الماضي' },
    { value: 'custom', labelEn: 'Custom', labelAr: 'مخصص' },
  ];

  const handlePresetChange = (value: PresetValue) => {
    setPreset(value);
    const today = new Date();

    switch (value) {
      case 'today':
        onDateRangeChange(startOfDay(today), endOfDay(today));
        break;
      case 'last7days':
        onDateRangeChange(startOfDay(subDays(today, 7)), endOfDay(today));
        break;
      case 'thisMonth':
        onDateRangeChange(startOfMonth(today), endOfMonth(today));
        break;
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(today), 1);
        onDateRangeChange(startOfMonth(lastMonth), endOfMonth(lastMonth));
        break;
      case 'custom':
        // Don't apply filter yet, wait for custom selection
        break;
    }
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onDateRangeChange(startOfDay(customStart), endOfDay(customEnd));
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          {language === 'en' ? 'Date Range' : 'نطاق التاريخ'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-popover z-50" align="end">
        <div className="space-y-4">
          <Select value={preset} onValueChange={(v) => handlePresetChange(v as PresetValue)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {presets.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {language === 'en' ? p.labelEn : p.labelAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {preset === 'custom' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">{language === 'en' ? 'Start Date' : 'تاريخ البداية'}</p>
                <Calendar
                  mode="single"
                  selected={customStart}
                  onSelect={setCustomStart}
                  className={cn("p-3 pointer-events-auto border rounded-md")}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">{language === 'en' ? 'End Date' : 'تاريخ النهاية'}</p>
                <Calendar
                  mode="single"
                  selected={customEnd}
                  onSelect={setCustomEnd}
                  disabled={(date) => customStart ? date < customStart : false}
                  className={cn("p-3 pointer-events-auto border rounded-md")}
                />
              </div>
              <Button onClick={handleCustomApply} className="w-full" disabled={!customStart || !customEnd}>
                {language === 'en' ? 'Apply' : 'تطبيق'}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
