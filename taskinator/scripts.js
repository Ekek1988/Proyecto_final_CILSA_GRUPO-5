// ------- FUNCIONES DE LOGIN --------
/**
 * Función para iniciar sesión.
 * Envía los datos de usuario y contraseña al servidor y guarda el ID del usuario en sessionStorage.
 */
 console.log('userId guardado en sessionStorage:', sessionStorage.getItem('userId'));
 async function login(username, password) {
  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (response.ok) {
    // Guardamos el userId en sessionStorage
    sessionStorage.setItem('userId', data.userId);
    // Guardamos el token en sessionStorage
    sessionStorage.setItem('token', data.token);
    // Mostrar el nombre de usuario o cambiar la interfaz
    document.getElementById('user-account').textContent = username;
    alert('Inicio de sesión exitoso');
  } else {
    alert('Credenciales incorrectas');
  }
}

/**
 * Muestra la información del usuario decodificada del token almacenado en sessionStorage.
 */
function showUserInfo() {
  const token = sessionStorage.getItem('token');
  if (token) {
    const decoded = decodeToken(token);
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = decoded.username;
    } else {
      console.error('El elemento #user-name no se encontró en el DOM');
    }
  }
}

/**
 * Decodifica un token JWT para obtener la información del usuario.
 */
function decodeToken(token) {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}

// Mostrar la información del usuario al cargar la página
window.addEventListener('DOMContentLoaded', showUserInfo);

