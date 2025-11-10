import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Activity, Stethoscope } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'professional'>('patient');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (isLogin) {
        await login(email, password, role);
        toast({
          title: 'Inicio de sesión exitoso',
          description: `Bienvenido ${role === 'patient' ? 'paciente' : 'profesional'}`,
        });
        console.log('Navigating to dashboard...', role);
        navigate(role === 'patient' ? '/dashboard/patient' : '/dashboard/professional');
      }
    } catch (error: any) {
        toast({
          title: 'Error de autenticación',
          description: error.message || 'Credenciales incorrectas',
          variant: 'destructive',
        });
      }

      try {
        if (!isLogin) {
          const registrationData: any = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            email,
            password,
          };

          if (role === 'patient') {
            registrationData.dni = formData.get('dni');
          } else {
            registrationData.especialidad = formData.get('especialidad');
          }
          console.log('Registration Data:', registrationData);
          await register(registrationData);
          toast({
            title: 'Registro exitoso',
            description: 'Ahora puedes iniciar sesión con tus credenciales',
          });
          setIsLogin(true);
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Error al registrarse',
          variant: 'destructive',
        });
      }
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">VidaSana</h1>
            </div>
            <h2 className="text-4xl font-bold text-foreground">
              Sistema de Gestión Médica
            </h2>
            <p className="text-xl text-muted-foreground">
              Plataforma integral para la gestión de pacientes, turnos e historias clínicas
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Para Pacientes</h3>
                <p className="text-sm text-muted-foreground">Accede a tu historia clínica y reserva turnos fácilmente</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Para Profesionales</h3>
                <p className="text-sm text-muted-foreground">Gestiona tus pacientes y agenda de manera eficiente</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Ingresa tus credenciales para acceder' 
                : 'Crea una nueva cuenta en el sistema'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(v) => setRole(v as 'patient' | 'professional')} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patient" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Paciente
                </TabsTrigger>
                <TabsTrigger value="professional" className="gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Profesional
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input id="nombre" name="nombre" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input id="apellido" name="apellido" required />
                    </div>
                  </div>
                  {role === 'patient' && (
                    <div className="space-y-2">
                      <Label htmlFor="dni">DNI</Label>
                      <Input id="dni" name="dni" required />
                    </div>
                  )}
                  {role === 'professional' && (
                    <div className="space-y-2">
                      <Label htmlFor="especialidad">Especialidad</Label>
                      <Input id="especialidad" name="especialidad" required />
                    </div>
                  )}
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              <Button type="submit" className="w-full">
                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
