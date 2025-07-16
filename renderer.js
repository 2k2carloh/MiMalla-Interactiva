const { ipcRenderer } = require('electron');

let carrera = {
  semestres: [],
  categorias: []
};
let mallaSellada = false;
let semestreActual = 0;
let editandoRamo = null;

async function guardarConfig() {
  await ipcRenderer.invoke('guardar-config', JSON.stringify(carrera));
}

async function cargarConfig() {
  const resp = await ipcRenderer.invoke('cargar-config');
  if (resp.ok && resp.data) {
    try {
      const obj = JSON.parse(resp.data);
      if (obj.semestres && obj.categorias) {
        carrera = obj;
        document.getElementById('controls').style.display = 'none';
        document.getElementById('container').style.display = 'flex';
        renderCategorias();
        renderMalla();
      }
    } catch (error) {
      console.error("Error al parsear la configuración:", error);
    }
  }
}


document.getElementById('btnCrearSemestres').addEventListener('click', async () => {
  const num = parseInt(document.getElementById('numSemestres').value);
  if (isNaN(num) || num < 1) return;
  carrera.semestres = [];
  for (let i = 0; i < num; i++) {
    carrera.semestres.push({ nombre: `Semestre ${i + 1}`, ramos: [] });
  }
  document.getElementById('controls').style.display = 'none';
  document.getElementById('container').style.display = 'flex';
  renderMalla();
  renderCategorias();
  await guardarConfig();
});

document.getElementById('btnAgregarCategoria').addEventListener('click', async () => {
  const nombre = document.getElementById('categoriaNombre').value.trim();
  const color = document.getElementById('categoriaColor').value;
  if (!nombre) {
    alert('Nombre de categoría requerido.');
    return;
  }
  carrera.categorias.push({ id: crypto.randomUUID(), nombre, color });
  document.getElementById('categoriaNombre').value = '';
  renderCategorias();
  await guardarConfig();
});

function renderCategorias() {
  const cont = document.getElementById('categorias');
  cont.innerHTML = '';
  carrera.categorias.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'categoria';
    div.style.background = cat.color;

    const spanNombre = document.createElement('span');
    spanNombre.textContent = cat.nombre;
    spanNombre.style.flex = '1';

    const btnEliminar = document.createElement('button');
    btnEliminar.innerHTML = '<i class="fa-solid fa-trash"></i>';
    btnEliminar.style.background = 'transparent';
    btnEliminar.style.border = 'none';
    btnEliminar.style.cursor = 'pointer';
    btnEliminar.style.color = '#fff';
    btnEliminar.onclick = async () => {
      if (confirm('¿Eliminar esta categoría?')) {
        carrera.categorias = carrera.categorias.filter(c => c.id !== cat.id);
        carrera.semestres.forEach(s => {
          s.ramos.forEach(r => {
            if (r.categoriaId === cat.id) r.categoriaId = null;
          });
        });
        renderCategorias();
        renderMalla();
        await guardarConfig();
      }
    };

    div.appendChild(spanNombre);
    div.appendChild(btnEliminar);
    cont.appendChild(div);
  });
}

