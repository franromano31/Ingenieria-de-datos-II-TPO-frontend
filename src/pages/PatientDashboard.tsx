import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, LogOut, User, Clock } from 'lucide-react';
import { Paciente } from '@/types';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Professional {
  _id: string;
  nombre: string;
  apellido: string;
  especialidad: string;
}

interface Turno {
  _id: string;
  paciente_id: string;
  profesional_id: string;
  fecha: string;
  motivo: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado';
  recordatorio_enviado: boolean;
}

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [motivo, setMotivo] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [professionalTurno, setProfessionalTurno] = useState<Professional>();

  useEffect(() => {
    // Fetch professionals once on mount so names are available when rendering turnos
    const fetchProfessionals = async () => {
      try {
        const response = await fetch('http://localhost:8000/profesionales');
        if (!response.ok) {
          throw new Error('Error al cargar profesionales');
        }
        const data = await response.json();
        setProfessionals(data);
      } catch (error) {
        console.error('Error fetching professionals:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los profesionales",
          variant: "destructive",
        });
      }
    };

    fetchProfessionals();
  }, []);

  useEffect(() => {
    const fetchTurnos = async () => {
      if (!user?._id) {
        console.log("No user ID available");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/turnos/paciente/${user._id}`);
        if (!response.ok) {
          throw new Error('Error al cargar turnos');
        }
        const data = await response.json();
        console.log("Raw API response:", data);
        
        // Always expect an array from the API
        if (!Array.isArray(data)) {
          console.error("Expected an array of turnos but got:", typeof data, data);
          setTurnos([]);
          return;
        }
        
        // Filter out any invalid entries and ensure they match our Turno interface
        const turnosArray = data.filter(turno => 
          turno && 
          typeof turno === 'object' &&
          '_id' in turno &&
          'paciente_id' in turno &&
          'profesional_id' in turno
        );
        
        console.log("Processed turnos array:", turnosArray, "Length:", turnosArray.length);
        setTurnos(turnosArray);
      } catch (error) {
        console.error('Error fetching turnos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los turnos",
          variant: "destructive",
        });
      }
    };

    fetchTurnos();
  }, [user]);

  if (!user || user.role !== 'patient') {
    return <Navigate to="/auth" />;
  }

  const paciente = user as unknown as Paciente;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form Data on Submit:', { selectedProfessionalId, date, time, motivo });
    
    if (!date || !time || !motivo.trim() || !selectedProfessionalId) {
      let missingFields = [];
      if (!selectedProfessionalId) missingFields.push('profesional');
      if (!date) missingFields.push('fecha');
      if (!time) missingFields.push('hora');
      if (!motivo.trim()) missingFields.push('motivo');
      
      toast({
        title: "Error",
        description: `Por favor complete los siguientes campos: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Log the form data for debugging
    console.log('Form Data:', {
      professionalId: selectedProfessionalId,
      date,
      time,
      motivo
    });

    // Build a local datetime from the selected date and time so the saved time
    // matches the user's selection regardless of the browser's timezone.
    const selectedDate = date as Date;
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Create a Date using local components (year, month, day, hours, minutes).
    const localDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes,
      0
    );

    // Format without timezone offset so backend receives the local datetime as entered by the user.
    const fechaLocal = format(localDateTime, "yyyy-MM-dd'T'HH:mm:ss");

    const turnoData = {
      paciente_id: user._id,
      profesional_id: selectedProfessionalId,
      fecha: fechaLocal,
      motivo,
      estado: "pendiente",
      recordatorio_enviado: false
    };

    try {
      const response = await fetch('http://localhost:8000/turnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(turnoData),
      });

      if (!response.ok) {
        throw new Error('Error al crear el turno');
      }

      // Actualizamos la lista de turnos
      const turnosResponse = await fetch(`http://localhost:8000/turnos/paciente/${user._id}`);
      const turnosActualizados = await turnosResponse.json();
      setTurnos(turnosActualizados);

      toast({
        title: "Turno reservado",
        description: `Turno solicitado para ${format(date, 'dd/MM/yyyy', { locale: es })} a las ${time}`,
      });
      
      setDialogOpen(false);
      setDate(undefined);
      setTime('');
      setMotivo('');
      setSelectedProfessionalId(undefined);
    } catch (error) {
      console.error('Error al crear el turno:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el turno",
        variant: "destructive",
      });
    }
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
                {turnos && turnos.length > 0 ? (
                  turnos.map((turno) => {
                    const professionalTurno = professionals.find(p => p._id === turno.profesional_id);
                    return (
                      <div key={turno._id} className="p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-foreground">{turno.motivo}</p>
                            <p className="text-sm text-muted-foreground">
                              {professionalTurno ? (
                                `${professionalTurno.nombre} ${professionalTurno.apellido}`
                              ) : (
                                `Profesional ID: ${turno.profesional_id}`
                              )}
                            </p>
                          </div>
                          <span className={cn(
                            "px-2 py-1 text-xs rounded-full",
                            turno.estado === 'confirmado' ? "bg-primary/10 text-primary" :
                            turno.estado === 'pendiente' ? "bg-yellow-500/10 text-yellow-500" :
                            "bg-destructive/10 text-destructive"
                          )}>
                            {turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(turno.fecha), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No hay turnos programados</p>
                )}
                <Dialog 
                  open={dialogOpen} 
                  onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                      setSelectedProfessionalId("");
                      setDate(undefined);
                      setTime('');
                      setMotivo('');
                    }
                  }}>
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
                          <Label htmlFor="professional">Profesional</Label>
                          <Select 
                            defaultValue={selectedProfessionalId}
                            onValueChange={(val) => {
                              console.log('Selected value:', val);
                              setSelectedProfessionalId(val);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un profesional" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {professionals.map((prof) => (
                                  <SelectItem 
                                    key={prof._id} 
                                    value={prof._id}
                                  >
                                    {`${prof.nombre} ${prof.apellido} - ${prof.especialidad}`}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

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
