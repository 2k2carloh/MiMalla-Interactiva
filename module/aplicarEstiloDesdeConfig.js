function aplicarEstiloDesdeConfig() {
  const estilos = carrera.estilos || {};
  const fondoTipo = estilos.fondoTipo || 'color';

  if (fondoTipo === 'imagen' && estilos.fondoImagenBase64) {
    document.body.style.backgroundImage = `url('${estilos.fondoImagenBase64}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center';
  } else {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = estilos.estiloFondoPagina || '#ffffff';
  }

  document.querySelectorAll('.semestre').forEach(s => {
    s.style.backgroundColor = estilos.estiloFondoSemestres || '';
    s.style.borderColor = estilos.estiloBordeColor || '';
  });

  document.querySelectorAll('body *:not(.ramo *):not(.categoria *):not(.ramo):not(.categoria):not(#panelEstilos *):not(#panelEstilos)').forEach(el => {
    el.style.color = estilos.estiloTexto || '';
  });

  document.querySelectorAll('button:not(.ramo button):not(.categoria button):not(#panelEstilos button)').forEach(btn => {
    btn.style.backgroundColor = estilos.estiloBotones || '';
    btn.style.color = '#fff';
  });
}

module.exports = {
    aplicarEstiloDesdeConfig
}