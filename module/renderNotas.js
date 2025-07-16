function renderNotas() {
  if (!carrera.notas) carrera.notas = [];
  const cont = document.getElementById('listaNotas');
  cont.innerHTML = '';

  carrera.notas.forEach(nota => {
    const div = document.createElement('div');
    div.className = 'nota';
    div.style.background = nota.color;
    div.innerHTML = `<strong>${nota.titulo}</strong>`;
    div.onclick = () => abrirNota(nota);
    cont.appendChild(div);
  });
}

module.exports = {
  renderNotas
}