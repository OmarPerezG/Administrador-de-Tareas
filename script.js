document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    populateFilterOptions();

    document.getElementById('statusFilter').addEventListener('change', filterTasks);
    document.getElementById('creatorFilter').addEventListener('change', filterTasks);
    document.getElementById('priorityFilter').addEventListener('change', filterTasks);
});

document.getElementById('taskForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const taskName = `Tarea ${taskIdCounter++}`;
    const taskTypeSystem = document.getElementById('taskTypeSystem').value;
    const taskFile = document.getElementById('taskFile').value;
    const taskCreator = document.getElementById('taskCreator').value;
    const taskPriority = document.getElementById('taskPriority').value;
    const taskDate = document.getElementById('taskDate').value;
    const taskEndDate = document.getElementById('taskEndDate').value || '';
    const taskStatus = document.getElementById('taskStatus').value;
    const taskComments = document.getElementById('taskComments').value;

    addTaskToTable(taskName, taskTypeSystem, taskFile, taskCreator, taskPriority, taskDate, taskEndDate, taskStatus, taskComments);
    saveTasks();

    // Clear the form fields
    document.getElementById('taskForm').reset();
});

function addTaskToTable(taskName, taskTypeSystem, taskFile, taskCreator, taskPriority, taskDate, taskEndDate, taskStatus, taskComments) {
    const table = taskStatus === 'terminado' ? document.getElementById('completedTasksTable').querySelector('tbody') : document.getElementById('taskTable').querySelector('tbody');
    
    // Verifica si la tarea ya está en la tabla para evitar duplicados
    const existingRows = table.querySelectorAll('tr');
    for (let row of existingRows) {
        if (row.cells[0].innerText === taskName && row.querySelector('.status-select').value === taskStatus) {
            console.log('La tarea ya existe:', taskName);
            return;
        }
    }

    const row = table.insertRow();

    const cellId = row.insertCell(0);
    cellId.textContent = taskName;

    const cellSystem = row.insertCell(1);
    cellSystem.textContent = taskTypeSystem;

    const cellFile = row.insertCell(2);
    cellFile.textContent = taskFile;

    const cellCreator = row.insertCell(3);
    cellCreator.textContent = taskCreator;

    const cellPriority = row.insertCell(4);
    const selectPriority = createPrioritySelect(taskPriority);
    cellPriority.appendChild(selectPriority);

    const cellDate = row.insertCell(5);
    cellDate.textContent = taskDate;

    const cellEndDate = row.insertCell(6);
    cellEndDate.textContent = taskEndDate;

    const cellStatus = row.insertCell(7);
    const selectStatus = createStatusSelect(taskStatus);
    cellStatus.appendChild(selectStatus);

    const cellComments = row.insertCell(8);
    cellComments.textContent = taskComments;

    const cellActions = row.insertCell(9);
    if (taskStatus !== 'terminado') {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.addEventListener('click', function() {
            row.remove();
            saveTasks();
        });

        const completeButton = document.createElement('button');
        completeButton.textContent = 'Terminar';
        completeButton.addEventListener('click', function() {
            row.remove();
            addTaskToTable(taskName, taskTypeSystem, taskFile, taskCreator, taskPriority, taskDate, new Date().toISOString().split('T')[0], 'terminado', taskComments);
            saveTasks();
        });

        cellActions.appendChild(completeButton);
        cellActions.appendChild(deleteButton);
    } else {
        const reactivateButton = document.createElement('button');
        reactivateButton.textContent = 'Reactivar';
        reactivateButton.addEventListener('click', function() {
            row.remove();
            addTaskToTable(taskName, taskTypeSystem, taskFile, taskCreator, taskPriority, taskDate, '', 'pendiente', taskComments);
            saveTasks();
        });

        cellActions.appendChild(reactivateButton);
    }

    populateFilterOptions();
    filterTasks();
}

