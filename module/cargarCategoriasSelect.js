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

module.exports = {
    cargarCategoriasSelect
}