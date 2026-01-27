import { useLanguage } from '@/contexts/LanguageContext';
import { AgentPerformanceData } from '@/hooks/useReportsData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface AgentPerformanceViewProps {
  data: AgentPerformanceData[];
  totals: {
    totalAgents: number;
    avgAchievement: number;
    avgProductivity: number;
    avgStrikeRate: number;
    totalVisits: number;
    totalInvoices: number;
  };
}

export function AgentPerformanceView({ data, totals }: AgentPerformanceViewProps) {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Active Agents' : 'المندوبين النشطين'}</p>
          <p className="text-2xl font-bold text-primary">{totals.totalAgents}</p>
        </div>
        <div className="rounded-xl bg-success/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Avg Achievement' : 'متوسط الإنجاز'}</p>
          <p className="text-2xl font-bold text-success">{totals.avgAchievement.toFixed(1)}%</p>
        </div>
        <div className="rounded-xl bg-info/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Avg Productivity' : 'متوسط الإنتاجية'}</p>
          <p className="text-2xl font-bold text-info">{totals.avgProductivity.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-warning/10 p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Avg Strike Rate' : 'معدل النجاح'}</p>
          <p className="text-2xl font-bold text-warning">{totals.avgStrikeRate.toFixed(1)}%</p>
        </div>
        <div className="rounded-xl bg-muted p-4">
          <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Visits' : 'إجمالي الزيارات'}</p>
          <p className="text-2xl font-bold">{totals.totalVisits}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === 'en' ? 'Agent' : 'المندوب'}</TableHead>
              <TableHead className="text-right">{language === 'en' ? 'Target' : 'الهدف'}</TableHead>
              <TableHead className="text-right">{language === 'en' ? 'Sales' : 'المبيعات'}</TableHead>
              <TableHead>{language === 'en' ? 'Achievement' : 'الإنجاز'}</TableHead>
              <TableHead className="text-center">{language === 'en' ? 'Visits' : 'الزيارات'}</TableHead>
              <TableHead className="text-center">{language === 'en' ? 'Invoices' : 'الفواتير'}</TableHead>
              <TableHead className="text-center">{language === 'en' ? 'Productivity' : 'الإنتاجية'}</TableHead>
              <TableHead className="text-center">{language === 'en' ? 'Strike Rate' : 'معدل النجاح'}</TableHead>
              <TableHead className="text-right">{language === 'en' ? 'Drop Size' : 'متوسط البيع'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {language === 'en' ? 'No agents found' : 'لا يوجد مندوبين'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.agentId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{row.agentName}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{row.monthlyTarget.toLocaleString()} ج.م</TableCell>
                  <TableCell className="text-right font-medium">{row.currentSales.toLocaleString()} ج.م</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.min(row.achievementPercent, 100)} 
                        className="h-2 w-20"
                      />
                      <span className={`text-sm font-medium ${row.achievementPercent >= 100 ? 'text-success' : row.achievementPercent >= 70 ? 'text-warning' : 'text-destructive'}`}>
                        {row.achievementPercent.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{row.totalVisits}</TableCell>
                  <TableCell className="text-center">{row.invoiceCount}</TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${row.productivity >= 0.5 ? 'text-success' : 'text-warning'}`}>
                      {row.productivity.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${row.strikeRate >= 50 ? 'text-success' : 'text-warning'}`}>
                      {row.strikeRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{row.dropSize.toLocaleString()} ج.م</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
