import glob
import os

target_content = """                <div class="user-profile">
                    <div class="user-avatar" id="headerAvatar">ST</div>
                    <div class="user-info">
                        <span class="user-name" id="userNameDisplay">Student Name</span>
                        <span class="user-role">Student</span>
                    </div>
                </div>"""

replacement_content = """                <div class="user-profile" id="userProfileBtn">
                    <div class="user-avatar" id="headerAvatar">ST</div>
                    <div class="user-info">
                        <span class="user-name" id="userNameDisplay">Student Name</span>
                        <span class="user-role">Student</span>
                    </div>
                    <div class="profile-dropdown" id="profileDropdown">
                        <button class="dropdown-item logout-text" id="dropdownLogoutBtn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            Logout
                        </button>
                    </div>
                </div>"""

script_tag = '<script src="user-dropdown.js"></script>\n</body>'

path = r'c:\Florence Steffy\Internship\login'
os.chdir(path)
for html_file in glob.glob('*.html'):
    if html_file == 'index.html': continue
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if target_content in content:
        content = content.replace(target_content, replacement_content)
        content = content.replace('</body>', script_tag)
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {html_file}')
    else:
        print(f'Could not find target content in {html_file}')
