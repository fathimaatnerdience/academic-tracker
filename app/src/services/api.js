import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Request interceptor - Add token
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

// ✅ Response interceptor - Handle errors WITHOUT showing toasts
// Let components handle toasts to avoid duplicates
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const responseData = error.response?.data;
    const status = error.response?.status;
    
    // Log error for developers (console only)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        status: status,
        message: responseData?.message,
        url: error.config?.url
      });
    }
    
    // Handle authentication errors - Auto logout
    if (status === 401 || responseData?.code === 'TOKEN_EXPIRED') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=true';
      return Promise.reject(new Error('Session expired'));
    }
    
    // Handle invalid token
    if (responseData?.code === 'INVALID_TOKEN') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?invalid=true';
      return Promise.reject(new Error('Invalid session'));
    }
    
    // Handle account deactivated
    if (responseData?.code === 'ACCOUNT_DEACTIVATED') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?deactivated=true';
      return Promise.reject(new Error('Account deactivated'));
    }
    
    // Create user-friendly error object
    const userMessage = responseData?.message || 'An error occurred. Please try again.';
    const friendlyError = new Error(userMessage);
    friendlyError.status = status;
    friendlyError.originalError = error;
    
    // ✅ DON'T show toast here - let components handle it
    // This prevents duplicate toasts
    
    return Promise.reject(friendlyError);
  }
);

const createCrudAPI = (resource) => ({
  getAll: (params) => api.get(`/${resource}`, { params }),
  getOne: (id) => api.get(`/${resource}/${id}`),
  create: (data) => api.post(`/${resource}`, data),
  update: (id, data) => api.put(`/${resource}/${id}`, data),
  delete: (id) => api.delete(`/${resource}/${id}`)
});

// Search API
export const searchAPI = {
  globalSearch: (query, type = null) => api.get('/search', { params: { q: query, type } })
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  validateToken: () => api.get('/auth/validate'),
  updateProfile: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const studentsAPI = {
  ...createCrudAPI('students'),
  getByClass: (classId) => api.get(`/students?classId=${classId}`),
  getByParent: (parentId) => api.get(`/students?parentId=${parentId}`),
  uploadAvatar: (id, formData) => api.post(`/students/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const teachersAPI = {
  ...createCrudAPI('teachers'),
  getBySubject: (subjectId) => api.get(`/teachers?subjectId=${subjectId}`),
  uploadAvatar: (id, formData) => api.post(`/teachers/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const parentsAPI = {
  ...createCrudAPI('parents'),
  getChildren: (parentId) => api.get(`/parents/${parentId}/children`)
};

export const classesAPI = {
  ...createCrudAPI('classes'),
  getByGrade: (gradeLevel) => api.get(`/classes?gradeLevel=${gradeLevel}`),
  getStudents: (classId) => api.get(`/classes/${classId}/students`),
  assignSupervisor: (classId, teacherId) => api.put(`/classes/${classId}/supervisor`, { teacherId })
};

export const subjectsAPI = {
  ...createCrudAPI('subjects'),
  getByGrade: (gradeLevel) => api.get(`/subjects?gradeLevel=${gradeLevel}`),
  getByType: (type) => api.get(`/subjects?type=${type}`)
};

export const lessonsAPI = {
  ...createCrudAPI('lessons'),
  getByClass: (classId) => api.get(`/lessons?classId=${classId}`),
  getByTeacher: (teacherId) => api.get(`/lessons?teacherId=${teacherId}`),
  getByDay: (dayOfWeek) => api.get(`/lessons?dayOfWeek=${dayOfWeek}`),
  getTimetable: (classId, week) => api.get(`/lessons/timetable`, { params: { classId, week } })
};

export const examsAPI = {
  ...createCrudAPI('exams'),
  getByClass: (classId) => api.get(`/exams?classId=${classId}`),
  getBySubject: (subjectId) => api.get(`/exams?subjectId=${subjectId}`),
  getByTeacher: (teacherId) => api.get(`/exams?teacherId=${teacherId}`),
  getUpcoming: () => api.get('/exams/upcoming'),
  getByDateRange: (startDate, endDate) => api.get('/exams', { params: { startDate, endDate } })
};

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

export const eventsAPI = {
  ...createCrudAPI('events'),
  getByClass: (classId) => api.get(`/events?classId=${classId}`),
  getByType: (eventType) => api.get(`/events?eventType=${eventType}`),
  getUpcoming: (days = 30) => api.get('/events/upcoming', { params: { days } }),
  getByDateRange: (startDate, endDate) => api.get('/events', { params: { startDate, endDate } }),
  getCalendar: (month, year) => api.get('/events/calendar', { params: { month, year } })
};

export const announcementsAPI = {
  ...createCrudAPI('announcements'),
  getByClass: (classId) => api.get(`/announcements?classId=${classId}`),
  getByAudience: (targetAudience) => api.get(`/announcements?targetAudience=${targetAudience}`),
  getActive: () => api.get('/announcements/active'),
  getByPriority: (priority) => api.get(`/announcements?priority=${priority}`)
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAttendanceChart: (period) => api.get('/dashboard/attendance-chart', { params: { period } }),
  getGradeDistribution: () => api.get('/dashboard/grade-distribution'),
  getGenderDistribution: () => api.get('/dashboard/gender-distribution'),
  getSubjectPerformance: () => api.get('/dashboard/subject-performance'),
  getRecentActivity: (limit = 10) => api.get('/dashboard/recent-activity', { params: { limit } })
};

export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  getStudentImprovementPlan: (studentId) => api.post(`/ai/student-improvement/${studentId}`),
  getClassAnalysis: (classId) => api.post(`/ai/class-analysis/${classId}`),
  clearHistory: () => api.delete('/ai/clear-history'),
  healthCheck: () => api.get('/ai/health')
};

export default api;
