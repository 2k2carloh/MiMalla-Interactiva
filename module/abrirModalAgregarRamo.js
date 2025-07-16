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

module.exports = {
  abrirModalAgregarRamo
}