import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Stethoscope, LogOut } from 'lucide-react';
import { Profesional } from '@/types';
import { useState, useEffect } from 'react';

const ProfessionalDashboard = () => {
  const { user, logout } = useAuth();

  if (!user || user.role !== 'professional') {
    return <Navigate to="/auth" />;
  }

  // Extract profesional data from user (may be in user.data or directly in user)
  const profesional = ((user as any).data || (user as any)) as Profesional | undefined;

  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsWithPatients, setAppointmentsWithPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profesional?._id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/turnos/profesional/${profesional._id}`);
        if (!response.ok) {
          throw new Error('Error al cargar turnos');
        }
        const data = await response.json();
        console.log('Turnos fetched:', data);
        
        // Handle both array and single object response
        const turnosArray = Array.isArray(data) ? data : [data];
        setAppointments(turnosArray);

        // Fetch patient details for each turno
        const appointmentsWithDetails = await Promise.all(
          turnosArray.map(async (turno) => {
            try {
              const pacienteResponse = await fetch(`http://localhost:8000/pacientes/${turno.paciente_id}`);
              if (pacienteResponse.ok) {
                const paciente = await pacienteResponse.json();
                return { ...turno, paciente };
              }
              return turno;
            } catch (error) {
              console.error('Error fetching paciente:', error);
              return turno;
            }
          })
        );

        console.log('Appointments with patients:', appointmentsWithDetails);
        setAppointmentsWithPatients(appointmentsWithDetails);
      } catch (error) {
        console.error('Error fetching turnos:', error);
        setAppointments([]);
        setAppointmentsWithPatients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [profesional?._id]);

  const handleUpdateAppointment = async (appointmentId: string, newStatus: 'confirmado' | 'cancelado') => {
    try {
      const response = await fetch(`http://localhost:8000/turnos/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar turno');
      }

      // Update local state
      setAppointmentsWithPatients(prev =>
        prev.map(apt =>
          apt._id === appointmentId ? { ...apt, estado: newStatus } : apt
        )
      );

      console.log(`Turno ${appointmentId} actualizado a ${newStatus}`);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{profesional?.nombre ?? 'Profesional'} {profesional?.apellido ?? ''}</h2>
              <p className="text-sm text-muted-foreground">{profesional?.especialidad ?? ''}</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Panel del Profesional</h1>
          <p className="text-muted-foreground">Gestiona tus pacientes y agenda</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-foreground">
                  {profesional?.pacientes_ids?.length ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Turnos Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-8 w-8 text-accent" />
                <span className="text-3xl font-bold text-foreground">
                  {appointments.filter(a => {
                    const today = new Date().toISOString().split('T')[0];
                    return a.fecha.startsWith(today);
                  }).length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Turnos Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-foreground">
                  {appointments.filter(a => a.estado === 'pendiente').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Próximos Turnos</CardTitle>
              </div>
              <CardDescription>Agenda de los próximos días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  <p className="text-muted-foreground text-sm text-center py-4">Cargando turnos...</p>
                ) : appointmentsWithPatients.length > 0 ? (
                  appointmentsWithPatients.map((appointment) => (
                    <div key={appointment._id} className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{appointment.motivo}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.paciente ? (
                              `${appointment.paciente.nombre} ${appointment.paciente.apellido}`
                            ) : (
                              `Paciente ID: ${appointment.paciente_id}`
                            )}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.estado === 'confirmado' 
                            ? 'bg-accent/10 text-accent' 
                            : appointment.estado === 'pendiente'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {appointment.estado}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.fecha).toLocaleDateString('es-ES')}
                      </p>
                      {appointment.estado === 'pendiente' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleUpdateAppointment(appointment._id, 'confirmado')}
                            className="flex-1"
                          >
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateAppointment(appointment._id, 'cancelado')}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No hay turnos programados</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                <CardTitle>Pacientes Recientes</CardTitle>
              </div>
              <CardDescription>Últimos pacientes atendidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Juan Pérez</p>
                      <p className="text-sm text-muted-foreground">DNI: 12345678</p>
                      <p className="text-xs text-muted-foreground mt-1">Última visita: 12/03/2024</p>
                    </div>
                    <Button size="sm" variant="outline">Ver</Button>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Ana García</p>
                      <p className="text-sm text-muted-foreground">DNI: 87654321</p>
                      <p className="text-xs text-muted-foreground mt-1">Última visita: 10/03/2024</p>
                    </div>
                    <Button size="sm" variant="outline">Ver</Button>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Ver Todos los Pacientes
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;
