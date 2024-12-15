// Toggle between login and register
document.getElementById('showRegister').addEventListener('click', () => {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', () => {
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
});

// Handle registration
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('emailReg').value;
    const password = document.getElementById('passwordReg').value;
    const course = document.getElementById('course').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, course }),
    });

    const data = await response.json();
    if (response.status === 201) {
        alert('Registration successful!');
        document.getElementById('showLogin').click();
    } else {
        alert(data.error || 'Error during registration');
    }
});

// Handle login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.status === 200) {
        // Display dashboard
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('credentialssection').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('studentName').textContent = data.user.name;
        document.getElementById('studentEmail').textContent = data.user.email;
        document.getElementById('studentCourse').textContent = data.user.course;
    } else {
        alert(data.message || 'Login failed');
    }
});

// Handle logout
document.getElementById('logout').addEventListener('click', () => {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
});

async function fetchSubjects(course) {
    const response = await fetch(`/subjects/${course}`);
    const subjects = await response.json();
    const subjectDropdown = document.getElementById('availableSubjects');
    subjectDropdown.innerHTML = '';
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = `${subject.name} (${subject.type})`;
        subjectDropdown.appendChild(option);
    });
}

document.getElementById('enrollSubject').addEventListener('click', async () => {
    const subjectId = document.getElementById('availableSubjects').value;
    const response = await fetch('/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: loggedInStudentId, user_id: subjectId })
    });
    const data = await response.json();
    if (response.status === 201) {
        alert('Subject enrolled successfully');
        fetchEnrolledSubjects();
    } else {
        alert(data.error || 'Error enrolling subject');
    }
});

async function fetchEnrolledSubjects() {
    const response = await fetch(`/grades/${loggedInStudentId}`);
    const grades = await response.json();
    const gradesList = document.getElementById('gradesList');
    gradesList.innerHTML = '';
    grades.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.grade || 'Not Graded'}`;
        gradesList.appendChild(li);
    });
}

// Search courses
document.getElementById('searchCourses').addEventListener('input', async (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const response = await fetch(`/subjects`);
    const subjects = await response.json();
    const filteredSubjects = subjects.filter(subject => subject.name.toLowerCase().includes(searchTerm));
    const courseDropdown = document.getElementById('courseDropdown');
    courseDropdown.innerHTML = '';
    filteredSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = `${subject.name} (${subject.type})`;
        courseDropdown.appendChild(option);
    });
});

// Load grades
async function loadGrades(studentId) {
    const grades = await apiCall(`/grades/${studentId}`);
    gradesContainer.innerHTML = `<table>
        <thead><tr><th>Subject</th><th>Type</th><th>Grade</th></tr></thead>
        <tbody>
            ${grades
                .map(
                    (grade) =>
                        `<tr>
                            <td>${grade.subject_name}</td>
                            <td>${grade.type}</td>
                            <td>${grade.grade || "N/A"}</td>
                        </tr>`
                )
                .join("")}
        </tbody>
    </table>`;
}


document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.getElementById('dashboard');
    const profileSection = document.getElementById('profileSection');
    const coursesSection = document.getElementById('coursesSection');
    const gradesSection = document.getElementById('gradesSection');

    const showProfile = document.getElementById('showProfile');
    const showCourses = document.getElementById('showCourses');
    const showGrades = document.getElementById('showGrades');

    // Default student profile data (to be updated dynamically after login/registration)
    let studentProfile = {
        name: "John Doe",
        email: "johndoe@example.com",
        course: "BSCS",
        profilePicture: "default-profile.png",
    };

    // Display Profile Section by Default
    dashboard.style.display = 'block';
    profileSection.style.display = 'block';

    // Populate Profile Section with Student Details
    function loadProfile() {
        document.getElementById('profileNameDisplay').textContent = studentProfile.name;
        document.getElementById('profileEmailDisplay').textContent = studentProfile.email;
        document.getElementById('profileCourseDisplay').textContent = studentProfile.course;
        document.getElementById('profilePicture').src = studentProfile.profilePicture;
    }
    loadProfile();

    // Navbar navigation
    showProfile.addEventListener('click', () => {
        profileSection.style.display = 'block';
        coursesSection.style.display = 'none';
        gradesSection.style.display = 'none';
    });

    showCourses.addEventListener('click', () => {
        profileSection.style.display = 'none';
        coursesSection.style.display = 'block';
        gradesSection.style.display = 'none';
    });

    showGrades.addEventListener('click', () => {
        profileSection.style.display = 'none';
        coursesSection.style.display = 'none';
        gradesSection.style.display = 'block';
    });

    // Handle Profile Picture Update
    const changePictureBtn = document.getElementById('changePicture');
    const uploadPictureInput = document.getElementById('uploadPicture');

    changePictureBtn.addEventListener('click', () => uploadPictureInput.click());
    uploadPictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                studentProfile.profilePicture = reader.result;
                document.getElementById('profilePicture').src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Subject Enrollment Logic
    const subjectsList = document.getElementById('subjectsList');
    const enrolledSubjectsList = document.getElementById('enrolledSubjectsList');

    subjectsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('enrollBtn')) {
            const subject = e.target.getAttribute('data-subject');
            const enrolledItem = document.createElement('li');
            enrolledItem.textContent = subject;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.classList.add('removeBtn');
            enrolledItem.appendChild(removeBtn);
            enrolledSubjectsList.appendChild(enrolledItem);
        }
    });

    // Remove Subjects
    enrolledSubjectsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('removeBtn')) {
            e.target.parentElement.remove();
        }
    });
});

