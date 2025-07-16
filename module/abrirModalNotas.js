function abrirModalNotas(ramo, divRamo) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0, 0, 0, 0.6)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 10000;

  const cont = document.createElement('div');
  cont.style.background = '#fff';
  cont.style.padding = '20px';
  cont.style.borderRadius = '10px';
  cont.style.maxWidth = '400px';
  cont.style.width = '100%';
  cont.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)';
  cont.style.position = 'relative';

  const titulo = document.createElement('h3');
  titulo.textContent = `Ponderación: ${ramo.nombre}`;
  cont.appendChild(titulo);

  const notasDiv = document.createElement('div');
  notasDiv.id = 'notasLista';
  cont.appendChild(notasDiv);

  if (!ramo.notas) ramo.notas = [];
  if (typeof ramo.notaMinima !== 'number') ramo.notaMinima = 4.0;

  function renderNotas() {
    notasDiv.innerHTML = '';
    ramo.notas.forEach((n, i) => {
      const fila = document.createElement('div');
      fila.style.display = 'flex';
      fila.style.gap = '5px';
      fila.style.alignItems = 'center';
      fila.style.marginBottom = '6px';

      const inputNota = document.createElement('input');
      inputNota.type = 'number';
      inputNota.min = 1;
      inputNota.max = 7;
      inputNota.step = 0.1;
      inputNota.value = n.nota;
      inputNota.placeholder = 'Nota';
      inputNota.style.flex = '1';

      const inputPorcentaje = document.createElement('input');
      inputPorcentaje.type = 'number';
      inputPorcentaje.min = 0;
      inputPorcentaje.max = 100;
      inputPorcentaje.value = n.porcentaje;
      inputPorcentaje.placeholder = '%';
      inputPorcentaje.style.flex = '1';

      const btnEliminar = document.createElement('button');
      btnEliminar.innerHTML = `<i class="fa-solid fa-eraser"></i>`;
      btnEliminar.style.background = 'black';
      btnEliminar.style.color = 'white';
      btnEliminar.style.border = 'none';
      btnEliminar.style.cursor = 'pointer';
      btnEliminar.style.padding = '5px 8px';
      btnEliminar.style.borderRadius = '5px';

      btnEliminar.onclick = () => {
        ramo.notas.splice(i, 1);
        renderNotas();
        calcularYReflejarPromedio(ramo, divRamo);
      };

      inputNota.oninput = () => {
        ramo.notas[i].nota = parseFloat(inputNota.value);
        calcularYReflejarPromedio(ramo, divRamo);
      };

      inputPorcentaje.oninput = () => {
        ramo.notas[i].porcentaje = parseFloat(inputPorcentaje.value);
        calcularYReflejarPromedio(ramo, divRamo);
      };

      fila.appendChild(inputNota);
      fila.appendChild(inputPorcentaje);
      fila.appendChild(btnEliminar);
      notasDiv.appendChild(fila);
    });
  }

  renderNotas();

  const inputMinima = document.createElement('input');
  inputMinima.type = 'number';
  inputMinima.min = 1;
  inputMinima.max = 7;
  inputMinima.step = 0.1;
  inputMinima.value = ramo.notaMinima || 4.0;
  inputMinima.placeholder = 'Nota mínima para aprobar';
  inputMinima.style.marginTop = '10px';
  inputMinima.style.width = '100%';
  inputMinima.oninput = () => {
    ramo.notaMinima = parseFloat(inputMinima.value);
    calcularYReflejarPromedio(ramo, divRamo);
  };
  cont.appendChild(inputMinima);

  const btnAgregarNota = document.createElement('button');
  btnAgregarNota.textContent = '+ Agregar Nota';
  btnAgregarNota.style.marginTop = '10px';
  btnAgregarNota.style.width = '100%';
  btnAgregarNota.style.background = 'black';
  btnAgregarNota.style.color = 'white';
  btnAgregarNota.style.border = 'none';
  btnAgregarNota.style.padding = '8px';
  btnAgregarNota.style.borderRadius = '5px';
  btnAgregarNota.style.cursor = 'pointer';
  btnAgregarNota.onclick = () => {
    ramo.notas.push({ nota: 0, porcentaje: 0 });
    renderNotas();
    calcularYReflejarPromedio(ramo, divRamo);
  };
  cont.appendChild(btnAgregarNota);

  const btnCerrar = document.createElement('button');
  btnCerrar.textContent = 'Cerrar';
  btnCerrar.style.marginTop = '15px';
  btnCerrar.style.width = '100%';
  btnCerrar.style.background = 'black';
  btnCerrar.style.color = 'white';
  btnCerrar.style.border = 'none';
  btnCerrar.style.padding = '8px';
  btnCerrar.style.borderRadius = '5px';
  btnCerrar.style.cursor = 'pointer';
  btnCerrar.onclick = async () => {
    await guardarConfig();
    renderMalla();
    overlay.remove();
  };
  cont.appendChild(btnCerrar);

  overlay.appendChild(cont);
  document.body.appendChild(overlay);

  calcularYReflejarPromedio(ramo, divRamo);
}

module.exports = {
    abrirModalNotas
}