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
    //  MOCK MARKS DATA BY SEMESTER
    // =============================================
    const marksDataBySemester = {
        '1': [
            { code: 'CS101', name: 'Programming Fundamentals', credits: 4, internal: 20, lab: 22, semester: 42 },
            { code: 'MA101', name: 'Mathematics I', credits: 4, internal: 18, lab: 20, semester: 38 },
            { code: 'PH101', name: 'Engineering Physics', credits: 3, internal: 15, lab: 18, semester: 35 }
        ],
        '2': [
            { code: 'CS102', name: 'Data Structures', credits: 4, internal: 22, lab: 24, semester: 45 },
            { code: 'MA102', name: 'Mathematics II', credits: 4, internal: 14, lab: 16, semester: 18 }, // Reappear example
            { code: 'CH101', name: 'Engineering Chemistry', credits: 3, internal: 19, lab: 21, semester: 40 }
        ],
        '3': [
            { code: 'CS201', name: 'Algorithms', credits: 4, internal: 21, lab: 23, semester: 43 },
            { code: 'CS203', name: 'Database Systems', credits: 4, internal: 20, lab: 22, semester: 41 },
            { code: 'EE201', name: 'Digital Logic', credits: 3, internal: 17, lab: 19, semester: 36 }
        ],
        '4': [
            { code: 'CS202', name: 'Operating Systems', credits: 4, internal: 21, lab: 23, semester: 40 },
            { code: 'CS204', name: 'Computer Networks', credits: 4, internal: 23, lab: 24, semester: 45 },
            { code: 'MA201', name: 'Discrete Mathematics', credits: 4, internal: 18, lab: 19, semester: 38 },
            { code: 'HU201', name: 'Technical English', credits: 2, internal: 19, lab: 20, semester: 42 }
        ]
    };

    let currentSemesterData = [];

    function populateMarksTable(semester) {
        const tbody = document.getElementById('marksTableBody');
        if (!tbody) return;
        tbody.innerHTML = ''; 

        currentSemesterData = marksDataBySemester[semester] || [];
        
        let totalCreditsEarned = 0;
        let subjectsPassed = 0;
        let subjectsReappear = 0;
        let totalPoints = 0; // For simple GPA calculation

        currentSemesterData.forEach(d => {
            const tr = document.createElement('tr');
            
            const totalMarks = d.internal + d.lab + d.semester;
            
            // Logic for passing: needs >= 50 total and >= 20 (40%) in semester exam
            let result = 'Pass';
            let statusClass = 'green';
            if (totalMarks < 50 || d.semester < 20) {
                result = 'Reappear';
                statusClass = 'red';
                subjectsReappear++;
            } else {
                subjectsPassed++;
                totalCreditsEarned += d.credits;
                
                // Simple GPA point calc: 10 points for >90, 9 for >80, etc.
                let gradePoint = Math.max(4, Math.floor(totalMarks / 10));
                if (totalMarks >= 90) gradePoint = 10;
                totalPoints += (gradePoint * d.credits);
            }

            tr.innerHTML = `
                <td><span style="font-weight: 600; color: var(--text-secondary);">${d.code}</span></td>
                <td><span style="font-weight: 500;">${d.name}</span></td>
                <td>${d.credits}</td>
                <td>${d.internal}</td>
                <td>${d.lab}</td>
                <td>${d.semester}</td>
                <td><strong style="font-size: 15px;">${totalMarks}</strong></td>
                <td><span class="status-badge ${statusClass}">${result}</span></td>
            `;
            tbody.appendChild(tr);
        });

        // Update Stats Grid
        document.getElementById('creditsValue').textContent = totalCreditsEarned;
        document.getElementById('passedValue').textContent = subjectsPassed;
        document.getElementById('reappearValue').textContent = subjectsReappear;
        
        const reappearWarning = document.getElementById('reappearWarning');
        if (subjectsReappear > 0) {
            reappearWarning.style.display = 'block';
        } else {
            reappearWarning.style.display = 'none';
        }

        // Calculate simple GPA
        let gpa = 0.0;
        if (totalCreditsEarned > 0) {
            gpa = (totalPoints / totalCreditsEarned).toFixed(2);
        }
        document.getElementById('gpaValue').textContent = subjectsReappear > 0 ? 'N/A' : gpa;
    }

    // Initialize with selected semester
    const semesterSelect = document.getElementById('semesterSelect');
    if (semesterSelect) {
        populateMarksTable(semesterSelect.value);
        
        semesterSelect.addEventListener('change', (e) => {
            populateMarksTable(e.target.value);
        });
    }

    // =============================================
    //  DOWNLOAD RECEIPT HANDLER
    // =============================================
    const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', () => {
            const semester = semesterSelect ? semesterSelect.value : '4';
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += `Semester ${semester} Marks Receipt\n\n`;
            csvContent += "Subject Code,Subject Name,Credits,Internal (25),Lab (25),Semester (50),Total (100),Result\n";
            
            currentSemesterData.forEach(d => {
                const totalMarks = d.internal + d.lab + d.semester;
                const result = (totalMarks < 50 || d.semester < 20) ? 'Reappear' : 'Pass';
                csvContent += `${d.code},${d.name},${d.credits},${d.internal},${d.lab},${d.semester},${totalMarks},${result}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `semester_${semester}_marks_receipt.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

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
        if (item.textContent.includes('Dashboard')) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'dashboard.html';
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
            localStorage.removeItem('userSession');
            window.location.href = 'index.html';
        });
    }
});
