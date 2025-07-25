let modelos = JSON.parse(localStorage.getItem('modelos')) || [];
let horarios = JSON.parse(localStorage.getItem('horarios')) || [];
let tokens = JSON.parse(localStorage.getItem('tokens')) || [];

function guardarDatos() {
  localStorage.setItem('modelos', JSON.stringify(modelos));
  localStorage.setItem('horarios', JSON.stringify(horarios));
  localStorage.setItem('tokens', JSON.stringify(tokens));
  actualizarSelects();
}

function cambiarPestana(p) {
  document.querySelectorAll('.pestana').forEach(tab => tab.classList.add('hidden'));
  document.getElementById(`pestana-${p}`).classList.remove('hidden');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('bg-blue-600', 'text-white'));
  event.target.classList.add('bg-blue-600', 'text-white');
  if (p === 'dashboard') actualizarDashboard();
  if (p === 'horario') renderHorarios();
  if (p === 'tokens') renderTokens();
  if (p === 'modelos') renderModelos();
}

function agregarModelo() {
  const nombre = document.getElementById('nombreModelo').value.trim();
  const paginas = document.getElementById('paginasModelo').value.trim();
  if (!nombre) return;
  const existe = modelos.find(m => m.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe) {
    existe.paginas = paginas;
  } else {
    modelos.push({ nombre, paginas });
  }
  guardarDatos();
  document.getElementById('nombreModelo').value = '';
  document.getElementById('paginasModelo').value = '';
  renderModelos();
}

function eliminarModelo(nombre) {
  modelos = modelos.filter(m => m.nombre !== nombre);
  guardarDatos();
  renderModelos();
}