function renderMalla() {
  const container = document.getElementById('malla');
  container.innerHTML = '';
  const filas = [];
  for (let i = 0; i < carrera.semestres.length; i += 5) {
    filas.push(carrera.semestres.slice(i, i + 5));
  }
  filas.forEach(fila => {
    const filaDiv = document.createElement('div');
    filaDiv.className = 'fila-semestres';
    fila.forEach(semestre => {
      const indexGlobal = carrera.semestres.indexOf(semestre);
      const divSemestre = document.createElement('div');
      divSemestre.className = 'semestre';
      const header = document.createElement('div');
      header.className = 'semestre-header';
      header.textContent = semestre.nombre;
      divSemestre.appendChild(header);
      semestre.ramos.forEach(ramo => {
        const divRamo = document.createElement('div');
        divRamo.className = 'ramo';
        divRamo.setAttribute("draggable", "true");
        const cat = carrera.categorias.find(c => c.id === ramo.categoriaId);
        let baseColor = cat ? cat.color : '#74b9ff';
        if (ramo.completado) {
          baseColor = ajustarLuminosidad(baseColor, -70);
        }
        divRamo.style.background = baseColor;
        if (!ramo.desbloqueado) divRamo.classList.add('bloqueado');
        if (ramo.completado) divRamo.classList.add('completado');

        divRamo.innerHTML = '';

        const nombre = document.createElement('span');
        nombre.textContent = ramo.nombre;
        divRamo.appendChild(nombre);

        // Mostrar promedio si existe
        if (ramo.promedio !== undefined) {
          const spanProm = document.createElement('span');
          spanProm.className = 'info-promedio';
          spanProm.textContent = `Prom: ${ramo.promedio.toFixed(2)}`;
          spanProm.style.display = 'block';
          spanProm.style.fontSize = '12px';
          spanProm.style.color = ramo.promedio >= (ramo.notaMinima || 4.0) ? 'green' : 'red';
          divRamo.appendChild(spanProm);
        }

        divRamo.onclick = async () => {
          if (!ramo.desbloqueado) return;
          ramo.completado = !ramo.completado;
          actualizarDesbloqueos();
          renderMalla();
          await guardarConfig();
        };

        const acciones = document.createElement('div');
        acciones.className = 'acciones';

        const btnEditar = document.createElement('button');
        btnEditar.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
        btnEditar.onclick = e => {
          e.stopPropagation();
          abrirModalEditarRamo(indexGlobal, ramo);
        };

        const btnEliminar = document.createElement('button');
        btnEliminar.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        btnEliminar.onclick = async e => {
          e.stopPropagation();
          if (confirm('¿Eliminar ramo?')) {
            semestre.ramos = semestre.ramos.filter(r => r.id !== ramo.id);
            renderMalla();
            await guardarConfig();
          }
        };

        const btnNotas = document.createElement('button');
        btnNotas.innerHTML = `<i class="fa-solid fa-calculator"></i>`;
        btnNotas.title = 'Calcular ponderación';
        btnNotas.onclick = e => {
          e.stopPropagation();
          abrirModalNotas(ramo, divRamo);
        };

        acciones.appendChild(btnEditar);
        acciones.appendChild(btnEliminar);
        acciones.appendChild(btnNotas);
        divRamo.appendChild(acciones);

        divSemestre.appendChild(divRamo);
      });

      const btnAddRamo = document.createElement('button');
      btnAddRamo.textContent = '+';
      btnAddRamo.className = 'agregar';
      btnAddRamo.onclick = () => abrirModalAgregarRamo(indexGlobal);
      divSemestre.appendChild(btnAddRamo);
      filaDiv.appendChild(divSemestre);
    });
    container.appendChild(filaDiv);
  });

  actualizarContadorRamos();
  actualizarEstadoMallaSellada();
}

function abrirModalAgregarRamo(index) {
  semestreActual = index;
  editandoRamo = null;
  document.getElementById('modalTitulo').textContent = 'Agregar Ramo';
  document.getElementById('ramoNombre').value = '';
  document.getElementById('tieneRequisito').value = 'no';
  document.getElementById('requisitosContainer').style.display = 'none';
  document.getElementById('listaRequisitos').innerHTML = '';
  cargarCategoriasSelect();
  document.getElementById('modal').style.display = 'flex';
}

function abrirModalEditarRamo(index, ramo) {
  semestreActual = index;
  editandoRamo = ramo;
  document.getElementById('modalTitulo').textContent = 'Editar Ramo';
  document.getElementById('ramoNombre').value = ramo.nombre;
  document.getElementById('tieneRequisito').value = ramo.requisitos.length > 0 ? 'si' : 'no';
  if (ramo.requisitos.length > 0) {
    document.getElementById('requisitosContainer').style.display = 'block';
    renderListaRequisitos(ramo.requisitos);
  } else {
    document.getElementById('requisitosContainer').style.display = 'none';
    document.getElementById('listaRequisitos').innerHTML = '';
  }
  cargarCategoriasSelect(ramo.categoriaId);
  document.getElementById('modal').style.display = 'flex';
}

function cargarCategoriasSelect(seleccionadaId) {
  const select = document.getElementById('ramoCategoria');
  select.innerHTML = '';
  carrera.categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.nombre;
    if (cat.id === seleccionadaId) opt.selected = true;
    select.appendChild(opt);
  });
  actualizarColorSelectCategoria();
  select.onchange = () => {
    actualizarColorSelectCategoria();
  };
}

document.getElementById('tieneRequisito').onchange = () => {
  if (document.getElementById('tieneRequisito').value === 'si') {
    document.getElementById('requisitosContainer').style.display = 'block';
    renderListaRequisitos();
  } else {
    document.getElementById('requisitosContainer').style.display = 'none';
    document.getElementById('listaRequisitos').innerHTML = '';
  }
};

