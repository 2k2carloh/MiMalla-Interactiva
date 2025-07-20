function aplicarEstiloDesdeConfig() {
  const estilos = carrera.estilos || {};
  const fondoTipo = estilos.fondoTipo || 'color';

  if (fondoTipo === 'imagen' && estilos.fondoImagenBase64) {
    document.body.style.backgroundImage = `url('${estilos.fondoImagenBase64}')`;
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = estilos.estiloFondoPagina || '#ffffff';
  }

  document.querySelectorAll('.semestre').forEach(s => {
    s.style.backgroundColor = estilos.estiloFondoSemestres || '#fafafa';
    s.style.borderColor = estilos.estiloBordeColor || '#ddd';
    s.style.color = estilos.estiloTexto || '#000';
  });

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
      el.style.color = estilos.estiloTexto || '#000';
    }
  });

  document.querySelectorAll('button:not(.ramo button):not(.categoria button):not(#panelEstilos button)').forEach(btn => {
    btn.style.backgroundColor = estilos.estiloBotones || '#000';
    btn.style.color = '#fff';
  });

  ['btnIrANotas', 'btnEstilos', 'btnIrACalendario'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.style.color = '#fff';
    }
  });

  const categoriasPanel = document.getElementById('panelCategorias');
  if (categoriasPanel && estilos.colorCategoria) {
    categoriasPanel.style.backgroundColor = estilos.colorCategoria;
  }

  const calendarioCont = document.getElementById('calendarioContainer');
  if (calendarioCont && estilos.estiloCalendario) {
    calendarioCont.style.backgroundColor = estilos.estiloCalendario;
  }
}

module.exports = {
  aplicarEstiloDesdeConfig
};