"use client"

import type React from "react"
import { createPortal } from "react-dom"
import { useState, useRef, useEffect } from "react"
import type { FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "../../types"
import { X, UserIcon, Mail, Lock, Upload } from "lucide-react"
import { updateProfile } from "../../services/auth.service"

interface Props {
  open: boolean
  onClose: () => void
  user: User
}

export function SettingsModal({ open, onClose, user }: Props) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [username, setUsername] = useState(user.username || "")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState(user.bio || "")
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(
    user.avatar 
      ? (user.avatar.startsWith('http') 
          ? user.avatar 
          : `https://thinkel.onrender.com${user.avatar}`)
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
  )
  const [isDark, setIsDark] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }
    
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 5MB')
      return
    }
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }
    
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      
      console.log('🔍 Datos actuales del usuario:', user);
      console.log('🔍 Datos del formulario:', { name, username, bio });
      
      // ✅ Solo agregar campos que cambiaron
      if (name !== user.name) {
        console.log('✏️ Cambiando nombre de', user.name, 'a', name);
        formData.append("name", name)
      }
      if (username && username !== user.username) {
        console.log('✏️ Cambiando username de', user.username, 'a', username);
        formData.append("username", username)
      }
      if (bio !== user.bio) {
        console.log('✏️ Cambiando bio');
        formData.append("bio", bio)
      }
      if (password) {
        console.log('✏️ Cambiando contraseña');
        formData.append("password", password)
      }
      
      // ✅ Agregar avatar solo si se seleccionó uno nuevo
      if (fileRef.current?.files?.[0]) {
        console.log('📷 Agregando avatar:', fileRef.current.files[0].name);
        formData.append("avatar", fileRef.current.files[0])
      }

      console.log('📤 Enviando actualización de perfil...')
      
      // ✅ Llamar al servicio de actualización
      const response = await updateProfile(formData)
      
      console.log('✅ Perfil actualizado:', response)
      
      // ✅ Actualizar localStorage con los nuevos datos
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      alert("Perfil actualizado correctamente")
      
      // ✅ Disparar evento para refrescar el perfil
      window.dispatchEvent(new CustomEvent('profile-updated', { 
        detail: response.user 
      }));
      
      onClose()
      
      // ✅ Recargar la página para reflejar cambios
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (err: any) {
      console.error('❌ Error al actualizar:', err)
      console.error('❌ Response:', err.response?.data)
      alert(err.response?.data?.message || err.message || "Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className={`rounded-2xl shadow-2xl w-full max-w-md border transition-colors duration-300 ${
              isDark 
                ? "bg-[#011140]/95 border-gray-700" 
                : "bg-white/95 border-gray-300"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Ajustes de perfil
                </h2>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className={`hover:opacity-70 transition-opacity ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <img
                  src={preview}
                  alt={name || "Avatar"}
                  className={`w-24 h-24 rounded-full object-cover border-2 ${
                    isDark ? "border-blue-400" : "border-blue-600"
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
                  }}
                />
                <label className={`flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}>
                  <Upload className="w-4 h-4" />
                  Cambiar foto
                  <input 
                    ref={fileRef} 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" 
                    onChange={handleFile} 
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Nombre */}
              <div>
                <label className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Nombre
                </label>
                <div className="relative">
                  <UserIcon
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border outline-none transition-colors ${
                      isDark 
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-400" 
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Nombre de usuario
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    @
                  </span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="tunombredeusuario"
                    className={`w-full pl-8 pr-3 py-2 rounded-lg border outline-none transition-colors ${
                      isDark 
                        ? "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-400" 
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Correo
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="email"
                    value={email}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border outline-none transition-colors ${
                      isDark 
                        ? "bg-gray-800/50 border-gray-600 text-white focus:border-blue-400" 
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500"
                    }`}
                    disabled
                  />
                </div>
                <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  El email no se puede cambiar
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Biografía
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                  maxLength={500}
                  className={`w-full px-3 py-2 rounded-lg border outline-none transition-colors resize-none ${
                    isDark 
                      ? "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-400" 
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  }`}
                />
                <p className={`text-xs mt-1 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}>
                  {bio.length}/500 caracteres
                </p>
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Nueva contraseña (opcional)
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Dejar vacío para mantener la actual"
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border outline-none transition-colors ${
                      isDark 
                        ? "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-400" 
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg font-medium transition-all ${
                  loading 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:scale-105 active:scale-95"
                } ${
                  isDark 
                    ? "bg-blue-500 hover:bg-blue-600 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}
