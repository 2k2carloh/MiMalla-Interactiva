function esColorClaro(hexColor) {
  const c = hexColor.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 186;
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

module.exports = {

    actualizarColorSelectCategoria

}