function renderModelos() {
  const tbody = document.getElementById('tablaModelos');
  tbody.innerHTML = '';
  const buscar = document.getElementById('buscarModelo').value.toLowerCase();
  const fInicio = document.getElementById('filtroFechaInicio').value;
  const fFin = document.getElementById('filtroFechaFin').value;
  modelos.forEach(m => {
    if (buscar && !m.nombre.toLowerCase().includes(buscar)) return;

    const registrosHorario = horarios.filter(h => h.nombre === m.nombre);
    const registrosToken = tokens.filter(t => t.nombre === m.nombre);

    const dentroDeRango = (fecha) => {
      if (fInicio && new Date(fecha) < new Date(fInicio)) return false;
      if (fFin && new Date(fecha) > new Date(fFin)) return false;
      return true;
    };

    const totalHoras = registrosHorario.filter(r => dentroDeRango(r.fecha)).reduce((acc, r) => acc + (r.falta ? 0 : r.horas), 0);
    const totalTokens = registrosToken.filter(r => dentroDeRango(r.fecha)).reduce((acc, r) => acc + Number(r.tokens), 0);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border p-1"><input value="${m.nombre}" onchange="editarModeloNombre('${m.nombre}', this.value)" class="border p-1 w-full"/></td>
      <td class="border p-1"><input value="${m.paginas}" onchange="editarModeloPaginas('${m.nombre}', this.value)" class="border p-1 w-full"/></td>
      <td class="border p-1 text-center">${totalHoras.toFixed(2)}</td>
      <td class="border p-1 text-center">${totalTokens}</td>
      <td class="border p-1 text-center"><button onclick="eliminarModelo('${m.nombre}')" class="text-red-600">🗑️</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function editarModeloPaginas(nombre, paginas) {
  const m = modelos.find(m => m.nombre === nombre);
  if (m) m.paginas = paginas;
  guardarDatos();
}

function editarModeloNombre(nombreAnterior, nuevoNombre) {
  const modelo = modelos.find(m => m.nombre === nombreAnterior);
  if (modelo) modelo.nombre = nuevoNombre;

  horarios.forEach(h => { if (h.nombre === nombreAnterior) h.nombre = nuevoNombre });
  tokens.forEach(t => { if (t.nombre === nombreAnterior) t.nombre = nuevoNombre });

  guardarDatos();
  renderModelos();
}

function actualizarSelects() {
  const selects = [document.getElementById('nombreHorario'), document.getElementById('nombreToken'), document.getElementById('modeloDashboard')];
  selects.forEach(sel => {
    sel.innerHTML = '<option disabled selected value="">Selecciona</option>';
    modelos.forEach(m => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = m.nombre;
      sel.appendChild(opt);
    });
  });
}

function agregarHorario() {
  const nombre = document.getElementById('nombreHorario').value;
  const fecha = document.getElementById('fechaHorario').value;
  const entrada = document.getElementById('horaEntrada').value;
  const salida = document.getElementById('horaSalida').value;
  const breakMins = parseInt(document.getElementById('breakHorario').value) || 0;
  const comentario = document.getElementById('comentarioHorario').value;
  const falta = document.getElementById('faltaHorario').checked;

  let horas = 0;
  if (!falta && entrada && salida) {
    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = salida.split(':').map(Number);
    horas = ((h2 * 60 + m2) - (h1 * 60 + m1) - breakMins) / 60;
    if (horas < 0) horas = 0;
  }

  horarios.push({ nombre, fecha, entrada, salida, break: breakMins, comentario, falta, horas });
  guardarDatos();
  renderHorarios();
}

function renderHorarios() {
  const tbody = document.getElementById('tablaHorarios');
  tbody.innerHTML = '';
  horarios.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border p-1">${r.fecha}</td>
      <td class="border p-1">${r.nombre}</td>
      <td class="border p-1">${r.entrada || '-'}</td>
      <td class="border p-1">${r.salida || '-'}</td>
      <td class="border p-1">${r.break || 0}</td>
      <td class="border p-1 text-center">${r.falta ? '✅' : ''}</td>
      <td class="border p-1">${r.comentario || ''}</td>
      <td class="border p-1 text-center">${r.horas.toFixed(2)}</td>
      <td class="border p-1 text-center">
        <button onclick="eliminarHorario(${i})" class="text-red-600">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function eliminarHorario(i) {
  horarios.splice(i, 1);
  guardarDatos();
  renderHorarios();
}

function agregarToken() {
  const nombre = document.getElementById('nombreToken').value;
  const fecha = document.getElementById('fechaToken').value;
  const tokensCantidad = parseInt(document.getElementById('cantidadToken').value) || 0;
  tokens.push({ nombre, fecha, tokens: tokensCantidad });
  guardarDatos();
  renderTokens();
}

function renderTokens() {
  const tbody = document.getElementById('tablaTokens');
  tbody.innerHTML = '';
  tokens.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border p-1">${r.fecha}</td>
      <td class="border p-1">${r.nombre}</td>
      <td class="border p-1 text-center">${r.tokens}</td>
      <td class="border p-1 text-center">
        <button onclick="eliminarToken(${i})" class="text-red-600">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function eliminarToken(i) {
  tokens.splice(i, 1);
  guardarDatos();
  renderTokens();
}

function actualizarDashboard() {
  const nombre = document.getElementById('modeloDashboard').value;
  const rango = document.getElementById('rangoDashboard').value;
  const desde = document.getElementById('desdeDashboard').value;
  const hasta = document.getElementById('hastaDashboard').value;

  const fechas = [], horas = [], tk = [];
  let totalHoras = 0, totalTokens = 0;

  const desdeDate = desde ? new Date(desde) : null;
  const hastaDate = hasta ? new Date(hasta) : null;

  const agruparPorFecha = (lista, campo) => {
    const agrupado = {};
    lista.forEach(r => {
      if (r.nombre !== nombre) return;
      const f = r.fecha;
      const d = new Date(f);
      if (desdeDate && d < desdeDate) return;
      if (hastaDate && d > hastaDate) return;
      agrupado[f] = (agrupado[f] || 0) + Number(r[campo] || 0);
    });
    return agrupado;
  };

  const horasPorDia = agruparPorFecha(horarios, 'horas');
  const tokensPorDia = agruparPorFecha(tokens, 'tokens');

  const dias = Array.from(new Set([...Object.keys(horasPorDia), ...Object.keys(tokensPorDia)])).sort();

  dias.forEach(f => {
    fechas.push(f);
    const h = horasPorDia[f] || 0;
    const t = tokensPorDia[f] || 0;
    horas.push(h);
    tk.push(t);
    totalHoras += h;
    totalTokens += t;
  });

  mostrarGrafica('graficaHoras', 'Horas trabajadas', fechas, horas, '#2563eb');
  mostrarGrafica('graficaTokens', 'Tokens generados', fechas, tk, '#10b981');
  document.getElementById('totalHorasTexto').textContent = `Total: ${totalHoras.toFixed(2)} horas`;
  document.getElementById('totalTokensTexto').textContent = `Total: ${totalTokens} tokens`;
}

let graficas = {};
function mostrarGrafica(id, label, labels, data, color) {
  if (graficas[id]) graficas[id].destroy();
  graficas[id] = new Chart(document.getElementById(id), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label, data, backgroundColor: color }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

function filtrarModelos() {
  renderModelos();
}

window.onload = () => {
  guardarDatos();
  renderModelos();
  renderHorarios();
  renderTokens();
  actualizarDashboard();
};
