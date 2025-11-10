export type UserRole = 'patient' | 'professional';

export interface HistoriaClinica {
  fecha: string;
  diagnostico: string;
  tratamiento?: string;
}

export interface Paciente {
  _id?: string;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  historia_clinica?: HistoriaClinica[];
  profesional_asignado?: string;
}

export interface Profesional {
  _id?: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  email: string;
  pacientes_ids?: string[];
  activo: boolean;
}

export interface Turno {
  _id?: string;
  paciente_id: string;
  profesional_id: string;
  fecha: string;
  motivo?: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  recordatorio_enviado: boolean;
}

export interface User {
  id: string;
  role: UserRole;
  data: Paciente | Profesional;
}
