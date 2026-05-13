document.addEventListener('DOMContentLoaded', () => {
    // =============================================
    //  AUTHENTICATION CHECK
    // =============================================
    const userSessionRaw = localStorage.getItem('userSession');
    if (!userSessionRaw) {
        window.location.href = 'index.html';
        return;
    }
    const user = JSON.parse(userSessionRaw);

    // =============================================
    //  POPULATE USER DATA
    // =============================================
    const sidebarBrand = document.getElementById('sidebarBrand');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const headerAvatar = document.getElementById('headerAvatar');

    if(sidebarBrand) sidebarBrand.textContent = user.name;
    if(userNameDisplay) userNameDisplay.textContent = user.name;
    if(headerAvatar) {
        const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        headerAvatar.textContent = initials;
    }
    if(headerAvatar) {
        const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        headerAvatar.textContent = initials;
    }

    // =============================================
    //  TIMETABLE CONFIGURATION
    // =============================================
    const timeSlots = [
        { time: '09:00 - 10:00', type: 'class' },
        { time: '10:00 - 11:00', type: 'class' },
        { time: '11:00 - 11:15', type: 'break', label: 'Morning Interval' },
        { time: '11:15 - 12:15', type: 'class' },
        { time: '12:15 - 01:15', type: 'break', label: 'Lunch Break' },
        { time: '01:15 - 02:15', type: 'class' },
        { time: '02:15 - 02:30', type: 'break', label: 'Afternoon Interval' },
        { time: '02:30 - 03:30', type: 'class' },
        { time: '03:30 - 04:30', type: 'class' }
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const mockSchedule = {
        'CSE-4-A': {
            'Monday': [
                { subject: 'Operating Systems', faculty: 'Prof. Linus T.', room: 'C-302', mode: 'Offline' },
                { subject: 'Computer Networks', faculty: 'Dr. Vint Cerf', room: 'Lab-2', mode: 'Offline' },
                null, // Break
                { subject: 'Software Eng.', faculty: 'Dr. Margaret H.', room: 'C-302', mode: 'Online' },
                null, // Break
                { subject: 'Database Systems', faculty: 'Prof. Edgar C.', room: 'Lab-4', mode: 'Offline' },
                null, // Break
                { subject: 'Microprocessors', faculty: 'Dr. Gordon M.', room: 'C-305', mode: 'Offline' },
                { subject: 'Aptitude Class', faculty: 'Mr. Ramanujan', room: 'C-302', mode: 'Offline' }
            ],
            'Tuesday': [
                { subject: 'Computer Networks', faculty: 'Dr. Vint Cerf', room: 'C-302', mode: 'Offline' },
                { subject: 'Operating Systems', faculty: 'Prof. Linus T.', room: 'Lab-1', mode: 'Offline' },
                null,
                { subject: 'Database Systems', faculty: 'Prof. Edgar C.', room: 'C-302', mode: 'Offline' },
                null,
                { subject: 'Web Technologies', faculty: 'Mr. Tim B.L.', room: 'Lab-5', mode: 'Online' },
                null,
                { subject: 'Software Eng.', faculty: 'Dr. Margaret H.', room: 'C-302', mode: 'Offline' },
                { subject: 'Library Hour', faculty: 'Staff', room: 'Lib', mode: 'Offline' }
            ],
            'Wednesday': [
                { subject: 'Database Systems', faculty: 'Prof. Edgar C.', room: 'C-302', mode: 'Offline' },
                { subject: 'Microprocessors', faculty: 'Dr. Gordon M.', room: 'Lab-3', mode: 'Offline' },
                null,
                { subject: 'Operating Systems', faculty: 'Prof. Linus T.', room: 'C-302', mode: 'Offline' },
                null,
                { subject: 'Computer Networks', faculty: 'Dr. Vint Cerf', room: 'C-305', mode: 'Offline' },
                null,
                { subject: 'Value Education', faculty: 'Dr. Kalam', room: 'Auditorium', mode: 'Offline' },
                { subject: 'Web Technologies', faculty: 'Mr. Tim B.L.', room: 'C-302', mode: 'Online' }
            ],
            'Thursday': [
                { subject: 'Software Eng.', faculty: 'Dr. Margaret H.', room: 'Lab-2', mode: 'Offline' },
                { subject: 'Database Systems', faculty: 'Prof. Edgar C.', room: 'C-302', mode: 'Offline' },
                null,
                { subject: 'Computer Networks', faculty: 'Dr. Vint Cerf', room: 'C-302', mode: 'Offline' },
                null,
                { subject: 'Microprocessors', faculty: 'Dr. Gordon M.', room: 'C-305', mode: 'Offline' },
                null,
                { subject: 'Operating Systems', faculty: 'Prof. Linus T.', room: 'C-302', mode: 'Offline' },
                { subject: 'Technical Seminar', faculty: 'HOD', room: 'Seminar Hall', mode: 'Offline' }
            ],
            'Friday': [
                { subject: 'Web Technologies', faculty: 'Mr. Tim B.L.', room: 'C-302', mode: 'Offline' },
                { subject: 'Software Eng.', faculty: 'Dr. Margaret H.', room: 'C-302', mode: 'Offline' },
                null,
                { subject: 'Operating Systems', faculty: 'Prof. Linus T.', room: 'Lab-1', mode: 'Offline' },
                null,
                { subject: 'Microprocessors', faculty: 'Dr. Gordon M.', room: 'C-302', mode: 'Offline' },
                null,
                { subject: 'Database Systems', faculty: 'Prof. Edgar C.', room: 'Lab-4', mode: 'Offline' },
                { subject: 'Placement Training', faculty: 'TPO', room: 'C-302', mode: 'Offline' }
            ]
        }
    };

    function renderTimetable() {
        const grid = document.getElementById('timetableGrid');
        const dept = document.getElementById('deptSelect').value;
        const sem = document.getElementById('semSelect').value;
        const section = document.getElementById('sectionSelect').value;
        const key = `${dept}-${sem}-${section}`;
        
        // Update title
        document.getElementById('tableTitle').textContent = `B.Tech ${dept} - Semester ${sem} (Sec ${section})`;

        // Clear existing cells except headers
        const headers = Array.from(grid.querySelectorAll('.grid-header'));
        grid.innerHTML = '';
        headers.forEach(h => grid.appendChild(h));

        const schedule = mockSchedule[key] || mockSchedule['CSE-4-A']; // Fallback to mock

        timeSlots.forEach((slot, slotIndex) => {
            // Add Time Column
            const timeCol = document.createElement('div');
            timeCol.className = 'time-col';
            timeCol.textContent = slot.time;
            grid.appendChild(timeCol);

            if (slot.type === 'break') {
                const breakCell = document.createElement('div');
                breakCell.className = 'break-cell';
                breakCell.textContent = slot.label;
                grid.appendChild(breakCell);
            } else {
                // Add Day Cells
                days.forEach(day => {
                    const cell = document.createElement('div');
                    cell.className = 'timetable-cell';
                    
                    const classData = schedule[day][slotIndex];
                    if (classData) {
                        const isLab = classData.room.toLowerCase().includes('lab');
                        const isOnline = classData.mode.toLowerCase() === 'online';
                        
                        cell.innerHTML = `
                            <div class="class-card ${isLab ? 'lab' : ''} ${isOnline ? 'online' : 'offline'}">
                                <div class="class-subject">${classData.subject}</div>
                                <div class="class-info">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    ${classData.faculty}
                                </div>
                                <div class="class-info">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    ${classData.room}
                                </div>
                                <div class="class-footer">
                                    <span class="mode-badge ${isOnline ? 'mode-online' : 'mode-offline'}">${classData.mode}</span>
                                    <a href="attendance.html" class="attendance-link">Attendance</a>
                                </div>
                            </div>
                        `;
                    }
                    
                    grid.appendChild(cell);
                });
            }
        });

        checkUpcomingClass(schedule);
    }

    function checkUpcomingClass(schedule) {
        const notifContainer = document.getElementById('notifContainer');
        notifContainer.innerHTML = '';

        const now = new Date();
        const currentDayName = days[now.getDay() - 1]; // 0 is Sunday, 1 is Monday
        
        if (!currentDayName) return; // Weekend

        const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        
        // Find next class
        let nextClass = null;
        let nextTime = '';

        for (let i = 0; i < timeSlots.length; i++) {
            if (timeSlots[i].type === 'class') {
                const startTime = timeSlots[i].time.split(' - ')[0];
                if (startTime > currentTimeStr) {
                    nextClass = schedule[currentDayName][i];
                    nextTime = startTime;
                    if (nextClass) break;
                }
            }
        }

        if (nextClass) {
            const banner = document.createElement('div');
            banner.className = 'notification-banner';
            banner.innerHTML = `
                <div class="notif-content">
                    <div class="notif-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </div>
                    <div class="notif-text">
                        <h4>Upcoming Class: ${nextClass.subject}</h4>
                        <p>Starts at ${nextTime} in ${nextClass.room} with ${nextClass.faculty}</p>
                    </div>
                </div>
                ${nextClass.mode === 'Online' ? '<button class="join-btn">Join Meeting</button>' : ''}
            `;
            notifContainer.appendChild(banner);
        }
    }

    // Event Listeners
    document.getElementById('deptSelect').addEventListener('change', renderTimetable);
    document.getElementById('semSelect').addEventListener('change', renderTimetable);
    document.getElementById('sectionSelect').addEventListener('change', renderTimetable);

    // Initial Render
    renderTimetable();

    // Set Current Day
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('currentDay').textContent = now.toLocaleDateString('en-US', options);

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('userSession');
            window.location.href = 'index.html';
        };
    }

    // Navigation Overrides
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.textContent.includes('Dashboard')) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'dashboard.html';
            });
        }
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
    });
});
