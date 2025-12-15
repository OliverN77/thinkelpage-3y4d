// ...existing code...

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
    
    // ✅ Recargar la página para reflejar cambios
    window.location.reload();
    
  } catch (err: any) {
    console.error('❌ Error al actualizar:', err)
    console.error('❌ Response:', err.response?.data)
    alert(err.message || "Error al actualizar el perfil")
  } finally {
    setLoading(false)
  }
}

// ...existing code...