function renderListaRequisitos(marcados = []) {
  const lista = document.getElementById('listaRequisitos');
  lista.innerHTML = '';
  const todosRamos = carrera.semestres.flatMap(s => s.ramos);
  if (todosRamos.length === 0) {
    lista.innerHTML = '<p>No hay ramos aún.</p>';
    return;
  }
  todosRamos.forEach(ramo => {
    const div = document.createElement('div');
    div.innerHTML = `<label><input type="checkbox" value="${ramo.id}" ${marcados.includes(ramo.id) ? 'checked' : ''}> ${ramo.nombre}</label>`;
    lista.appendChild(div);
  });
}

document.getElementById('btnGuardarRamo').addEventListener('click', async () => {
  const nombre = document.getElementById('ramoNombre').value.trim();
  const tieneReq = document.getElementById('tieneRequisito').value;
  const categoriaId = document.getElementById('ramoCategoria').value;
  if (!nombre) {
    alert('Pon un nombre al ramo.');
    return;
  }
  if (!categoriaId) {
    alert('Selecciona una categoría.');
    return;
  }
  let requisitos = [];
  if (tieneReq === 'si') {
    const checks = document.querySelectorAll('#listaRequisitos input[type="checkbox"]:checked');
    requisitos = Array.from(checks).map(c => c.value);
  }
  if (editandoRamo) {
    editandoRamo.nombre = nombre;
    editandoRamo.requisitos = requisitos;
    editandoRamo.categoriaId = categoriaId;
  } else {
    const id = crypto.randomUUID();
    carrera.semestres[semestreActual].ramos.push({
      id,
      nombre,
      requisitos,
      completado: false,
      desbloqueado: requisitos.length === 0,
      categoriaId
    });
  }
  actualizarDesbloqueos();
  renderMalla();
  actualizarContadorRamos()
  document.getElementById('modal').style.display = 'none';
  await guardarConfig();
});

function actualizarDesbloqueos() {
  const todosRamos = carrera.semestres.flatMap(s => s.ramos);
  todosRamos.forEach(ramo => {
    if (ramo.requisitos.length > 0) {
      const ok = ramo.requisitos.every(id => {
        const req = todosRamos.find(r => r.id === id);
        return req && req.completado;
      });
      ramo.desbloqueado = ok;
    } else {
      ramo.desbloqueado = true;
    }
  });
  actualizarContadorRamos()
}

function actualizarColorSelectCategoria() {
  const select = document.getElementById('ramoCategoria');
  const categoriaId = select.value;
  const cat = carrera.categorias.find(c => c.id === categoriaId);
  if (cat) {
    select.style.backgroundColor = cat.color;
    select.style.color = esColorClaro(cat.color) ? '#000' : '#fff';
  } else {
    select.style.backgroundColor = '#fff';
    select.style.color = '#000';
  }
}

function esColorClaro(hexColor) {
  const c = hexColor.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 186;
}

document.getElementById('btnCerrarModal').addEventListener('click', () => {
  document.getElementById('modal').style.display = 'none';
});

document.getElementById('btnExportar').addEventListener('click', () => {
  ipcRenderer.invoke('guardar-archivo', JSON.stringify(carrera, null, 2));
});

document.getElementById('btnImportar').addEventListener('click', async () => {
  const data = await ipcRenderer.invoke('leer-archivo');
  if (data) {
    try {
      const obj = JSON.parse(data);
      if (obj.semestres && obj.categorias) {
        carrera = obj;
        renderCategorias();
        renderMalla();
        await guardarConfig();
      } else {
        alert('Archivo inválido: estructura incorrecta');
      }
    } catch {
      alert('Error al leer el archivo JSON');
    }
  }
});

document.getElementById('btnNuevaMalla').addEventListener('click', async () => {
  if (confirm('¿Seguro quieres crear una malla nueva? Se perderán los datos no guardados.')) {
    carrera = { semestres: [], categorias: [] };
    document.getElementById('container').style.display = 'none';
    document.getElementById('controls').style.display = 'block';
    renderCategorias();
    renderMalla();
    await ipcRenderer.invoke('guardar-config', JSON.stringify(carrera));
  }
});

document.getElementById('btnToggleSellado').addEventListener('click', () => {
  mallaSellada = !mallaSellada;
  actualizarEstadoMallaSellada();
});

let dragged = null;

document.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("ramo")) {
    dragged = e.target;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
    dragged.classList.add("dragging");
  }
});

document.addEventListener("dragend", (e) => {
  if (e.target.classList.contains("ramo")) {
    e.target.classList.remove("dragging");
    dragged = null;
  }
});

