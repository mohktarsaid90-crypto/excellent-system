import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAgents,
  useCreateAgent,
  useUpdateAgentPermissions,
  useToggleAgentStatus,
  useUpdateAgentCreditBalance,
  useUpdateAgentTargets,
} from '@/hooks/useAgents';
import {
  UserPlus,
  Search,
  Power,
  Settings2,
  Target,
  Percent,
  UserPlus2,
  RotateCcw,
  Loader2,
  MapPin,
  Wallet,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AgentManagement = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { hasPermission } = useAuth();
  const { data: agents, isLoading } = useAgents();
  const createAgent = useCreateAgent();
  const updatePermissions = useUpdateAgentPermissions();
  const toggleStatus = useToggleAgentStatus();
  const updateCreditBalance = useUpdateAgentCreditBalance();
  const updateTargets = useUpdateAgentTargets();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [targetValues, setTargetValues] = useState({
    monthly_target: 0,
    cartons_target: 0,
    tons_target: 0,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    monthly_target: 0,
    cartons_target: 0,
    tons_target: 0,
  });

  // Auto-generate email and password when name changes
  const handleNameChange = (name: string) => {
    const sanitizedName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    const generatedEmail = sanitizedName ? `${sanitizedName}@mano.com` : '';
    const generatedPassword = sanitizedName ? `${sanitizedName}123` : '';
    setNewAgent({
      ...newAgent,
      name,
      email: generatedEmail,
      password: generatedPassword,
    });
  };

  const canManageAgents = hasPermission(['it_admin', 'sales_manager']);

  const filteredAgents = agents?.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateAgent = async () => {
    if (!newAgent.password || newAgent.password.length < 6) {
      return;
    }
    await createAgent.mutateAsync(newAgent);
    setIsAddDialogOpen(false);
    setNewAgent({ name: '', email: '', password: '', phone: '', monthly_target: 0, cartons_target: 0, tons_target: 0 });
  };

  const handleTogglePermission = async (
    agentId: string,
    permission: 'can_give_discounts' | 'can_add_clients' | 'can_process_returns',
    currentValue: boolean
  ) => {
    await updatePermissions.mutateAsync({
      id: agentId,
      [permission]: !currentValue,
    });
  };

  const handleKillSwitch = async (agentId: string, currentStatus: boolean) => {
    await toggleStatus.mutateAsync({ id: agentId, is_active: !currentStatus });
  };

  const handleUpdateCreditBalance = async () => {
    if (!selectedAgent) return;
    await updateCreditBalance.mutateAsync({
      id: selectedAgent.id,
      credit_balance: creditAmount,
    });
    setIsCreditDialogOpen(false);
    setSelectedAgent(null);
  };

  const handleUpdateTargets = async () => {
    if (!selectedAgent) return;
    await updateTargets.mutateAsync({
      id: selectedAgent.id,
      monthly_target: targetValues.monthly_target,
      cartons_target: targetValues.cartons_target,
      tons_target: targetValues.tons_target,
    });
    setIsTargetDialogOpen(false);
    setSelectedAgent(null);
  };

  const openCreditDialog = (agent: any) => {
    setSelectedAgent(agent);
    setCreditAmount(agent.credit_balance || 0);
    setIsCreditDialogOpen(true);
  };

  const openTargetDialog = (agent: any) => {
    setSelectedAgent(agent);
    setTargetValues({
      monthly_target: agent.monthly_target || 0,
      cartons_target: agent.cartons_target || 0,
      tons_target: agent.tons_target || 0,
    });
    setIsTargetDialogOpen(true);
  };

  const getPerformanceColor = (current: number, target: number) => {
    if (target === 0) return 'text-muted-foreground';
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'text-success';
    if (percentage >= 75) return 'text-primary';
    if (percentage >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {language === 'en' ? 'Agent Management' : 'إدارة المندوبين'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Manage field agents, permissions, and performance'
                : 'إدارة المندوبين الميدانيين والصلاحيات والأداء'}
            </p>
          </div>

          {canManageAgents && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  {language === 'en' ? 'Add Agent' : 'إضافة مندوب'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'en' ? 'Create New Agent' : 'إنشاء مندوب جديد'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Name' : 'الاسم'}</Label>
                    <Input
                      value={newAgent.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder={language === 'en' ? 'Agent name' : 'اسم المندوب'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Email (Login)' : 'البريد الإلكتروني (تسجيل الدخول)'}</Label>
                    <Input
                      type="email"
                      value={newAgent.email}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, email: e.target.value })
                      }
                      placeholder="agent@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Password (Mobile App)' : 'كلمة المرور (التطبيق)'}</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={newAgent.password}
                        onChange={(e) =>
                          setNewAgent({ ...newAgent, password: e.target.value })
                        }
                        placeholder={language === 'en' ? 'Min 6 characters' : 'الحد الأدنى 6 أحرف'}
                        className={cn(isRTL ? 'pl-10' : 'pr-10')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("absolute top-0 h-full", isRTL ? 'left-0' : 'right-0')}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' 
                        ? 'This will be the agent\'s login credentials for the mobile app'
                        : 'ستكون هذه بيانات دخول المندوب للتطبيق'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Phone' : 'الهاتف'}</Label>
                    <Input
                      value={newAgent.phone}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, phone: e.target.value })
                      }
                      placeholder="+966 50 XXX XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Value Target (EGP)' : 'الهدف القيمي (ج.م)'}</Label>
                    <Input
                      type="number"
                      value={newAgent.monthly_target}
                      onChange={(e) =>
                        setNewAgent({
                          ...newAgent,
                          monthly_target: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'en' ? 'Cartons Target' : 'هدف الكراتين'}</Label>
                      <Input
                        type="number"
                        value={newAgent.cartons_target}
                        onChange={(e) =>
                          setNewAgent({
                            ...newAgent,
                            cartons_target: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'en' ? 'Tons Target' : 'هدف الأطنان'}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newAgent.tons_target}
                        onChange={(e) =>
                          setNewAgent({
                            ...newAgent,
                            tons_target: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateAgent}
                    className="w-full"
                    disabled={createAgent.isPending || !newAgent.password || newAgent.password.length < 6}
                  >
                    {createAgent.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : language === 'en' ? (
                      'Create Agent'
                    ) : (
                      'إنشاء المندوب'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Total Agents' : 'إجمالي المندوبين'}
                  </p>
                  <p className="text-2xl font-bold">{agents?.length || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Active' : 'نشط'}
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {agents?.filter((a) => a.is_active).length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Power className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Online Now' : 'متصل الآن'}
                  </p>
                  <p className="text-2xl font-bold text-info">
                    {agents?.filter((a) => a.is_online).length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Total Credit Balance' : 'إجمالي رصيد الآجل'}
                  </p>
                  <p className="text-2xl font-bold text-warning">
                    {agents?.reduce((sum, a) => sum + (a.credit_balance || 0), 0).toLocaleString() || 0} EGP
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              placeholder={language === 'en' ? 'Search agents...' : 'البحث عن مندوب...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("bg-card", isRTL ? "pr-10" : "pl-10")}
            />
          </div>
        </div>

        {/* Agents Table */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              {language === 'en' ? 'Agents & Permissions' : 'المندوبين والصلاحيات'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAgents?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'en' ? 'No agents found' : 'لا يوجد مندوبين'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'en' ? 'Agent' : 'المندوب'}</TableHead>
                      <TableHead>{language === 'en' ? 'Status' : 'الحالة'}</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Target className="h-4 w-4" />
                          {language === 'en' ? 'Target' : 'الهدف'}
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Wallet className="h-4 w-4" />
                          {language === 'en' ? 'Credit' : 'رصيد الآجل'}
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Percent className="h-4 w-4" />
                          {language === 'en' ? 'Discounts' : 'الخصومات'}
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <UserPlus2 className="h-4 w-4" />
                          {language === 'en' ? 'Add Clients' : 'إضافة عملاء'}
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <RotateCcw className="h-4 w-4" />
                          {language === 'en' ? 'Returns' : 'المرتجعات'}
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Power className="h-4 w-4" />
                          {language === 'en' ? 'Kill Switch' : 'إيقاف'}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgents?.map((agent) => (
                      <TableRow key={agent.id} className={!agent.is_active ? 'opacity-50' : ''}>
                        <TableCell>
                          <div
                            onClick={() => navigate(`/agents/${agent.id}`)}
                            className="cursor-pointer hover:text-primary transition-colors"
                          >
                            <p className="font-medium hover:underline">{agent.name}</p>
                            <p className="text-sm text-muted-foreground">{agent.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {agent.is_active ? (
                              <>
                                <span className={cn(
                                  "h-2 w-2 rounded-full",
                                  agent.is_online ? "bg-success animate-pulse" : "bg-muted-foreground"
                                )} />
                                <Badge variant={agent.is_online ? "default" : "secondary"}>
                                  {agent.is_online
                                    ? (language === 'en' ? 'Online' : 'متصل')
                                    : (language === 'en' ? 'Offline' : 'غير متصل')}
                                </Badge>
                              </>
                            ) : (
                              <Badge variant="destructive">
                                {language === 'en' ? 'Deactivated' : 'معطل'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTargetDialog(agent)}
                            disabled={!canManageAgents}
                            className="hover:bg-primary/10"
                          >
                            <div className="space-y-1">
                              <p className={cn("font-medium", getPerformanceColor(Number(agent.current_sales), Number(agent.monthly_target)))}>
                                {Number(agent.current_sales).toLocaleString()} EGP
                              </p>
                              <p className="text-xs text-muted-foreground">
                                / {Number(agent.monthly_target).toLocaleString()} EGP
                              </p>
                            </div>
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCreditDialog(agent)}
                            disabled={!canManageAgents}
                            className="text-warning hover:text-warning"
                          >
                            {Number(agent.credit_balance || 0).toLocaleString()} EGP
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={agent.can_give_discounts}
                            onCheckedChange={() =>
                              handleTogglePermission(agent.id, 'can_give_discounts', agent.can_give_discounts)
                            }
                            disabled={!canManageAgents || !agent.is_active}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={agent.can_add_clients}
                            onCheckedChange={() =>
                              handleTogglePermission(agent.id, 'can_add_clients', agent.can_add_clients)
                            }
                            disabled={!canManageAgents || !agent.is_active}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={agent.can_process_returns}
                            onCheckedChange={() =>
                              handleTogglePermission(agent.id, 'can_process_returns', agent.can_process_returns)
                            }
                            disabled={!canManageAgents || !agent.is_active}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={agent.is_active ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() => handleKillSwitch(agent.id, agent.is_active)}
                            disabled={!canManageAgents}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credit Balance Dialog */}
      <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Update Credit Balance' : 'تحديث رصيد الآجل'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? `Updating credit balance for: ${selectedAgent?.name}`
                : `تحديث رصيد الآجل لـ: ${selectedAgent?.name}`}
            </p>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Credit Balance (EGP)' : 'رصيد الآجل (ج.م)'}</Label>
              <Input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <Button
              onClick={handleUpdateCreditBalance}
              className="w-full"
              disabled={updateCreditBalance.isPending}
            >
              {updateCreditBalance.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : language === 'en' ? (
                'Update Balance'
              ) : (
                'تحديث الرصيد'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Target Settings Dialog */}
      <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Set Agent Targets' : 'تحديد أهداف المندوب'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? `Setting targets for: ${selectedAgent?.name}`
                : `تحديد الأهداف لـ: ${selectedAgent?.name}`}
            </p>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Value Target (EGP)' : 'الهدف القيمي (ج.م)'}</Label>
              <Input
                type="number"
                value={targetValues.monthly_target}
                onChange={(e) => setTargetValues({ ...targetValues, monthly_target: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Cartons Target' : 'هدف الكراتين'}</Label>
              <Input
                type="number"
                value={targetValues.cartons_target}
                onChange={(e) => setTargetValues({ ...targetValues, cartons_target: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Tons Target' : 'هدف الأطنان'}</Label>
              <Input
                type="number"
                step="0.01"
                value={targetValues.tons_target}
                onChange={(e) => setTargetValues({ ...targetValues, tons_target: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <Button
              onClick={handleUpdateTargets}
              className="w-full"
              disabled={updateTargets.isPending}
            >
              {updateTargets.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : language === 'en' ? (
                'Save Targets'
              ) : (
                'حفظ الأهداف'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AgentManagement;
