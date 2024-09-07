import { backend } from 'declarations/backend';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const GOAL_OUNCES = 64;
let currentView = 'daily';
let currentDate = new Date();
let waterIntake = {};

async function initializeApp() {
    const intakeData = await backend.getWaterIntake();
    waterIntake = Object.fromEntries(intakeData);
    updateView();
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function updateView() {
    updateDateDisplay();
    updateTrackerContent();
    updateTotalIntake();
}

function updateDateDisplay() {
    const dateDisplay = document.getElementById('dateDisplay');
    if (currentView === 'daily') {
        dateDisplay.textContent = currentDate.toDateString();
    } else if (currentView === 'weekly') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        dateDisplay.textContent = `${startOfWeek.toDateString()} - ${endOfWeek.toDateString()}`;
    } else if (currentView === 'monthly') {
        dateDisplay.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
}

function updateTrackerContent() {
    const trackerContent = document.getElementById('trackerContent');
    trackerContent.innerHTML = '';

    if (currentView === 'daily') {
        trackerContent.appendChild(createDayRow(currentDate));
    } else if (currentView === 'weekly') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            trackerContent.appendChild(createDayRow(date));
        }
    } else if (currentView === 'monthly') {
        trackerContent.appendChild(createMonthlyGrid());
    }
}

function createDayRow(date) {
    const row = document.createElement('div');
    row.className = 'day-row';
    const formattedDate = formatDate(date);

    const dayLabel = document.createElement('span');
    dayLabel.className = 'day-label';
    dayLabel.textContent = DAYS_OF_WEEK[date.getDay()];
    row.appendChild(dayLabel);

    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = `${((waterIntake[formattedDate] || 0) / GOAL_OUNCES) * 100}%`;
    progressContainer.appendChild(progressBar);
    row.appendChild(progressContainer);

    const intakeValue = document.createElement('span');
    intakeValue.className = 'intake-value';
    intakeValue.textContent = `${waterIntake[formattedDate] || 0} oz`;
    row.appendChild(intakeValue);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'intake-buttons';
    const decrementButton = createIntakeButton('-', () => updateIntake(formattedDate, -8));
    const incrementButton = createIntakeButton('+', () => updateIntake(formattedDate, 8));
    buttonsContainer.appendChild(decrementButton);
    buttonsContainer.appendChild(incrementButton);
    row.appendChild(buttonsContainer);

    return row;
}

function createMonthlyGrid() {
    const grid = document.createElement('div');
    grid.className = 'monthly-grid';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        grid.appendChild(document.createElement('div'));
    }

    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const formattedDate = formatDate(date);
        const dayCell = document.createElement('div');
        dayCell.className = 'monthly-day';

        const fillElement = document.createElement('div');
        fillElement.className = 'monthly-day-fill';
        fillElement.style.height = `${((waterIntake[formattedDate] || 0) / GOAL_OUNCES) * 100}%`;
        dayCell.appendChild(fillElement);

        const contentElement = document.createElement('div');
        contentElement.className = 'monthly-day-content';
        contentElement.innerHTML = `
            <span>${day}</span>
            <span>${waterIntake[formattedDate] || 0}oz</span>
        `;
        dayCell.appendChild(contentElement);

        dayCell.addEventListener('click', () => {
            updateIntake(formattedDate, 8);
        });

        grid.appendChild(dayCell);
    }

    return grid;
}

function createIntakeButton(text, onClick) {
    const button = document.createElement('button');
    button.className = 'intake-button';
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

async function updateIntake(date, amount) {
    const newAmount = Math.max(0, Math.min((waterIntake[date] || 0) + amount, GOAL_OUNCES));
    waterIntake[date] = newAmount;
    const updatedData = await backend.updateWaterIntake(date, newAmount);
    waterIntake = Object.fromEntries(updatedData);
    updateView();
}

function updateTotalIntake() {
    const totalIntake = Object.values(waterIntake).reduce((a, b) => a + b, 0);
    document.getElementById('totalIntake').textContent = `${totalIntake} oz`;

    let goal;
    if (currentView === 'daily') {
        goal = GOAL_OUNCES;
    } else if (currentView === 'weekly') {
        goal = GOAL_OUNCES * 7;
    } else if (currentView === 'monthly') {
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        goal = GOAL_OUNCES * daysInMonth;
    }
    document.getElementById('goalDisplay').textContent = `Goal: ${goal} oz`;
}

function navigateDate(direction) {
    if (currentView === 'daily') {
        currentDate.setDate(currentDate.getDate() + direction);
    } else if (currentView === 'weekly') {
        currentDate.setDate(currentDate.getDate() + direction * 7);
    } else if (currentView === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + direction);
    }
    updateView();
}

document.querySelectorAll('.view-button').forEach(button => {
    button.addEventListener('click', () => {
        currentView = button.dataset.view;
        document.querySelector('.view-button.active').classList.remove('active');
        button.classList.add('active');
        updateView();
    });
});

document.getElementById('prevButton').addEventListener('click', () => navigateDate(-1));
document.getElementById('nextButton').addEventListener('click', () => navigateDate(1));

// Initialize the app
initializeApp();
feather.replace();