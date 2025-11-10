import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, LogOut, User, Clock } from 'lucide-react';
import { Paciente } from '@/types';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [motivo, setMotivo] = useState('');

  console.log("user en dashboard:", user);

  if (!user || user.role !== 'patient') {
    return <Navigate to="/auth" />;
  }

  const paciente = user as unknown as Paciente;
  console.log("Paciente en dashboard:", paciente);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !motivo.trim()) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    // Aquí se enviará al backend cuando esté conectado
    toast({
      title: "Turno reservado",
      description: `Turno solicitado para ${format(date, 'dd/MM/yyyy', { locale: es })} a las ${time}`,
    });
    
    setDialogOpen(false);
    setDate(undefined);
    setTime('');
    setMotivo('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{paciente.nombre} {paciente.apellido}</h2>
              <p className="text-sm text-muted-foreground">Paciente</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Panel del Paciente</h1>
          <p className="text-muted-foreground">Gestiona tu información médica y turnos</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Mis Turnos</CardTitle>
              </div>
              <CardDescription>Próximas citas médicas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-foreground">Consulta General</p>
                      <p className="text-sm text-muted-foreground">Dra. María González</p>
                    </div>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      Confirmado
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">15 de Marzo, 2024 - 10:00 AM</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Reservar Nuevo Turno
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Reservar Turno</DialogTitle>
                      <DialogDescription>
                        Complete los datos para solicitar un nuevo turno médico
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Fecha</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {date ? format(date, 'PPP', { locale: es }) : "Seleccione una fecha"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="time">Hora</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="time"
                              type="time"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="motivo">Motivo de la consulta</Label>
                          <Textarea
                            id="motivo"
                            placeholder="Describa brevemente el motivo de su consulta..."
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            className="min-h-[100px]"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Confirmar Turno
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <CardTitle>Historia Clínica</CardTitle>
              </div>
              <CardDescription>Historial de consultas y tratamientos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paciente.historia_clinica && paciente.historia_clinica.length > 0 ? (
                  paciente.historia_clinica.map((historia, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-foreground">{historia.diagnostico}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(historia.fecha).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      {historia.tratamiento && (
                        <p className="text-sm text-muted-foreground">{historia.tratamiento}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No hay registros en la historia clínica</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">DNI</dt>
                  <dd className="text-foreground">{paciente.dni}</dd>
                </div>
                {paciente.email && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="text-foreground">{paciente.email}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
