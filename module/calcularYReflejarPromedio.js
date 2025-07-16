function calcularYReflejarPromedio(ramo, divRamo) {
  let total = 0;
  let acumulado = 0;
  ramo.notas.forEach(n => {
    const nota = parseFloat(n.nota);
    const porc = parseFloat(n.porcentaje);
    if (!isNaN(nota) && !isNaN(porc)) {
      total += porc;
      acumulado += nota * porc;
    }
  });

  if (total > 0) {
    const promedio = acumulado / total;
    ramo.promedio = parseFloat(promedio.toFixed(2));
  } else {
    delete ramo.promedio;
  }

  if (divRamo) {
    const existente = divRamo.querySelector('.promedio-ramo');
    if (existente) existente.remove();

    if (ramo.promedio) {
      const box = document.createElement('div');
      box.className = 'promedio-ramo';
      box.style.marginTop = '6px';
      box.style.fontSize = '12px';
      box.style.padding = '6px 8px';
      box.style.borderRadius = '8px';
      box.style.background = '#000';
      box.style.color = '#fff';
      box.style.border = '1px solid white';
      box.style.textAlign = 'center';
      box.style.fontWeight = 'bold';
      box.style.lineHeight = '1.4';

      box.innerHTML = `Prom: ${ramo.promedio}<br><small style="font-weight: normal">Nota mínima: ${ramo.notaMinima}</small>`;

      divRamo.appendChild(box);
    }
  }
}

module.exports = {
  calcularYReflejarPromedio
}