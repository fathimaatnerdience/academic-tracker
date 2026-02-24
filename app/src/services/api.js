import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ========================================
// Generic CRUD API Creator
// ========================================

const createCrudAPI = (resource) => ({
  getAll: (params) => api.get(`/${resource}`, { params }),
  getOne: (id) => api.get(`/${resource}/${id}`),
  create: (data) => api.post(`/${resource}`, data),
  update: (id, data) => api.put(`/${resource}/${id}`, data),
  delete: (id) => api.delete(`/${resource}/${id}`)
});

// ========================================
// Auth API
// ========================================

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// ========================================
// Students API
// ========================================

export const studentsAPI = {
  ...createCrudAPI('students'),
  getByClass: (classId) => api.get(`/students?classId=${classId}`),
  getByParent: (parentId) => api.get(`/students?parentId=${parentId}`),
  uploadAvatar: (id, formData) => api.post(`/students/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// ========================================
// Teachers API
// ========================================

export const teachersAPI = {
  ...createCrudAPI('teachers'),
  getBySubject: (subjectId) => api.get(`/teachers?subjectId=${subjectId}`),
  uploadAvatar: (id, formData) => api.post(`/teachers/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// ========================================
// Parents API
// ========================================

export const parentsAPI = {
  ...createCrudAPI('parents'),
  getChildren: (parentId) => api.get(`/parents/${parentId}/children`)
};

// ========================================
// Classes API
// ========================================

export const classesAPI = {
  ...createCrudAPI('classes'),
  getByGrade: (gradeLevel) => api.get(`/classes?gradeLevel=${gradeLevel}`),
  getStudents: (classId) => api.get(`/classes/${classId}/students`),
  assignSupervisor: (classId, teacherId) => api.put(`/classes/${classId}/supervisor`, { teacherId })
};

// ========================================
// Subjects API
// ========================================

export const subjectsAPI = {
  ...createCrudAPI('subjects'),
  getByGrade: (gradeLevel) => api.get(`/subjects?gradeLevel=${gradeLevel}`),
  getByType: (type) => api.get(`/subjects?type=${type}`)
};

// ========================================
// Lessons API
// ========================================

export const lessonsAPI = {
  ...createCrudAPI('lessons'),
  getByClass: (classId) => api.get(`/lessons?classId=${classId}`),
  getByTeacher: (teacherId) => api.get(`/lessons?teacherId=${teacherId}`),
  getByDay: (dayOfWeek) => api.get(`/lessons?dayOfWeek=${dayOfWeek}`),
  getTimetable: (classId, week) => api.get(`/lessons/timetable`, { params: { classId, week } })
};

// ========================================
// Exams API
// ========================================

export const examsAPI = {
  ...createCrudAPI('exams'),
  getByClass: (classId) => api.get(`/exams?classId=${classId}`),
  getBySubject: (subjectId) => api.get(`/exams?subjectId=${subjectId}`),
  getByTeacher: (teacherId) => api.get(`/exams?teacherId=${teacherId}`),
  getUpcoming: () => api.get('/exams/upcoming'),
  getByDateRange: (startDate, endDate) => api.get('/exams', { params: { startDate, endDate } })
};

// ========================================
// Assignments API
// ========================================

export const assignmentsAPI = {
  ...createCrudAPI('assignments'),
  getByClass: (classId) => api.get(`/assignments?classId=${classId}`),
  getBySubject: (subjectId) => api.get(`/assignments?subjectId=${subjectId}`),
  getByTeacher: (teacherId) => api.get(`/assignments?teacherId=${teacherId}`),
  getByStudent: (studentId) => api.get(`/assignments?studentId=${studentId}`),
  submit: (assignmentId, data) => api.post(`/assignments/${assignmentId}/submit`, data),
  uploadAttachment: (id, formData) => api.post(`/assignments/${id}/attachment`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// ========================================
// Results API
// ========================================

export const resultsAPI = {
  ...createCrudAPI('results'),
  getByStudent: (studentId) => api.get(`/results?studentId=${studentId}`),
  getByExam: (examId) => api.get(`/results?examId=${examId}`),
  getByAssignment: (assignmentId) => api.get(`/results?assignmentId=${assignmentId}`),
  getReportCard: (studentId, term) => api.get(`/results/report-card/${studentId}`, { params: { term } }),
  calculateGrade: (marks, totalMarks) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }
};

// ========================================
// Attendance API
// ========================================

export const attendanceAPI = {
  ...createCrudAPI('attendance'),
  getByStudent: (studentId, params) => api.get(`/attendance?studentId=${studentId}`, { params }),
  getByLesson: (lessonId) => api.get(`/attendance?lessonId=${lessonId}`),
  getByClass: (classId, date) => api.get(`/attendance`, { params: { classId, date } }),
  mark: (data) => api.post('/attendance/mark', data),
  getStats: (studentId, startDate, endDate) => api.get(`/attendance/stats/${studentId}`, {
    params: { startDate, endDate }
  }),
  getMonthlyReport: (classId, month, year) => api.get('/attendance/monthly-report', {
    params: { classId, month, year }
  })
};

// ========================================
// Events API
// ========================================

export const eventsAPI = {
  ...createCrudAPI('events'),
  getByClass: (classId) => api.get(`/events?classId=${classId}`),
  getByType: (eventType) => api.get(`/events?eventType=${eventType}`),
  getUpcoming: (days = 30) => api.get('/events/upcoming', { params: { days } }),
  getByDateRange: (startDate, endDate) => api.get('/events', { params: { startDate, endDate } }),
  getCalendar: (month, year) => api.get('/events/calendar', { params: { month, year } })
};

// ========================================
// Announcements API
// ========================================

export const announcementsAPI = {
  ...createCrudAPI('announcements'),
  getByClass: (classId) => api.get(`/announcements?classId=${classId}`),
  getByAudience: (targetAudience) => api.get(`/announcements?targetAudience=${targetAudience}`),
  getActive: () => api.get('/announcements/active'),
  getByPriority: (priority) => api.get(`/announcements?priority=${priority}`)
};

// ========================================
// Dashboard Stats API
// ========================================

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAttendanceChart: (period) => api.get('/dashboard/attendance-chart', { params: { period } }),
  getGradeDistribution: () => api.get('/dashboard/grade-distribution'),
  getGenderDistribution: () => api.get('/dashboard/gender-distribution'),
  getSubjectPerformance: () => api.get('/dashboard/subject-performance'),
  getRecentActivity: (limit = 10) => api.get('/dashboard/recent-activity', { params: { limit } })
};

// ========================================
// AI Chatbot API
// ========================================

export const aiAPI = {
  // Send a chat message to the AI
  chat: (message) => api.post('/ai/chat', { message }),
  
  // Generate improvement plan for a specific student
  getStudentImprovementPlan: (studentId) => api.post(`/ai/student-improvement/${studentId}`),
  
  // Generate analysis for a specific class
  getClassAnalysis: (classId) => api.post(`/ai/class-analysis/${classId}`),
  
  // Clear conversation history
  clearHistory: () => api.delete('/ai/clear-history'),
  
  // Check AI service health
  healthCheck: () => api.get('/ai/health')
};

// Export default api instance for custom requests
export default api;
