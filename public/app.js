const API = "http://localhost:3000";

// ─── TOAST ───────────────────────────────────────────────
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = "toast"; }, 3000);
}

// ─── VALIDACIÓN ──────────────────────────────────────────
function setError(id, msg) {
  document.getElementById(id).textContent = msg;
}
function clearErrors() {
  ["err-usuario","err-tarea-titulo","err-tarea-usuario"].forEach(id => {
    document.getElementById(id).textContent = "";
  });
}

// ─── USUARIOS ────────────────────────────────────────────
async function crearUsuario() {
  clearErrors();
  const name = document.getElementById("userName").value.trim();
  if (!name) { setError("err-usuario", "El nombre no puede estar vacío."); return; }

  const res = await fetch(API + "/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  if (!res.ok) { setError("err-usuario", data.error); return; }

  document.getElementById("userName").value = "";
  showToast(`Usuario "${data.name}" creado.`);
  await cargarUsuarios();
}

async function cargarUsuarios() {
  const res = await fetch(API + "/users");
  const data = await res.json();

  // Lista visual
  const lista = document.getElementById("listaUsuarios");
  if (data.length === 0) {
    lista.innerHTML = `<li class="empty-state">Aún no hay usuarios registrados.</li>`;
  } else {
    lista.innerHTML = data.map(u => `
      <li>
        <span class="item-id">#${u.id}</span>
        <span class="item-text">${u.name}</span>
      </li>
    `).join("");
  }

  // Actualizar select del formulario de tareas
  const sel = document.getElementById("taskUser");
  const prev = sel.value;
  sel.innerHTML = `<option value="">— Seleccionar usuario —</option>` +
    data.map(u => `<option value="${u.id}">${u.name}</option>`).join("");
  if (prev) sel.value = prev;
}

// ─── TAREAS ──────────────────────────────────────────────
let editingId = null;

async function guardarTarea() {
  clearErrors();
  const title   = document.getElementById("taskTitle").value.trim();
  const user_id = document.getElementById("taskUser").value;
  let valid = true;

  if (!title) {
    setError("err-tarea-titulo", "El título no puede estar vacío.");
    valid = false;
  }
  if (!user_id) {
    setError("err-tarea-usuario", "Debes seleccionar un usuario.");
    valid = false;
  }
  if (!valid) return;

  const isEditing = editingId !== null;
  const url    = isEditing ? `${API}/tasks/${editingId}` : `${API}/tasks`;
  const method = isEditing ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, user_id })
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.error.includes("título")) setError("err-tarea-titulo", data.error);
    else setError("err-tarea-usuario", data.error);
    return;
  }

  showToast(isEditing ? `Tarea actualizada.` : `Tarea "${data.title}" creada.`);
  limpiarFormulario();
  await cargarTareas();
}

function editarTarea(id, title, user_id) {
  editingId = id;
  document.getElementById("taskTitle").value = title;
  document.getElementById("taskUser").value  = user_id;
  document.getElementById("btnCrearTarea").innerHTML = "✔ Guardar Cambios";
  document.getElementById("btnCancelarEdicion").style.display = "inline-flex";
  document.getElementById("panel-tareas").classList.add("editing-mode");
  document.getElementById("taskTitle").focus();
  showToast("Editando tarea #" + id, "info");
}

function cancelarEdicion() {
  limpiarFormulario();
  showToast("Edición cancelada.", "info");
}

function limpiarFormulario() {
  editingId = null;
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskUser").value  = "";
  document.getElementById("btnCrearTarea").innerHTML = "<span>+</span> Crear Tarea";
  document.getElementById("btnCancelarEdicion").style.display = "none";
  document.getElementById("panel-tareas").classList.remove("editing-mode");
  clearErrors();
}

async function eliminarTarea(id) {
  if (!confirm(`¿Eliminar la tarea #${id}?`)) return;
  const res = await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
  if (res.ok) {
    showToast(`Tarea #${id} eliminada.`, "error");
    await cargarTareas();
  }
}

async function cargarTareas() {
  const searchId   = document.getElementById("filtroId").value.trim();
  const searchName = document.getElementById("filtroNombre").value.trim();

  let url = API + "/tasks?";
  if (searchId)   url += `search_id=${encodeURIComponent(searchId)}&`;
  if (searchName) url += `search_name=${encodeURIComponent(searchName)}`;

  const res = await fetch(url);
  const data = await res.json();

  const lista = document.getElementById("listaTareas");
  if (!data.length) {
    lista.innerHTML = `<li class="empty-state">No se encontraron tareas.</li>`;
    return;
  }

  lista.innerHTML = data.map(t => `
    <li>
      <span class="item-id">#${t.id}</span>
      <span class="item-text">${t.title}</span>
      <span class="item-badge">${t.name}</span>
      <div class="item-actions">
        <button class="btn-icon edit" onclick="editarTarea(${t.id}, ${JSON.stringify(t.title)}, ${t.user_id})" title="Editar">✎</button>
        <button class="btn-icon delete" onclick="eliminarTarea(${t.id})" title="Eliminar">✕</button>
      </div>
    </li>
  `).join("");
}

function limpiarFiltros() {
  document.getElementById("filtroId").value = "";
  document.getElementById("filtroNombre").value = "";
  cargarTareas();
}

// ─── INIT ─────────────────────────────────────────────────
(async () => {
  await cargarUsuarios();
  await cargarTareas();
})();
