function abrirModalRecordatorio() {
  const cont = document.getElementById('inputsRecordatorio');
  cont.innerHTML = '';
  const existentes = recordatorios[diaSeleccionado] || [''];

  existentes.forEach(texto => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input-recordatorio';
    input.value = texto;
    cont.appendChild(input);
  });

  document.getElementById('modalRecordatorio').style.display = 'flex';
}

module.exports = {
    abrirModalRecordatorio
}