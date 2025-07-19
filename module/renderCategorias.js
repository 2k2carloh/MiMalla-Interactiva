const { lanzarConfirmacion } = require('./confirmacion');

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
    btnEliminar.onclick = async (e) => {
      e.stopPropagation();
      let confirmado = await lanzarConfirmacion('¿Eliminar esta categoria?')
      if (confirmado) {
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

module.exports = {
    renderCategorias
}