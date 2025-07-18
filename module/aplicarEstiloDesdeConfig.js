function aplicarEstiloDesdeConfig() {
  const estilos = carrera.estilos || {};
  const fondoTipo = estilos.fondoTipo || 'color';

  // Fondo general de la página
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

  // Estilo de los semestres
  document.querySelectorAll('.semestre').forEach(s => {
    s.style.backgroundColor = estilos.estiloFondoSemestres || '#fafafa';
    s.style.borderColor = estilos.estiloBordeColor || '#ddd';
    s.style.color = estilos.estiloTexto || '#000';
  });

  // Aplicar color de texto, evitando botones flotantes, ramos, categorías y panel de estilos
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

  // Aplicar estilos a botones normales (no flotantes)
  document.querySelectorAll('button:not(.ramo button):not(.categoria button):not(#panelEstilos button)').forEach(btn => {
    btn.style.backgroundColor = estilos.estiloBotones || '#000';
    btn.style.color = '#fff';
  });

  // Forzar color blanco en botones flotantes
  ['btnIrANotas', 'btnEstilos', 'btnIrACalendario'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.style.color = '#fff';
    }
  });

  // Fondo para contenedor de categorías
  const contCategoria = document.getElementById('categoria-color');
  if (contCategoria && estilos.colorCategoria) {
    contCategoria.style.backgroundColor = estilos.colorCategoria;
  }

  // Fondo para contenedor de calendario
  const calendarioCont = document.getElementById('calendarioContainer');
  if (calendarioCont && estilos.fondoCalendario) {
    calendarioCont.style.backgroundColor = estilos.fondoCalendario;
  }
}

module.exports = {
  aplicarEstiloDesdeConfig
};
