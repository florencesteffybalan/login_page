document.addEventListener('DOMContentLoaded', () => {
    // =============================================
    //  AUTHENTICATION CHECK
    // =============================================
    const userSessionRaw = localStorage.getItem('userSession');
    if (!userSessionRaw) {
        // Not logged in, redirect to login page
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userSessionRaw);

    // =============================================
    //  POPULATE USER DATA
    // =============================================
    const sidebarBrand = document.getElementById('sidebarBrand');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const welcomeGreeting = document.getElementById('welcomeGreeting');
    const headerAvatar = document.getElementById('headerAvatar');

    if(sidebarBrand) sidebarBrand.textContent = user.name;
    if(userNameDisplay) userNameDisplay.textContent = user.name;
    if(headerAvatar) {
        const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        headerAvatar.textContent = initials;
    }
    
    // Welcome Greeting (first name)
    const firstName = user.name.split(' ')[0];
    
    // Add time-based greeting
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    
    welcomeGreeting.textContent = `${greeting}, ${firstName}!`;

    // Avatar Initials
    const initials = user.name.split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    headerAvatar.textContent = initials;

    // =============================================
    //  MOCK ACADEMIC DATA
    // =============================================
    
    function populateAssignments() {
        const tbody = document.getElementById('assignmentsTableBody');
        tbody.innerHTML = ''; 

        const assignments = [
            { subject: 'Advanced Mathematics', name: 'Problem Set 4: Calculus', due: 'Tomorrow', status: 'Pending', statusClass: 'orange' },
            { subject: 'Computer Science', name: 'Data Structures Project', due: 'In 3 days', status: 'In Progress', statusClass: 'orange' },
            { subject: 'Physics', name: 'Lab Report: Thermodynamics', due: 'Next Week', status: 'Pending', statusClass: 'inactive' },
            { subject: 'Literature', name: 'Essay on Shakespeare', due: 'Last Week', status: 'Submitted', statusClass: 'green' }
        ];

        assignments.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <span style="font-weight: 500;">${a.subject}</span>
                </td>
                <td style="color: var(--text-secondary);">${a.name}</td>
                <td>${a.due}</td>
                <td><span class="status-badge ${a.statusClass}">${a.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    function populateTimeTable() {
        const container = document.getElementById('timetableBody');
        container.innerHTML = ''; 

        const classes = [
            { time: '08:30 AM', subject: 'Computer Science', room: 'Lab 402', color: 'bg-blue' },
            { time: '10:00 AM', subject: 'Advanced Mathematics', room: 'Room 210', color: 'bg-green' },
            { time: '11:30 AM', subject: 'Physics', room: 'Lab 105', color: 'bg-orange' },
            { time: '01:00 PM', subject: 'Lunch Break', room: 'Cafeteria', color: 'bg-blue' }
        ];

        classes.forEach(c => {
            const div = document.createElement('div');
            div.className = 'security-item';
            
            // Reusing security-item styling for the timetable entries
            div.innerHTML = `
                <div class="sec-icon ${c.color}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div class="sec-info">
                    <h4>${c.subject}</h4>
                    <p>${c.room}</p>
                </div>
                <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">
                    ${c.time}
                </div>
            `;
            container.appendChild(div);
        });
    }

    // Load data immediately
    populateAssignments();
    populateTimeTable();

    // =============================================
    //  NAVIGATION OVERRIDES
    // =============================================
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.textContent.includes('Attendance')) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'attendance.html';
            });
        }
        if (item.textContent.includes('Marks')) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'marks.html';
            });
        }
        if (item.textContent.includes('Assignments')) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'assignments.html';
            });
        }
        if (item.textContent.includes('Time Table')) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'timetable.html';
            });
        }
    });

    // =============================================
    //  LOGOUT HANDLER
    // =============================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear session
            localStorage.removeItem('userSession');
            // Redirect to login
            window.location.href = 'index.html';
        });
    }
});
