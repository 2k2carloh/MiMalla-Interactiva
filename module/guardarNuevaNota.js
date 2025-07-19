const { lanzarAlerta, cerrarAlerta } = require('./alerta');

async function guardarNuevaNota() {
  if (!carrera.notas) carrera.notas = [];

  const titulo = document.getElementById('notaTitulo').value.trim();
  const color = document.getElementById('notaColor').value;

  if (!titulo) {
    lanzarAlerta('Debes escribir un título');
    return;
  }

  const nuevaNota = {
    id: crypto.randomUUID(),
    titulo,
    contenido: '',
    color
  };

  carrera.notas.push(nuevaNota);
  await guardarConfig();
  renderNotas();
  document.getElementById('modalNuevaNota').style.display = 'none';
}

module.exports = {
    guardarNuevaNota
}