document.addEventListener("dragover", (e) => {
  const container = e.target.closest(".semestre");
  if (!container || !dragged) return;

  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  const afterElement = getDragAfterElement(container, e.clientY);
  const addButton = container.querySelector("button.agregar");

  if (afterElement == null) {
    container.insertBefore(dragged, addButton);
  } else {
    container.insertBefore(dragged, afterElement);
  }
});

document.addEventListener("drop", async (e) => {
  e.preventDefault();

  const target = e.target.closest(".semestre");
  if (!target || !dragged) return;

  const filaSemestres = [...document.querySelectorAll(".semestre")];
  const indexSemestreDestino = filaSemestres.indexOf(target);
  if (indexSemestreDestino === -1) return;

  const ramoId = dragged.querySelector("span")?.textContent;

  let ramoMovido = null;
  for (const semestre of carrera.semestres) {
    const index = semestre.ramos.findIndex(r => r.nombre === ramoId);
    if (index !== -1) {
      ramoMovido = semestre.ramos.splice(index, 1)[0];
      break;
    }
  }

  if (!ramoMovido) return;

  const nuevosRamos = [];
  target.querySelectorAll(".ramo").forEach(div => {
    const nombre = div.querySelector("span")?.textContent;
    const ramo = nombre === ramoMovido.nombre
      ? ramoMovido
      : carrera.semestres.flatMap(s => s.ramos).find(r => r.nombre === nombre);
    if (ramo) nuevosRamos.push(ramo);
  });

  carrera.semestres[indexSemestreDestino].ramos = nuevosRamos;

  await guardarConfig();
});

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".ramo:not(.dragging)")];

  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
  
}

function actualizarContadorRamos() {
  const todosRamos = carrera.semestres.flatMap(s => s.ramos);
  const aprobados = todosRamos.filter(r => r.completado).length;
  const total = todosRamos.length;
  const el = document.getElementById("contadorRamos");
  if (el) el.textContent = `${aprobados} / ${total} ramos aprobados`;
}

function ajustarLuminosidad(hex, cantidad) {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) {
    c = c.split('').map(ch => ch + ch).join('');
  }

  const num = parseInt(c, 16);
  let r = (num >> 16) + cantidad;
  let g = ((num >> 8) & 0x00FF) + cantidad;
  let b = (num & 0x0000FF) + cantidad;

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function actualizarEstadoMallaSellada() {
  const botonesAgregar = document.querySelectorAll("button.agregar");
  botonesAgregar.forEach(btn => {
    btn.style.display = mallaSellada ? "none" : "flex";
  });

  const toggleBtn = document.getElementById("btnToggleSellado");
  toggleBtn.textContent = mallaSellada ? "Abrir Malla" : "Sellar Malla";
}

document.getElementById('fondoTipo').addEventListener('change', () => {
  const tipo = document.getElementById('fondoTipo').value;
  const inputImagen = document.getElementById('estiloFondoImagen');
  const inputColor = document.getElementById('estiloFondoPagina');
  if (tipo === 'imagen') {
    inputImagen.style.display = 'block';
    inputColor.style.display = 'none';
  } else {
    inputImagen.style.display = 'none';
    inputColor.style.display = 'inline-block';
  }
});