// ------- FUNCION PARA MOVER UNA TAREA --------
/**
 * Mueve una tarea a una columna específica en el tablero.
 */
 async function moveTaskTo(columnId, taskId) {
  const task = document.getElementById(taskId);
  const targetColumn = document.getElementById(columnId);

  if (task && targetColumn) {
    targetColumn.appendChild(task);

    // Asignar el nuevo estado de acuerdo a la columna
    let newStatus = '';
    switch (columnId) {
      case 'tasks-in-progress':
        newStatus = 'En Proceso';
        break;
      case 'tasks-completed':
        newStatus = 'Realizada';
        break;
      case 'tasks-archived':
        newStatus = 'Dada de Baja';
        break;
      case 'tasks-pending':
        newStatus = 'Pendiente';
        break;
    }

    // Enviar la solicitud al backend para actualizar el estado de la tarea
    try {
      const response = await fetch(`/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Estado de la tarea actualizado:', data.message);
      } else {
        console.error('Error al actualizar estado:', data.error);
      }
    } catch (error) {
      console.error('Error al enviar solicitud de actualización:', error);
    }
  } else {
    console.error('Error: tarea o columna destino no encontrada');
  }
}


// ------- FUNCION PARA CREAR UNA TAREA --------
/**
 * Crea una nueva tarea y la agrega al tablero.
 * También la envía a la base de datos.
 */
 async function createTask(title, category, description) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Debes iniciar sesión para realizar esta acción');
    window.location.href = 'login.html';
    return;
  }

  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    alert('No se ha encontrado el userId. Asegúrate de haber iniciado sesión.');
    return;
  }

  // Crear el objeto tarea
  const newTask = {
    userId: userId,   // Ahora usamos el userId obtenido de sessionStorage
    title: title,     // Se pasan los parámetros de la función correctamente
    category: category,
    description: description,
    status: 'Pendiente' // El estado lo puedes dejar estático o agregarlo como parámetro también
  };

  // Verificar en consola el objeto que vamos a enviar
  console.log('Tarea a crear:', newTask);

  // Enviar la tarea a la base de datos
  const response = await fetch('http://127.0.0.1:3000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(newTask)
  });

  if (!response.ok) {
    console.error('Error al guardar la tarea en la base de datos');
    return;
  }

  const savedTask = await response.json();
  const taskId = savedTask.id;

  // Crear el elemento de tarea en la interfaz
  const taskCard = document.createElement('div');
  taskCard.classList.add('task-card', 'card', 'p-2', 'mb-3');
  taskCard.setAttribute('id', taskId);

  // Contenido de la tarea
  const taskTitle = document.createElement('h6');
  taskTitle.textContent = title;

  const taskCategory = document.createElement('p');
  taskCategory.textContent = category;
  taskCategory.classList.add('task-category', 'text-muted', 'small');

  const taskDescription = document.createElement('p');
  taskDescription.textContent = description;

  // Botón de opciones
  const optionsButton = document.createElement('button');
  optionsButton.classList.add('btn', 'btn-sm', 'btn-secondary', 'dropdown-toggle', 'float-end');
  optionsButton.setAttribute('data-bs-toggle', 'dropdown');
  optionsButton.setAttribute('aria-expanded', 'false');
  optionsButton.textContent = '...';

  // Menú desplegable
  const dropdownMenu = document.createElement('ul');
  dropdownMenu.classList.add('dropdown-menu');
  dropdownMenu.innerHTML = `
    <li><a class="dropdown-item" href="#" onclick="moveTaskTo('tasks-in-progress', '${taskId}')">Mover a En Proceso</a></li>
    <li><a class="dropdown-item" href="#" onclick="moveTaskTo('tasks-completed', '${taskId}')">Mover a Realizadas</a></li>
    <li><a class="dropdown-item" href="#" onclick="moveTaskTo('tasks-archived', '${taskId}')">Mover a Dadas de Baja</a></li>
    <li><a class="dropdown-item" href="#" onclick="moveTaskTo('tasks-pending', '${taskId}')">Mover a Pendientes</a></li>
    <li><a class="dropdown-item" href="#" onclick="editTask('${taskId}')">Editar</a></li>
    <li><a class="dropdown-item" href="#" onclick="deleteTask('${taskId}')">Eliminar</a></li>
  `;

  // Estructura final
  taskCard.appendChild(taskTitle);
  taskCard.appendChild(taskCategory);
  taskCard.appendChild(taskDescription);
  taskCard.appendChild(optionsButton);
  taskCard.appendChild(dropdownMenu);

  
  document.getElementById('tasks-pending').appendChild(taskCard); // Agregar a Tareas Pendientes
}

// ------- FUNCION PARA ELIMINAR UNA TAREA --------
/**
 * Elimina una tarea del tablero.
 */
function deleteTask(taskId) {
  const task = document.getElementById(taskId);
  if (task) {
    task.remove();
    console.log(`Tarea ${taskId} eliminada`);
  } else {
    console.error('No se encontró la tarea a eliminar');
  }
}

// ------- FUNCION PARA EDITAR UNA TAREA --------
/**
 * Permite editar una tarea existente abriendo el modal con los datos prellenados.
 */
function editTask(taskId) {
  const task = document.getElementById(taskId);
  if (!task) {
    console.error('No se encontró la tarea a editar');
    return;
  }

  // Extraer los datos de la tarea
  const title = task.querySelector('h6').textContent;
  const category = task.querySelector('.task-category').textContent;
  const description = task.querySelector('p:nth-child(3)').textContent;

  // Prellenar el modal con los datos existentes
  document.getElementById('task-title').value = title;
  document.getElementById('task-category').value = category;
  document.getElementById('task-desc').value = description;

  // Guardar el ID de la tarea en un atributo del modal
  document.getElementById('taskModal').setAttribute('data-task-id', taskId);

  // Mostrar el modal
  const modal = new bootstrap.Modal(document.getElementById('taskModal'));
  modal.show();
}

// ------- EVENTOS DE INTERFAZ --------
/**
 * Abre el modal para crear o editar una tarea.
 */
document.getElementById('floating-button').addEventListener('click', () => {
  const modal = new bootstrap.Modal(document.getElementById('taskModal'));
  modal.show();
});

/**
 * Guarda los cambios o crea una nueva tarea al guardar desde el modal.
 */
document.getElementById('save-task').addEventListener('click', async () => {
  const title = document.getElementById('task-title').value;
  const category = document.getElementById('task-category').value;
  const description = document.getElementById('task-desc').value;

  if (!title || !category) {
    alert('Por favor completa todos los campos requeridos.');
    return;
  }

  const taskModal = document.getElementById('taskModal');
  const taskId = taskModal.getAttribute('data-task-id');

  if (taskId) {
    // Editar tarea existente
    const task = document.getElementById(taskId);
    if (task) {
      task.querySelector('h6').textContent = title;
      task.querySelector('.task-category').textContent = category;
      task.querySelector('p:nth-child(3)').textContent = description;
      console.log(`Tarea ${taskId} actualizada`);
    } else {
      console.error('No se encontró la tarea a actualizar');
    }
    taskModal.removeAttribute('data-task-id'); // Limpiar el atributo
  } else {
    // Crear nueva tarea
    await createTask(title, category, description);
  }

  // Cerrar el modal
  const modal = bootstrap.Modal.getInstance(taskModal);
  modal.hide();
});
