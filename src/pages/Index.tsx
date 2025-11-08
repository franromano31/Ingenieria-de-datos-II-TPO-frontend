import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, Calendar, FileText, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'patient' ? '/dashboard/patient' : '/dashboard/professional');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">VidaSana</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Iniciar Sesión
          </Button>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h2 className="text-5xl font-bold text-foreground mb-6">
              Sistema de Gestión Médica Integral
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Plataforma moderna para la gestión eficiente de pacientes, turnos e historias clínicas
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
                Comenzar Ahora
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Más Información
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h3 className="text-3xl font-bold text-center text-foreground mb-12">
              Características Principales
            </h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-card p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">Gestión de Turnos</h4>
                <p className="text-muted-foreground">
                  Sistema intuitivo para reservar y gestionar citas médicas
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">Historia Clínica</h4>
                <p className="text-muted-foreground">
                  Acceso completo al historial médico de cada paciente
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">Panel Profesional</h4>
                <p className="text-muted-foreground">
                  Herramientas completas para profesionales de la salud
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              ¿Listo para comenzar?
            </h3>
            <p className="text-xl text-muted-foreground mb-8">
              Únete a VidaSana y lleva la gestión médica al siguiente nivel
            </p>
            <Button size="lg" onClick={() => navigate('/auth')}>
              Crear Cuenta
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4 bg-card">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 VidaSana. Sistema de Gestión Médica.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