document.getElementById('btnAplicarEstilo').addEventListener('click', () => {
  const fondo = document.getElementById('estiloFondoPagina').value;
  const fondoSemestres = document.getElementById('estiloFondoSemestres').value;
  const textoColor = document.getElementById('estiloTexto').value;
  const colorBorde = document.getElementById('estiloBordeColor').value;
  const colorBoton = document.getElementById('estiloBotones').value;

  const fondoTipo = document.getElementById('fondoTipo').value;
  const fondoImagenInput = document.getElementById('estiloFondoImagen');

  // Fondo: color o imagen
  if (fondoTipo === 'color') {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = fondo;
  } else if (fondoTipo === 'imagen' && fondoImagenInput.files.length > 0) {
    const file = fondoImagenInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      document.body.style.backgroundImage = `url('${e.target.result}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundPosition = 'center';
    };
    reader.readAsDataURL(file);
  }

  // Color de texto general (excluyendo ramos y categorías)
  document.querySelectorAll('body *:not(.ramo *):not(.categoria *):not(.ramo):not(.categoria)').forEach(el => {
    el.style.color = textoColor;
  });

  // Fondo y borde de semestres
  document.querySelectorAll('.semestre').forEach(s => {
    s.style.backgroundColor = fondoSemestres;
    s.style.borderColor = colorBorde;
  });

  // Color de botones (excepto los dentro de .ramo o .categoria)
  document.querySelectorAll('button:not(.ramo button):not(.categoria button)').forEach(btn => {
    btn.style.backgroundColor = colorBoton;
    btn.style.color = '#fff';
  });
});

const panel = document.getElementById('panelEstilos');
const btnEstilos = document.getElementById('btnEstilos');

btnEstilos.addEventListener('click', () => {
  panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
});

document.getElementById('fondoTipo').addEventListener('change', () => {
  const tipo = document.getElementById('fondoTipo').value;
  document.getElementById('estiloFondoImagen').style.display = tipo === 'imagen' ? 'block' : 'none';
  document.getElementById('estiloFondoPagina').style.display = tipo === 'imagen' ? 'none' : 'inline-block';
});

document.getElementById('fondoTipo').addEventListener('change', function () {
  const tipo = this.value;
  const colorInput = document.getElementById('estiloFondoPagina');
  const colorLabel = document.getElementById('labelFondoColor');
  const fileInput = document.getElementById('estiloFondoImagen');
  const fileLabel = document.getElementById('labelFondoImagen');

  if (tipo === 'color') {
    colorInput.style.display = 'block';
    colorLabel.style.display = 'block';
    fileInput.style.display = 'none';
    fileLabel.style.display = 'none';
  } else {
    colorInput.style.display = 'none';
    colorLabel.style.display = 'none';
    fileInput.style.display = 'block';
    fileLabel.style.display = 'block';
  }
});

let ramoActualNotas = null;
let divRamoActualNotas = null;

function abrirModalNotas(ramo, divRamo) {
  ramoActualNotas = ramo;
  divRamoActualNotas = divRamo;
  document.getElementById('contenedorNotas').innerHTML = '';
  document.getElementById('notaMinima').value = ramo.notaMinima || 4.0;
  document.getElementById('resultadoPonderacion').textContent = '';
  document.getElementById('modalNotas').style.display = 'flex';
}

document.getElementById('btnCerrarNotas').addEventListener('click', () => {
  document.getElementById('modalNotas').style.display = 'none';
});

document.getElementById('btnAgregarNota').addEventListener('click', () => {
  const fila = document.createElement('div');
  fila.innerHTML = `
    <input type="number" placeholder="Nota" step="0.1" min="1" max="7" class="nota" />
    <input type="number" placeholder="%" step="1" min="0" max="100" class="porcentaje" />
    <button class="btnEliminarNota">🗑</button>
  `;
  document.getElementById('contenedorNotas').appendChild(fila);

  fila.querySelector('.btnEliminarNota').onclick = () => {
    fila.remove();
    calcularPonderacion();
  };

  fila.querySelector('.nota').oninput = calcularPonderacion;
  fila.querySelector('.porcentaje').oninput = calcularPonderacion;
});

document.getElementById('notaMinima').oninput = calcularPonderacion;

function calcularPonderacion() {
  const notas = document.querySelectorAll('.nota');
  const porcentajes = document.querySelectorAll('.porcentaje');
  let suma = 0;
  let totalPorcentaje = 0;

  for (let i = 0; i < notas.length; i++) {
    const nota = parseFloat(notas[i].value);
    const porcentaje = parseFloat(porcentajes[i].value);
    if (!isNaN(nota) && !isNaN(porcentaje)) {
      suma += nota * porcentaje;
      totalPorcentaje += porcentaje;
    }
  }

  const notaMinima = parseFloat(document.getElementById('notaMinima').value) || 40;
  let resultado = 0;

  if (totalPorcentaje > 0) {
    resultado = suma / totalPorcentaje;
  }

  ramoActualNotas.promedio = resultado;
  ramoActualNotas.notaMinima = notaMinima;

  const elResultado = document.getElementById('resultadoPonderacion');
  elResultado.textContent = `Promedio: ${resultado.toFixed(2)} (${resultado >= notaMinima ? 'Aprobado' : 'Reprobado'})`;
  elResultado.style.color = resultado >= notaMinima ? 'green' : 'red';

  // Mostrarlo visualmente en el ramo
  const info = divRamoActualNotas.querySelector('.info-promedio');
  if (!info) {
    const span = document.createElement('span');
    span.className = 'info-promedio';
    span.style.fontSize = '12px';
    span.style.display = 'block';
    span.style.marginTop = '3px';
    divRamoActualNotas.appendChild(span);
  }
  divRamoActualNotas.querySelector('.info-promedio').textContent = `Prom: ${resultado.toFixed(2)}`;
  divRamoActualNotas.querySelector('.info-promedio').style.color = resultado >= notaMinima ? 'green' : 'red';
}



cargarConfig();