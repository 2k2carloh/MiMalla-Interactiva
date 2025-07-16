function calcularPonderacion() {
  const notas = document.querySelectorAll('.nota');
  const porcentajes = document.querySelectorAll('.porcentaje');
  let suma = 0;
  let totalPorcentaje = 0;

  for (let i = 0; i < notas.length; i++) {
    const nota = parseFloat(notas[i].value);
    const porcentaje = parseFloat(porcentajes[i].value);
    if (!isNaN(nota) && !isNaN(porcentaje)) {
      suma += nota * porcentaje;
      totalPorcentaje += porcentaje;
    }
  }

  const notaMinima = parseFloat(document.getElementById('notaMinima').value) || 40;
  let resultado = 0;

  if (totalPorcentaje > 0) {
    resultado = suma / totalPorcentaje;
  }

  ramoActualNotas.promedio = resultado;
  ramoActualNotas.notaMinima = notaMinima;

  const elResultado = document.getElementById('resultadoPonderacion');
  elResultado.textContent = `Promedio: ${resultado.toFixed(2)} (${resultado >= notaMinima ? 'Aprobado' : 'Reprobado'})`;
  elResultado.style.color = resultado >= notaMinima ? 'green' : 'red';

  const info = divRamoActualNotas.querySelector('.info-promedio');
  if (!info) {
    const span = document.createElement('span');
    span.className = 'info-promedio';
    span.style.fontSize = '12px';
    span.style.display = 'block';
    span.style.marginTop = '3px';
    divRamoActualNotas.appendChild(span);
  }
  divRamoActualNotas.querySelector('.info-promedio').textContent = `Prom: ${resultado.toFixed(2)}`;
  divRamoActualNotas.querySelector('.info-promedio').style.color = resultado >= notaMinima ? 'green' : 'red';
}

module.exports = {
    calcularPonderacion
}