import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Stethoscope, LogOut } from 'lucide-react';
import { Profesional } from '@/types';

const ProfessionalDashboard = () => {
  const { user, logout } = useAuth();

  if (!user || user.role !== 'professional') {
    return <Navigate to="/auth" />;
  }

  const profesional = user.data as Profesional;

  // Mock data for appointments
  const appointments = [
    {
      id: '1',
      paciente: 'Juan Pérez',
      fecha: '2024-03-15',
      hora: '10:00',
      motivo: 'Consulta general',
      estado: 'confirmado'
    },
    {
      id: '2',
      paciente: 'Ana García',
      fecha: '2024-03-15',
      hora: '11:30',
      motivo: 'Control de presión',
      estado: 'pendiente'
    },
    {
      id: '3',
      paciente: 'Carlos Rodríguez',
      fecha: '2024-03-16',
      hora: '09:00',
      motivo: 'Resultados de estudios',
      estado: 'confirmado'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{profesional.nombre} {profesional.apellido}</h2>
              <p className="text-sm text-muted-foreground">{profesional.especialidad}</p>
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
                  {profesional.pacientes_ids?.length || 0}
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
                <span className="text-3xl font-bold text-foreground">2</span>
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
                <span className="text-3xl font-bold text-foreground">1</span>
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
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{appointment.paciente}</p>
                        <p className="text-sm text-muted-foreground">{appointment.motivo}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        appointment.estado === 'confirmado' 
                          ? 'bg-accent/10 text-accent' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {appointment.estado}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.fecha).toLocaleDateString('es-ES')} - {appointment.hora}
                    </p>
                  </div>
                ))}
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