function createPrioritySelect(selectedPriority) {
    const select = document.createElement('select');
    select.classList.add('priority-select');

    const priorities = ['bajo', 'medio', 'alto'];
    priorities.forEach(priority => {
        const option = document.createElement('option');
        option.value = priority;
        option.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
        if (priority === selectedPriority) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    select.addEventListener('change', function() {
        applyPriorityColor(select);
        saveTasks();
    });

    // Apply initial color
    applyPriorityColor(select);

    return select;
}

function applyPriorityColor(selectElement) {
    switch (selectElement.value) {
        case 'bajo':
            selectElement.style.backgroundColor = 'green';
            selectElement.style.color = 'white';
            break;
        case 'medio':
            selectElement.style.backgroundColor = 'yellow';
            selectElement.style.color = 'black';
            break;
        case 'alto':
            selectElement.style.backgroundColor = 'red';
            selectElement.style.color = 'white';
            break;
        default:
            selectElement.style.backgroundColor = '';
            selectElement.style.color = '';
            break;
    }
}

function createStatusSelect(selectedStatus) {
    const select = document.createElement('select');
    select.classList.add('status-select');

    const statuses = ['pendiente', 'en progreso', 'terminado'];
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        if (status === selectedStatus) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    select.addEventListener('change', function() {
        const row = select.closest('tr');
        const table = select.value === 'terminado' ? document.getElementById('completedTasksTable').querySelector('tbody') : document.getElementById('taskTable').querySelector('tbody');

        row.remove();
        table.appendChild(row);
        saveTasks();
        populateFilterOptions();
    });

    return select;
}

function saveTasks() {
    const tasks = [];

    document.querySelectorAll('#taskTable tbody tr, #completedTasksTable tbody tr').forEach(row => {
        tasks.push({
            name: row.cells[0].innerText,
            typeSystem: row.cells[1].innerText,
            file: row.cells[2].innerText,
            creator: row.cells[3].innerText,
            priority: row.querySelector('.priority-select').value,
            date: row.cells[5].innerText,
            endDate: row.cells[6].innerText,
            status: row.querySelector('.status-select').value,
            comments: row.cells[8].innerText
        });
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    tasks.forEach(task => {
        addTaskToTable(task.name, task.typeSystem, task.file, task.creator, task.priority, task.date, task.endDate, task.status, task.comments);
    });
}

function populateFilterOptions() {
    const statusFilter = document.getElementById('statusFilter');
    const creatorFilter = document.getElementById('creatorFilter');
    const priorityFilter = document.getElementById('priorityFilter');

    const statusOptions = new Set();
    const creatorOptions = new Set();
    const priorityOptions = new Set();

    document.querySelectorAll('#taskTable tbody tr, #completedTasksTable tbody tr').forEach(row => {
        statusOptions.add(row.querySelector('.status-select').value.toLowerCase());
        creatorOptions.add(row.cells[3].innerText.toLowerCase());
        priorityOptions.add(row.querySelector('.priority-select').value.toLowerCase());
    });

    populateSelectOptions(statusFilter, Array.from(statusOptions));
    populateSelectOptions(creatorFilter, Array.from(creatorOptions));
    populateSelectOptions(priorityFilter, Array.from(priorityOptions));
}

function populateSelectOptions(selectElement, options) {
    selectElement.innerHTML = '<option value="">Todos</option>';
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
        selectElement.appendChild(optionElement);
    });
}

function filterTasks() {
    const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
    const creatorFilter = document.getElementById('creatorFilter').value.toLowerCase();
    const priorityFilter = document.getElementById('priorityFilter').value.toLowerCase();

    document.querySelectorAll('#taskTable tbody tr').forEach(row => {
        const status = row.querySelector('.status-select').value.toLowerCase();
        const creator = row.cells[3].innerText.toLowerCase();
        const priority = row.querySelector('.priority-select').value.toLowerCase();

        const shouldShow = (statusFilter === '' || status === statusFilter) &&
                           (creatorFilter === '' || creator === creatorFilter) &&
                           (priorityFilter === '' || priority === priorityFilter);

        row.style.display = shouldShow ? '' : 'none';
    });

    document.querySelectorAll('#completedTasksTable tbody tr').forEach(row => {
        const status = row.querySelector('.status-select').value.toLowerCase();
        const creator = row.cells[3].innerText.toLowerCase();
        const priority = row.querySelector('.priority-select').value.toLowerCase();

        const shouldShow = (statusFilter === '' || status === statusFilter) &&
                           (creatorFilter === '' || creator === creatorFilter) &&
                           (priorityFilter === '' || priority === priorityFilter);

        row.style.display = shouldShow ? '' : 'none';
    });
}
