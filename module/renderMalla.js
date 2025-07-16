function renderMalla() {
    const container = document.getElementById('malla');
    container.innerHTML = '';

    if (!carrera.estilos) {
        carrera.estilos = {
            fondoTipo: 'color',
            estiloFondoPagina: '#ffffff',
            estiloFondoSemestres: '#f1f1f1',
            estiloTexto: '#000000',
            estiloBordeColor: '#000000',
            estiloBotones: '#000000',
            fondoImagenBase64: null
        };
    }

    const filas = [];
    for (let i = 0; i < carrera.semestres.length; i += 5) {
        filas.push(carrera.semestres.slice(i, i + 5));
    }

    filas.forEach(fila => {
        const filaDiv = document.createElement('div');
        filaDiv.className = 'fila-semestres';

        fila.forEach(semestre => {
            const indexGlobal = carrera.semestres.indexOf(semestre);

            const divSemestre = document.createElement('div');
            divSemestre.className = 'semestre';

            divSemestre.style.background = carrera.estilos.estiloFondoSemestres;
            divSemestre.style.color = carrera.estilos.estiloTexto;

            const header = document.createElement('div');
            header.className = 'semestre-header';
            header.textContent = semestre.nombre;
            divSemestre.appendChild(header);

            semestre.ramos.forEach(ramo => {
                const divRamo = document.createElement('div');
                divRamo.className = 'ramo';
                divRamo.setAttribute("draggable", "true");

                const cat = carrera.categorias.find(c => c.id === ramo.categoriaId);
                let baseColor = cat ? cat.color : '#74b9ff';

                if (ramo.completado) {
                    baseColor = ajustarLuminosidad(baseColor, -70);
                }

                divRamo.style.background = baseColor;

                if (!ramo.desbloqueado) divRamo.classList.add('bloqueado');
                if (ramo.completado) divRamo.classList.add('completado');

                const nombre = document.createElement('span');
                nombre.textContent = ramo.nombre;
                divRamo.appendChild(nombre);

                if (ramo.promedio !== undefined) {
                    const indicador = document.createElement('div');
                    indicador.className = 'indicador-promedio';
                    indicador.style.marginTop = '6px';
                    indicador.style.padding = '4px 8px';
                    indicador.style.border = '1px solid #000';
                    indicador.style.borderRadius = '8px';
                    indicador.style.backgroundColor = '#000';
                    indicador.style.color = '#fff';
                    indicador.style.fontSize = '12px';
                    indicador.style.textAlign = 'center';
                    indicador.style.fontWeight = 'bold';
                    indicador.style.lineHeight = '1.4';
                    indicador.innerHTML = `Prom: ${ramo.promedio}`;
                    divRamo.appendChild(indicador);
                }

                divRamo.onclick = async () => {
                    if (!ramo.desbloqueado) return;
                    ramo.completado = !ramo.completado;
                    actualizarDesbloqueos();
                    renderMalla();
                    await guardarConfig();
                };

                const acciones = document.createElement('div');
                acciones.className = 'acciones';

                const btnEditar = document.createElement('button');
                btnEditar.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
                btnEditar.onclick = e => {
                    e.stopPropagation();
                    abrirModalEditarRamo(indexGlobal, ramo);
                };

                const btnEliminar = document.createElement('button');
                btnEliminar.innerHTML = `<i class="fa-solid fa-trash"></i>`;
                btnEliminar.onclick = async e => {
                    e.stopPropagation();
                    if (confirm('¿Eliminar ramo?')) {
                        semestre.ramos = semestre.ramos.filter(r => r.id !== ramo.id);
                        renderMalla();
                        await guardarConfig();
                    }
                };

                const btnNotas = document.createElement('button');
                btnNotas.innerHTML = `<i class="fa-solid fa-calculator"></i>`;
                btnNotas.title = 'Calcular ponderación';
                btnNotas.onclick = e => {
                    e.stopPropagation();
                    abrirModalNotas(ramo, divRamo);
                };

                acciones.appendChild(btnEditar);
                acciones.appendChild(btnEliminar);
                acciones.appendChild(btnNotas);
                divRamo.appendChild(acciones);

                divSemestre.appendChild(divRamo);
            });

            const btnAddRamo = document.createElement('button');
            btnAddRamo.textContent = '+';
            btnAddRamo.className = 'agregar';
            btnAddRamo.onclick = () => abrirModalAgregarRamo(indexGlobal);
            divSemestre.appendChild(btnAddRamo);

            filaDiv.appendChild(divSemestre);
        });

        container.appendChild(filaDiv);
    });

    actualizarContadorRamos();
    actualizarEstadoMallaSellada();
}

module.exports = {
    renderMalla
}