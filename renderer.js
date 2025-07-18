const { ipcRenderer } = require('electron');

const { actualizarColorSelectCategoria } = require('./module/actualizarColorSelectCategoria');
const { guardarConfig } = require('./module/guardarConfig');
const { actualizarContadorRamos } = require('./module/actualizarContadorRamos');
const { ajustarLuminosidad } = require('./module/ajustarLuminosidad');
const { cargarCategoriasSelect } = require('./module/cargarCategoriasSelect');
const { renderListaRequisitos } = require('./module/renderListaRequisitos');
const { abrirModalAgregarRamo } = require('./module/abrirModalAgregarRamo');
const { abrirModalEditarRamo } = require('./module/abrirModalEditarRamo');
const { aplicarEstiloDesdeConfig } = require('./module/aplicarEstiloDesdeConfig');
const { abrirNota } = require('./module/abrirNota');
const { renderNotas } = require('./module/renderNotas');
const { actualizarDesbloqueos } = require('./module/actualizarDesbloqueos');
const { calcularYReflejarPromedio } = require('./module/calcularYReflejarPromedio')
const { actualizarEstadoMallaSellada } = require('./module/actualizarEstadoMallaSellada');
const { renderMalla } = require('./module/renderMalla');
const { abrirModalNotas } = require('./module/abrirModalNotas');
const { getDragAfterElement } = require('./module/getDragAfterElement');
const { calcularPonderacion } = require('./module/calcularPonderacion');
const { guardarNuevaNota } = require('./module/guardarNuevaNota');
const { renderizarCalendario } = require('./module/renderizarCalendario');
const { abrirModalRecordatorio } = require('./module/abrirModalRecordatorio');
const { renderCategorias } = require('./module/renderCategorias');

let carrera = {
  semestres: [],
  categorias: [],
  estilos: {
    fondoTipo: 'color',
    estiloFondoPagina: '#ffffff',
    estiloFondoSemestres: '#f1f1f1',
    estiloTexto: '#000000',
    estiloBordeColor: '#000000',
    estiloBotones: '#000000',
    fondoImagenBase64: null
  }
};

let mallaSellada = false;
let semestreActual = 0;
let editandoRamo = null;
let notaAbierta = null;
let ramoActualNotas = null;
let divRamoActualNotas = null;
let dragged = null;
let recordatorios = JSON.parse(localStorage.getItem('recordatorios')) || {};
let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();
let diaSeleccionado = null;

const panel = document.getElementById('panelEstilos');
const btnEstilos = document.getElementById('btnEstilos');

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

document.getElementById('tieneRequisito').onchange = () => {
  if (document.getElementById('tieneRequisito').value === 'si') {
    document.getElementById('requisitosContainer').style.display = 'block';
    renderListaRequisitos();
  } else {
    document.getElementById('requisitosContainer').style.display = 'none';
    document.getElementById('listaRequisitos').innerHTML = '';
  }
};

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
        carrera.semestres = obj.semestres;
        carrera.categorias = obj.categorias;

        carrera.estilos = obj.estilos || {
          fondoTipo: 'color',
          estiloFondoPagina: '#ffffff',
          estiloFondoSemestres: '#f1f1f1',
          estiloTexto: '#000000',
          estiloBordeColor: '#000000',
          estiloBotones: '#000000',
          fondoImagenBase64: null
        };

        document.getElementById('controls').style.display = 'none';
        document.getElementById('container').style.display = 'flex';

        renderCategorias();
        renderMalla();
        await guardarConfig();
      } else {
        alert('Archivo inválido: estructura incorrecta.');
      }
    } catch (error) {
      console.error(error);
      alert('Error al leer el archivo JSON.');
    }
  }
});

