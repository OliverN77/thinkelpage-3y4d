import { useEffect, useState, useCallback } from 'react';
import type { User } from '../types';
import { getProfile } from '../services/auth.service';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 [useAuth] Token en localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      console.log('❌ [useAuth] No hay token, saltando petición');
      setLoading(false);
      return;
    }
    
    try {
      console.log('📡 [useAuth] Solicitando perfil...');
      const res = await getProfile();
      console.log('✅ [useAuth] Respuesta del perfil:', res);
      
      if (res.success && res.user) {
        // Convertir null a undefined para avatar
        const userData = {
          ...res.user,
          avatar: res.user.avatar || undefined
        };
        console.log('✅ [useAuth] Usuario cargado:', userData);
        setUser(userData);
      } else {
        console.log('❌ [useAuth] Respuesta sin éxito:', res);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      }
    } catch (err: any) {
      console.error('❌ [useAuth] Error al cargar perfil:', err.message);
      console.error('❌ [useAuth] Status:', err.response?.status);
      console.error('❌ [useAuth] Respuesta:', err.response?.data);
      console.error('❌ [useAuth] Headers enviados:', err.config?.headers);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 [useAuth] Iniciando carga de usuario...');
    fetchUser();

    // Escuchar evento de actualización de perfil
    const handleProfileUpdate = () => {
      console.log('🔄 [useAuth] Evento profile-updated detectado');
      fetchUser();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [fetchUser]);

  return { user, loading, refreshUser: fetchUser };
}
