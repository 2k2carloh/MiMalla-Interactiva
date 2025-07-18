function renderizarCalendario() {
  const diasDiv = document.getElementById('diasCalendario');
  const mesAnio = document.getElementById('mesAnio');
  diasDiv.innerHTML = '';

  const fecha = new Date(anioActual, mesActual, 1);
  const primerDia = fecha.getDay() || 7;
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();

  mesAnio.textContent = `${fecha.toLocaleString('es-ES', { month: 'long' }).toUpperCase()} ${anioActual}`;

  for (let i = 1; i < primerDia; i++) {
    const empty = document.createElement('div');
    empty.className = 'celda-dia';
    diasDiv.appendChild(empty);
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const divDia = document.createElement('div');
    divDia.className = 'celda-dia';

    const numero = document.createElement('div');
    numero.className = 'numero-dia';
    numero.textContent = dia;
    divDia.appendChild(numero);

    const key = `${anioActual}-${mesActual + 1}-${dia}`;
    const lista = document.createElement('ul');
    lista.className = 'lista-recordatorios';

    if (recordatorios[key] && recordatorios[key].length > 0) {
      divDia.classList.add('evento-marcado');

      recordatorios[key].slice(0, 3).forEach(texto => {
        const li = document.createElement('li');
        li.textContent = texto;
        lista.appendChild(li);
      });

      if (recordatorios[key].length > 3) {
        const liExtra = document.createElement('li');
        liExtra.textContent = '...';
        liExtra.style.fontWeight = 'bold';
        lista.appendChild(liExtra);
      }
    }


    divDia.appendChild(lista);

    divDia.onclick = () => {
      diaSeleccionado = key;
      abrirModalRecordatorio();
    };

    diasDiv.appendChild(divDia);
  }
}

module.exports = {
    renderizarCalendario
}