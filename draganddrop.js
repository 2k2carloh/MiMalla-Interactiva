let dragged = null;

function setDragAndDrop() {
    const ramos = document.querySelectorAll(".ramo");
    const semestres = document.querySelectorAll(".semestre");

    ramos.forEach(ramo => {
        ramo.setAttribute("draggable", true);

        ramo.addEventListener("dragstart", e => {
            dragged = ramo;
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", null); // Safari fix
            ramo.classList.add("dragging");
        });

        ramo.addEventListener("dragend", () => {
            dragged = null;
            ramo.classList.remove("dragging");
        });
    });

    semestres.forEach(sem => {
        sem.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";

            const afterElement = getDragAfterElement(sem, e.clientY);
            const addButton = sem.querySelector("button.agregar");

            if (afterElement == null) {
                if (addButton) {
                    sem.insertBefore(dragged, addButton);
                } else {
                    sem.appendChild(dragged);
                }
            } else {
                sem.insertBefore(dragged, afterElement);
            }
        });

        sem.addEventListener("drop", e => {
            e.preventDefault();
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".ramo:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}