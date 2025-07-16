function abrirNota(nota) {
  notaAbierta = nota;
  document.getElementById('vistaNota').style.display = 'flex';
  document.getElementById('vistaNotaTitulo').value = nota.titulo;
  document.getElementById('vistaNotaContenido').value = nota.contenido;
}

module.exports = {
    abrirNota
}