document.getElementById('btnImportarEstilo').addEventListener('click', async () => {
  const data = await ipcRenderer.invoke('leer-archivo');
  if (!data) return;
  try {
    const estiloImportado = JSON.parse(data);
    if (!estiloImportado) return;

    carrera.estilos = estiloImportado;

    if (carrera.estilos.fondoTipo === 'imagen' && carrera.estilos.fondoImagenBase64) {
      document.body.style.backgroundImage = `url('${carrera.estilos.fondoImagenBase64}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = carrera.estilos.estiloFondoPagina || '#ffffff';
    }

    document.getElementById('fondoTipo').value = carrera.estilos.fondoTipo || 'color';
    document.getElementById('estiloFondoPagina').value = carrera.estilos.estiloFondoPagina || '#ffffff';
    document.getElementById('estiloFondoSemestres').value = carrera.estilos.estiloFondoSemestres || '#ffffff';
    document.getElementById('estiloTexto').value = carrera.estilos.estiloTexto || '#000000';
    document.getElementById('estiloBordeColor').value = carrera.estilos.estiloBordeColor || '#000000';
    document.getElementById('estiloBotones').value = carrera.estilos.estiloBotones || '#000000';

    aplicarEstiloDesdeConfig();
    await guardarConfig();

  } catch (err) {
    alert('Error al importar el estilo');
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
  const fondoTipo = document.getElementById('fondoTipo').value;
  const fondoColor = document.getElementById('estiloFondoPagina').value;
  const fondoSemestres = document.getElementById('estiloFondoSemestres').value;
  const textoColor = document.getElementById('estiloTexto').value;
  const bordeColor = document.getElementById('estiloBordeColor').value;
  const botonColor = document.getElementById('estiloBotones').value;
  const inputImagen = document.getElementById('estiloFondoImagen');

  document.querySelectorAll('body *').forEach(el => {
    const estaEnBotonFlotante =
      el.closest('#btnIrANotas') ||
      el.closest('#btnEstilos') ||
      el.closest('#btnIrACalendario');

    const estaEnRamoCategoriaEstilos =
      el.closest('.ramo') ||
      el.closest('.categoria') ||
      el.closest('#panelEstilos');

    if (!estaEnBotonFlotante && !estaEnRamoCategoriaEstilos) {
      el.style.color = textoColor;
    }
  });

  const botonesFlotantes = ['btnIrANotas', 'btnEstilos', 'btnIrACalendario'];

  botonesFlotantes.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.style.backgroundColor = botonColor;
      btn.style.color = '#fff'; // SIEMPRE blanco
    }
  });

  document.querySelectorAll('.semestre').forEach(s => {
    s.style.backgroundColor = fondoSemestres;
    s.style.borderColor = bordeColor;
  });

  document.querySelectorAll('button:not(.ramo button):not(.categoria button):not(#panelEstilos button)').forEach(btn => {
    btn.style.backgroundColor = botonColor;
    btn.style.color = '#fff';
  });
  document.getElementById('categoriaColor').addEventListener('input', (e) => {
    const nuevoColor = e.target.value;
    document.getElementById('categoria-color').style.backgroundColor = nuevoColor;
  });

  document.getElementById('fondoCalendario').addEventListener('input', (e) => {
    const color = e.target.value;
    document.getElementById('calendarioContainer').style.backgroundColor = color;
  });

  colorRecordatorioActual = document.getElementById('colorRecordatorio').value;

  if (fondoTipo === 'color') {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = fondoColor;

    carrera.estilos = {
      fondoTipo,
      estiloFondoPagina: fondoColor,
      estiloFondoSemestres: fondoSemestres,
      estiloTexto: textoColor,
      estiloBordeColor: bordeColor,
      estiloBotones: botonColor,
      fondoImagenBase64: null
    };

    guardarConfig();
  } else if (fondoTipo === 'imagen' && inputImagen.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64 = e.target.result;

      document.body.style.backgroundImage = `url('${base64}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundPosition = 'center';

      carrera.estilos = {
        fondoTipo,
        estiloFondoPagina: fondoColor,
        estiloFondoSemestres: fondoSemestres,
        estiloTexto: textoColor,
        estiloBordeColor: bordeColor,
        estiloBotones: botonColor,
        fondoImagenBase64: base64
      };

      guardarConfig();
    };
    reader.readAsDataURL(inputImagen.files[0]);
  } else if (fondoTipo === 'imagen' && carrera.estilos.fondoImagenBase64) {
    document.body.style.backgroundImage = `url('${carrera.estilos.fondoImagenBase64}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center';

    carrera.estilos = {
      fondoTipo,
      estiloFondoPagina: fondoColor,
      estiloFondoSemestres: fondoSemestres,
      estiloTexto: textoColor,
      estiloBordeColor: bordeColor,
      estiloBotones: botonColor,
      fondoImagenBase64: carrera.estilos.fondoImagenBase64
    };

    guardarConfig();
  }
});

document.getElementById('categoriaColor').addEventListener('input', async (e) => {
  const nuevoColor = e.target.value;
  carrera.estilos.colorCategoria = nuevoColor;
  const contCategoria = document.getElementById('categoria-color');
  if (contCategoria) contCategoria.style.backgroundColor = nuevoColor;
  await guardarConfig();
});

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

document.getElementById('btnExportarEstilo').addEventListener('click', () => {
  const estilo = {
    fondoTipo: document.getElementById('fondoTipo').value,
    estiloFondoPagina: document.getElementById('estiloFondoPagina').value,
    estiloFondoSemestres: document.getElementById('estiloFondoSemestres').value,
    estiloTexto: document.getElementById('estiloTexto').value,
    estiloBordeColor: document.getElementById('estiloBordeColor').value,
    estiloBotones: document.getElementById('estiloBotones').value,
    fondoImagenBase64: carrera.estilos.fondoImagenBase64 || null
  };
  ipcRenderer.invoke('guardar-archivo', JSON.stringify(estilo, null, 2), 'estilos-malla.json');
});

cargarConfig().then(cfg => {
  if (cfg) {
    carrera = cfg;
    renderCategorias();
    renderMalla();
    aplicarEstiloDesdeConfig();
    document.getElementById('controls').style.display = 'none';
    document.getElementById('container').style.display = 'flex';
  }
});

if (!carrera.notas) carrera.notas = [];

document.getElementById('btnIrANotas').addEventListener('click', () => {
  document.getElementById('container').style.display = 'none';
  document.getElementById('notasContainer').style.display = 'block';
  document.querySelector('.file-actions').style.display = 'none';
  document.getElementById('btnEstilos').style.display = 'none';
  document.getElementById('btnIrANotas').style.display = 'none';
  document.getElementById('contadorRamos').style.display = 'none';
  document.getElementById('title').style.display = 'none';
  document.getElementById('btnIrACalendario').style.display = 'none';
});

document.getElementById('volverMalla').addEventListener('click', () => {
  document.getElementById('notasContainer').style.display = 'none';
  document.getElementById('container').style.display = 'flex';
  document.querySelector('.file-actions').style.display = 'flex';
  document.getElementById('btnEstilos').style.display = 'block';
  document.getElementById('btnIrANotas').style.display = 'block';
  document.getElementById('contadorRamos').style.display = 'flex';
  document.getElementById('title').style.display = 'flex';
  document.getElementById('btnIrACalendario').style.display = 'flex';
});

document.getElementById('agregarNota').addEventListener('click', () => {
  document.getElementById('modalNuevaNota').style.display = 'flex';
  document.getElementById('notaTitulo').value = '';
  document.getElementById('notaColor').value = '#f1c40f';
  document.getElementById('btnGuardarNuevaNota').onclick = guardarNuevaNota;
});

document.getElementById('btnCerrarModalNuevaNota').addEventListener('click', () => {
  document.getElementById('modalNuevaNota').style.display = 'none';
});

document.getElementById('cerrarVistaNota').addEventListener('click', async () => {
  if (notaAbierta) {
    notaAbierta.titulo = document.getElementById('vistaNotaTitulo').value.trim();
    notaAbierta.contenido = document.getElementById('vistaNotaContenido').value;
    await guardarConfig();
    renderNotas();
    notaAbierta = null;
  }
  document.getElementById('vistaNota').style.display = 'none';
});

document.getElementById('guardarVistaNota').addEventListener('click', async () => {
  if (notaAbierta) {
    notaAbierta.titulo = document.getElementById('vistaNotaTitulo').value.trim();
    notaAbierta.contenido = document.getElementById('vistaNotaContenido').value;
    await guardarConfig();
    renderNotas();
    notaAbierta = null;
  }
  document.getElementById('vistaNota').style.display = 'none';
});

document.getElementById('btnIrANotas').addEventListener('click', () => {
  document.getElementById('container').style.display = 'none';
  document.getElementById('notasContainer').style.display = 'block';

  document.querySelector('.file-actions').style.display = 'none';
  document.getElementById('btnEstilos').style.display = 'none';
  document.getElementById('btnIrANotas').style.display = 'none';
  document.getElementById('contadorRamos').style.display = 'none';
  document.getElementById('title').style.display = 'none';

  renderNotas();
});

document.getElementById('agregarInputRecordatorio').onclick = () => {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input-recordatorio';
  document.getElementById('inputsRecordatorio').appendChild(input);
};

document.getElementById('guardarRecordatorio').onclick = () => {
  const inputs = document.querySelectorAll('.input-recordatorio');
  const textos = Array.from(inputs).map(i => i.value.trim()).filter(Boolean);

  if (textos.length) {
    recordatorios[diaSeleccionado] = textos;
  } else {
    delete recordatorios[diaSeleccionado];
  }

  localStorage.setItem('recordatorios', JSON.stringify(recordatorios));
  document.getElementById('modalRecordatorio').style.display = 'none';
  renderizarCalendario();
};

document.getElementById('cerrarModalRecordatorio').onclick = () => {
  document.getElementById('modalRecordatorio').style.display = 'none';
};

document.getElementById('mesAnterior').onclick = () => {
  mesActual--;
  if (mesActual < 0) {
    mesActual = 11;
    anioActual--;
  }
  renderizarCalendario();
};

document.getElementById('mesSiguiente').onclick = () => {
  mesActual++;
  if (mesActual > 11) {
    mesActual = 0;
    anioActual++;
  }
  renderizarCalendario();
};

document.getElementById('btnIrACalendario').addEventListener('click', () => {
  document.getElementById('container').style.display = 'none';
  document.getElementById('notasContainer').style.display = 'none';
  document.getElementById('calendarioContainer').style.display = 'block';
  document.querySelector('.file-actions').style.display = 'none';
  document.getElementById('btnEstilos').style.display = 'none';
  document.getElementById('btnIrANotas').style.display = 'none';
  document.getElementById('btnIrACalendario').style.display = 'none';
  document.getElementById('contadorRamos').style.display = 'none';
  document.getElementById('title').style.display = 'none';
  document.getElementById('volverMallaDesdeCalendario').style.display = 'block';

  aplicarEstiloDesdeConfig();
  renderizarCalendario();
});

document.getElementById('volverMallaDesdeCalendario').addEventListener('click', () => {
  document.getElementById('calendarioContainer').style.display = 'none';
  document.getElementById('container').style.display = 'flex';
  document.querySelector('.file-actions').style.display = 'flex';
  document.getElementById('btnEstilos').style.display = 'block';
  document.getElementById('btnIrANotas').style.display = 'block';
  document.getElementById('btnIrACalendario').style.display = 'block';
  document.getElementById('contadorRamos').style.display = 'flex';
  document.getElementById('title').style.display = 'flex';
  document.getElementById('volverMallaDesdeCalendario').style.display = 'none';
});


cargarConfig().then(() => {
  aplicarEstiloDesdeConfig();
  document.getElementById('controls').style.display = 'none';
  document.getElementById('container').style.display = 'flex';
});