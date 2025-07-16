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

module.exports = {
  abrirModalEditarRamo
}