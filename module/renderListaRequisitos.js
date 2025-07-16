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

module.exports = {
    renderListaRequisitos
}