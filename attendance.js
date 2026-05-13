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
    //  MOCK ATTENDANCE DATA
    // =============================================
    function populateAttendanceTable() {
        const tbody = document.getElementById('attendanceTableBody');
        const alertContainer = document.getElementById('lowAttendanceAlerts');
        if (!tbody) return;
        tbody.innerHTML = ''; 
        if (alertContainer) alertContainer.innerHTML = '';

        const attendanceData = [
            { subject: 'Advanced Mathematics', total: 40, attended: 35, percentage: 87.5 },
            { subject: 'Computer Science', total: 45, attended: 43, percentage: 95.5 },
            { subject: 'Physics', total: 35, attended: 24, percentage: 68.5 }, // Lowered for demonstration
            { subject: 'Literature', total: 30, attended: 27, percentage: 90.0 }
        ];

        let lowAttendanceCount = 0;

        attendanceData.forEach(d => {
            const tr = document.createElement('tr');
            
            // Determine status and color based on percentage
            let status = 'Good';
            let statusClass = 'green';
            let bgVar = 'var(--success)';
            
            if(d.percentage < 75) {
                status = 'Low';
                statusClass = 'red';
                bgVar = 'var(--danger)';
                
                // Calculate required consecutive hours to reach 75%
                const requiredHours = Math.ceil((0.75 * d.total - d.attended) / 0.25);
                
                if (alertContainer) {
                    lowAttendanceCount++;
                    const alertDiv = document.createElement('div');
                    alertDiv.style.padding = '16px';
                    alertDiv.style.backgroundColor = 'var(--danger-bg)';
                    alertDiv.style.border = '1px solid #fecaca';
                    alertDiv.style.borderRadius = '8px';
                    alertDiv.style.marginBottom = '12px';
                    alertDiv.style.color = 'var(--danger)';
                    alertDiv.style.display = 'flex';
                    alertDiv.style.alignItems = 'center';
                    alertDiv.style.gap = '12px';
                    
                    alertDiv.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        <div>
                            <strong style="display: block; margin-bottom: 4px;">Low Attendance in ${d.subject} (${d.percentage}%)</strong>
                            <span style="font-size: 13px;">You must attend <strong>${requiredHours} single consecutive hours</strong> to reach the required 75% attendance mark.</span>
                        </div>
                    `;
                    alertContainer.appendChild(alertDiv);
                    alertContainer.style.display = 'block';
                }
            } else if (d.percentage < 85) {
                status = 'Average';
                statusClass = 'orange';
                bgVar = 'var(--warning)';
            }

            tr.innerHTML = `
                <td><span style="font-weight: 500;">${d.subject}</span></td>
                <td>${d.total}</td>
                <td>${d.attended}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex-grow: 1; background: #e2e8f0; border-radius: 4px; height: 6px; overflow: hidden;">
                            <div style="width: ${d.percentage}%; background: ${bgVar}; height: 100%;"></div>
                        </div>
                        <span style="font-size: 13px; font-weight: 600;">${d.percentage}%</span>
                    </div>
                </td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    populateAttendanceTable();

    // =============================================
    //  DOWNLOAD REPORT HANDLER
    // =============================================
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', () => {
            // Simple mockup of downloading a CSV file
            const csvContent = "data:text/csv;charset=utf-8," 
                + "Subject,Total Hours,Hours Attended,Percentage\n"
                + "Advanced Mathematics,40,35,87.5%\n"
                + "Computer Science,45,43,95.5%\n"
                + "Physics,35,24,68.5%\n"
                + "Literature,30,27,90.0%";

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "attendance_report.csv");
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
