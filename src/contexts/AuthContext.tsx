import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'patient' | 'professional') => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'patient' | 'professional') => {
    // Mock authentication - replace with actual API call
    const mockUser: User = {
      id: '1',
      role,
      data: role === 'patient' 
        ? {
            _id: '1',
            nombre: 'Juan',
            apellido: 'Pérez',
            dni: '12345678',
            fecha_nacimiento: '1990-01-01',
            contacto: { email, telefono: '555-0123' },
            historia_clinica: [
              {
                fecha: '2024-01-15',
                diagnostico: 'Consulta general',
                tratamiento: 'Reposo y medicación'
              }
            ],
            profesional_asignado: 'prof-1',
            activo: true
          }
        : {
            _id: 'prof-1',
            nombre: 'Dra. María',
            apellido: 'González',
            especialidad: 'Medicina General',
            email,
            pacientes_ids: ['1'],
            activo: true
          }
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  // REGISTRO
  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al registrarse');
      }

      const data = await response.json();

      //Guardar sesión automáticamente tras registrarse
      //localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error('Error en register:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
