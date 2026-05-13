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
        const initials = user.name.split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
        headerAvatar.textContent = initials;
    }

    // =============================================
    //  MOCK ASSIGNMENT DATA
    // =============================================
    const assignmentsData = {
        '1': [
            { id: 1, code: 'CS101', subject: 'Programming Fundamentals', faculty: 'Dr. Alan Turing', deadline: '2025-12-10T23:59:00', status: 'Graded', score: '95/100' },
            { id: 2, code: 'MA101', subject: 'Mathematics I', faculty: 'Dr. Isaac Newton', deadline: '2025-12-15T23:59:00', status: 'Submitted', file: 'math_assignment_v1.pdf' }
        ],
        '4': [
            { id: 10, code: 'CS202', subject: 'Operating Systems', faculty: 'Prof. Linus Torvalds', deadline: '2026-05-15T23:59:00', status: 'Pending' },
            { id: 11, code: 'CS204', subject: 'Computer Networks', faculty: 'Dr. Vint Cerf', deadline: '2026-05-13T10:00:00', status: 'Pending' },
            { id: 12, code: 'MA201', subject: 'Discrete Mathematics', faculty: 'Dr. Ada Lovelace', deadline: '2026-05-20T23:59:00', status: 'Pending' }
        ]
    };

    function renderAssignments(semester) {
        const container = document.getElementById('assignmentsContainer');
        if (!container) return;
        container.innerHTML = '';

        const data = assignmentsData[semester] || [];
        const now = new Date();

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'assignment-card';
            
            const deadlineDate = new Date(item.deadline);
            const diffMs = deadlineDate - now;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            
            let statusBadgeClass = 'inactive';
            if (item.status === 'Pending') statusBadgeClass = 'orange';
            if (item.status === 'Submitted') statusBadgeClass = 'green';
            if (item.status === 'Graded') statusBadgeClass = 'active';

            let reminderHtml = '';
            if (item.status === 'Pending') {
                if (diffDays < 0) {
                    reminderHtml = `<div class="info-row overdue"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Overdue!</div>`;
                } else if (diffDays <= 2) {
                    reminderHtml = `<div class="info-row reminder"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> Deadline approaching! (${diffDays} days left)</div>`;
                }
            }

            let submissionContent = '';
            if (item.status === 'Pending') {
                submissionContent = `
                    <div class="submission-area" id="area-${item.id}">
                        <div class="upload-zone" onclick="document.getElementById('file-${item.id}').click()" ondragover="this.classList.add('dragover'); event.preventDefault();" ondragleave="this.classList.remove('dragover')" ondrop="handleDrop(event, ${item.id})">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            <p>Drag & drop or <b>browse</b> file</p>
                            <span class="formats">PDF, DOCX accepted</span>
                            <input type="file" class="file-input" id="file-${item.id}" accept=".pdf,.docx" onchange="handleFileSelect(event, ${item.id})">
                        </div>
                        <div id="file-info-${item.id}" style="display:none; font-size: 12px; color: var(--accent); font-weight: 600;"></div>
                        <textarea class="comment-box" placeholder="Add comments..."></textarea>
                        <button class="primary-btn" onclick="submitAssignment(${item.id})">Submit Assignment</button>
                    </div>
                `;
            } else {
                submissionContent = `
                    <div class="submitted-view">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <div class="submitted-info">
                            <h4>${item.status === 'Graded' ? 'Graded: ' + item.score : 'Submitted'}</h4>
                            <p>${item.file || 'Assignment submitted successfully'}</p>
                        </div>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="assignment-header">
                    <div class="subject-info">
                        <h3>${item.subject} (${item.code})</h3>
                        <span class="faculty">Faculty: ${item.faculty}</span>
                    </div>
                    <span class="status-badge ${statusBadgeClass}" id="status-${item.id}">${item.status}</span>
                </div>
                <div class="assignment-details">
                    <div class="info-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Due: ${deadlineDate.toLocaleDateString()} ${deadlineDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    ${reminderHtml}
                </div>
                ${submissionContent}
            `;
            container.appendChild(card);
        });
    }

    // Global handlers
    window.handleFileSelect = (event, id) => {
        const file = event.target.files[0];
        if (file) {
            const info = document.getElementById(`file-info-${id}`);
            info.textContent = `Selected: ${file.name}`;
            info.style.display = 'block';
        }
    };

    window.handleDrop = (event, id) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.docx'))) {
            const info = document.getElementById(`file-info-${id}`);
            info.textContent = `Selected: ${file.name}`;
            info.style.display = 'block';
        } else {
            alert('Please upload PDF or DOCX files only.');
        }
    };

    window.submitAssignment = (id) => {
        const info = document.getElementById(`file-info-${id}`);
        if (!info || info.style.display === 'none') {
            alert('Please select a file first.');
            return;
        }
        
        const area = document.getElementById(`area-${id}`);
        area.innerHTML = `
            <div class="submitted-view">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <div class="submitted-info">
                    <h4>Done</h4>
                    <p>${info.textContent.replace('Selected: ', '')}</p>
                </div>
            </div>
        `;

        const statusBadge = document.getElementById(`status-${id}`);
        if (statusBadge) {
            statusBadge.textContent = 'Done';
            statusBadge.className = 'status-badge green';
        }
    };

    const semesterSelect = document.getElementById('semesterSelect');
    if (semesterSelect) {
        renderAssignments(semesterSelect.value);
        semesterSelect.addEventListener('change', (e) => renderAssignments(e.target.value));
    }

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.textContent.includes('Dashboard')) item.onclick = () => window.location.href = 'dashboard.html';
        if (item.textContent.includes('Attendance')) item.onclick = () => window.location.href = 'attendance.html';
        if (item.textContent.includes('Marks')) item.onclick = () => window.location.href = 'marks.html';
        if (item.textContent.includes('Time Table')) item.onclick = () => window.location.href = 'timetable.html';
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('userSession');
            window.location.href = 'index.html';
        };
    }
});
