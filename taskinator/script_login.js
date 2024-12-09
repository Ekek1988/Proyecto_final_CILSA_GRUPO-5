// Evento para iniciar sesión
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username && password) {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (response.ok) {
        sessionStorage.setItem('token', result.token);  // Guardar el token
        sessionStorage.setItem('userId', result.userId);  // Guardar el userId
        window.location.href = 'tareas.html';  // Redirige al dashboard si el inicio de sesión es exitoso
      } else {
        alert(result.error || 'Error al iniciar sesión.');
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
    }
  } else {
    alert('Por favor, completa todos los campos.');
  }
});

// Evento para registrarse
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const newUser = document.getElementById('register-username').value.trim();
  const newPass = document.getElementById('register-password').value.trim();

  if (newUser && newPass) {
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUser, password: newPass }),
      });
      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (response.ok) {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
      } else {
        alert(result.error || 'Error al registrarse.');
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
    }
  } else {
    alert('Por favor, completa todos los campos.');
  }
});