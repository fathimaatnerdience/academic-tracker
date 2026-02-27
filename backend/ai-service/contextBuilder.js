import { Op } from 'sequelize';
import { model } from './config.js';

/**
 * Academic Context Builder - Fetches and formats academic data
 * to provide context to the AI for better responses
 */

export class AcademicContextBuilder {
  constructor(models) {
    this.models = models;
  }

  async getStudentByUserId(userId) {
    const { Student } = this.models;
    if (!userId) return null;
    try {
      return await Student.findOne({ where: { userId } });
    } catch (error) {
      console.error('Error fetching student by userId:', error);
      return null;
    }
  }

  async loadFullStudentById(studentId) {
    if (!studentId) return null;
    try {
      const fullStudent = await this.models.Student.findByPk(studentId, {
        include: [
          { model: this.models.User, as: 'user' },
          { model: this.models.Class, as: 'class' },
          {
            model: this.models.Result,
            as: 'results',
            include: [
              {
                model: this.models.Exam,
                as: 'exam',
                include: [{ model: this.models.Subject, as: 'subject', attributes: ['id', 'subjectName', 'code'] }]
              },
              {
                model: this.models.Assignment,
                as: 'assignment',
                include: [{ model: this.models.Subject, as: 'subject', attributes: ['id', 'subjectName', 'code'] }]
              }
            ]
          },
          { model: this.models.Attendance, as: 'attendances' }
        ]
      });

      if (!fullStudent) return null;

      return {
        ...fullStudent.toJSON(),
        age: this.calculateAge(fullStudent.dateOfBirth),
        averageScore: this.calculateAverageScore(fullStudent.results),
        attendanceRate: this.calculateAttendanceRate(fullStudent.attendances),
        weakSubjects: this.identifyWeakSubjects(fullStudent.results),
        strongSubjects: this.identifyStrongSubjects(fullStudent.results),
        subjectBreakdown: this.getSubjectBreakdown(fullStudent.results)
      };
    } catch (error) {
      console.error('Error loading full student:', error);
      return null;
    }
  }

  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }
    return age;
  }

  async searchClassByName(name) {
    const { Class } = this.models;

    try {
      const classes = await Class.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`
          }
        }
      });
      return classes;
    } catch (error) {
      console.error('Error searching class by name:', error);
      return [];
    }
  }

  async getOverallGenderSummary() {
    const { Student } = this.models;

    try {
      const students = await Student.findAll({
        attributes: ['id', 'gender']
      });

      const total = students.length;
      const male = students.filter(s => s.gender === 'male').length;
      const female = students.filter(s => s.gender === 'female').length;
      const other = students.filter(s => s.gender === 'other').length;

      return {
        total,
        male,
        female,
        other,
        maleRate: total > 0 ? ((male / total) * 100).toFixed(2) : 0,
        femaleRate: total > 0 ? ((female / total) * 100).toFixed(2) : 0,
        otherRate: total > 0 ? ((other / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error computing overall gender summary:', error);
      return null;
    }
  }

  async getClassGenderRatio(classId) {
    const { Student } = this.models;

    try {
      const students = await Student.findAll({
        where: { classId },
        attributes: ['id', 'gender']
      });

      const total = students.length;
      const male = students.filter(s => s.gender === 'male').length;
      const female = students.filter(s => s.gender === 'female').length;
      const other = students.filter(s => s.gender === 'other').length;

      return {
        total,
        male,
        female,
        other,
        maleRate: total > 0 ? ((male / total) * 100).toFixed(2) : 0,
        femaleRate: total > 0 ? ((female / total) * 100).toFixed(2) : 0,
        otherRate: total > 0 ? ((other / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error computing class gender ratio:', error);
      return null;
    }
  }

  async getClassAttendanceSummary(classId) {
    const { Student, Attendance } = this.models;

    try {
      const students = await Student.findAll({
        where: { classId },
        attributes: ['id']
      });
      const studentIds = students.map(s => s.id);
      if (studentIds.length === 0) {
        return {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          presentRate: 0,
          absentRate: 0
        };
      }

      const attendances = await Attendance.findAll({
        where: { studentId: studentIds }
      });

      const total = attendances.length;
      const present = attendances.filter(a => a.status === 'present').length;
      const absent = attendances.filter(a => a.status === 'absent').length;
      const late = attendances.filter(a => a.status === 'late').length;
      const excused = attendances.filter(a => a.status === 'excused').length;

      return {
        total,
        present,
        absent,
        late,
        excused,
        presentRate: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
        absentRate: total > 0 ? ((absent / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error fetching class attendance summary:', error);
      return null;
    }
  }

  async getClassSubjectPerformance(classId) {
    const { Student, Result, Exam, Assignment, Subject } = this.models;

    try {
      const students = await Student.findAll({
        where: { classId },
        attributes: ['id']
      });
      const studentIds = students.map(s => s.id);
      if (studentIds.length === 0) return [];

      const results = await Result.findAll({
        where: { studentId: studentIds },
        include: [
          {
            model: Exam,
            as: 'exam',
            required: false,
            include: [{ model: Subject, as: 'subject', attributes: ['id', 'subjectName'] }]
          },
          {
            model: Assignment,
            as: 'assignment',
            required: false,
            include: [{ model: Subject, as: 'subject', attributes: ['id', 'subjectName'] }]
          }
        ]
      });

      const subjectAgg = {};
      results.forEach(r => {
        let subjectName = null;
        if (r.exam && r.exam.subject) subjectName = r.exam.subject.subjectName;
        else if (r.assignment && r.assignment.subject) subjectName = r.assignment.subject.subjectName;
        if (!subjectName) return;
        if (!subjectAgg[subjectName]) subjectAgg[subjectName] = { total: 0, count: 0 };
        subjectAgg[subjectName].total += parseFloat(r.percentage || 0);
        subjectAgg[subjectName].count += 1;
      });

      return Object.entries(subjectAgg)
        .map(([subject, data]) => ({
          subject,
          averageScore: data.count > 0 ? (data.total / data.count).toFixed(2) : 0,
          assessments: data.count
        }))
        .sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore));
    } catch (error) {
      console.error('Error fetching class subject performance:', error);
      return [];
    }
  }

  async getGradeGenderSummary(gradeLevel) {
    const { Student } = this.models;

    try {
      const students = await Student.findAll({
        where: { gradeLevel },
        attributes: ['id', 'gender']
      });

      const total = students.length;
      const male = students.filter(s => s.gender === 'male').length;
      const female = students.filter(s => s.gender === 'female').length;
      const other = students.filter(s => s.gender === 'other').length;

      return {
        gradeLevel,
        total,
        male,
        female,
        other,
        maleRate: total > 0 ? ((male / total) * 100).toFixed(2) : 0,
        femaleRate: total > 0 ? ((female / total) * 100).toFixed(2) : 0,
        otherRate: total > 0 ? ((other / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error computing grade gender summary:', error);
      return null;
    }
  }

  async getStudentsData(limit = 50) {
    const { Student, User, Class, Result, Attendance, Subject, Exam, Assignment } = this.models;
    
    try {
      // Fetch students with basic info
      const students = await Student.findAll({
        limit,
        include: [
          { model: User, as: 'user', attributes: ['name', 'email'] },
          { model: Class, as: 'class', attributes: ['name', 'gradeLevel'] },
          { model: Attendance, as: 'attendances' }
        ]
      });

      // Fetch all subjects for reference
      const subjects = await Subject.findAll();
      const subjectMap = {};
      subjects.forEach(s => {
        subjectMap[s.id] = s.subjectName;
      });

      // Fetch results separately with subject info
      const studentIds = students.map(s => s.id);
      const allResults = await Result.findAll({
        where: { studentId: studentIds },
        include: [
          { 
            model: Exam, 
            as: 'exam', 
            required: false, 
            include: [{ 
              model: Subject, 
              as: 'subject', 
              attributes: ['id', 'subjectName'] 
            }] 
          },
          { 
            model: Assignment, 
            as: 'assignment', 
            required: false, 
            include: [{ 
              model: Subject, 
              as: 'subject', 
              attributes: ['id', 'subjectName'] 
            }] 
          }
        ]
      });

      // Group results by student
      const resultsByStudent = {};
      allResults.forEach(r => {
        if (!resultsByStudent[r.studentId]) {
          resultsByStudent[r.studentId] = [];
        }
        resultsByStudent[r.studentId].push(r);
      });

      return students.map(s => {
        const studentResults = resultsByStudent[s.id] || [];
        const subjectBreakdown = this.getSubjectBreakdown(studentResults);
        
        return {
          id: s.id,
          name: s.user?.name || 'Unknown',
          studentId: s.studentId,
          class: s.class?.name,
          gradeLevel: s.gradeLevel,
          gender: s.gender,
          age: this.calculateAge(s.dateOfBirth),
          averageScore: this.calculateAverageScore(studentResults),
          attendanceRate: this.calculateAttendanceRate(s.attendances),
          grades: this.summarizeGrades(studentResults),
          weakSubjects: this.identifyWeakSubjects(studentResults),
          strongSubjects: this.identifyStrongSubjects(studentResults),
          subjectBreakdown: subjectBreakdown
        };
      });
    } catch (error) {
      console.error('Error fetching students data:', error);
      return [];
    }
  }

  async getClassStats() {
    const { Class, Student, Result } = this.models;
    
    try {
      const classes = await Class.findAll({
        include: [
          { model: Student, as: 'students', include: [{ model: Result, as: 'results' }] }
        ]
      });

      return classes.map(c => ({
        name: c.name,
        gradeLevel: c.gradeLevel,
        studentCount: c.students?.length || 0,
        averageScore: this.calculateClassAverage(c.students)
      }));
    } catch (error) {
      console.error('Error fetching class stats:', error);
      return [];
    }
  }

  async getSubjectPerformance() {
    const { Subject, Result, Exam, Assignment } = this.models;
    
    try {
      const subjects = await Subject.findAll({
        include: [
          { 
            model: Exam, 
            as: 'exams', 
            include: [{ model: Result, as: 'results' }] 
          },
          { 
            model: Assignment, 
            as: 'assignments', 
            include: [{ model: Result, as: 'results' }] 
          }
        ]
      });

      return subjects.map(s => {
        const examResults = s.exams?.flatMap(e => e.results || []) || [];
        const assignmentResults = s.assignments?.flatMap(a => a.results || []) || [];
        const allResults = [...examResults, ...assignmentResults];
        
        return {
          name: s.subjectName,
          code: s.code,
          type: s.type,
          averageScore: allResults.length > 0 
            ? (allResults.reduce((sum, r) => sum + parseFloat(r.percentage || 0), 0) / allResults.length).toFixed(2)
            : 0,
          totalAssessments: allResults.length
        };
      });
    } catch (error) {
      console.error('Error fetching subject performance:', error);
      return [];
    }
  }

  async getTopPerformers(count = 10) {
    const students = await this.getStudentsData(100);
    return students
      .filter(s => s.averageScore > 0)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, count);
  }

  async getStudentsNeedingImprovement(threshold = 50) {
    const students = await this.getStudentsData(100);
    return students
      .filter(s => s.averageScore > 0 && s.averageScore < threshold)
      .sort((a, b) => a.averageScore - b.averageScore);
  }

  async getAttendanceSummary() {
    const { Attendance } = this.models;
    
    // Simple query without complex joins to avoid SQL errors
    const attendances = await Attendance.findAll();

    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'present').length;
    const absent = attendances.filter(a => a.status === 'absent').length;
    const late = attendances.filter(a => a.status === 'late').length;
    const excused = attendances.filter(a => a.status === 'excused').length;

    return {
      total,
      present,
      absent,
      late,
      excused,
      presentRate: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
      absentRate: total > 0 ? ((absent / total) * 100).toFixed(2) : 0
    };
  }

  async searchStudentByName(name) {
    const { Student, User } = this.models;
    
    try {
      const students = await Student.findAll({
        include: [{
          model: User,
          as: 'user',
          where: {
            name: {
              [Op.like]: `%${name}%`
            }
          }
        }]
      });

      return students;
    } catch (error) {
      console.error('Error searching student by name:', error);
      return [];
    }
  }

  // Get detailed subject breakdown for a student
  getSubjectBreakdown(results) {
    if (!results || results.length === 0) return {};
    
    const subjectScores = {};
    results.forEach(r => {
      // Try to get subject name from exam or assignment
      let subjectName = null;
      
      if (r.exam && r.exam.subject) {
        subjectName = r.exam.subject.subjectName;
      } else if (r.assignment && r.assignment.subject) {
        subjectName = r.assignment.subject.subjectName;
      }
      
      // Skip if no subject name found
      if (!subjectName) return;
      
      if (!subjectScores[subjectName]) {
        subjectScores[subjectName] = { scores: [], total: 0, count: 0 };
      }
      const percentage = parseFloat(r.percentage || 0);
      subjectScores[subjectName].scores.push(percentage);
      subjectScores[subjectName].total += percentage;
      subjectScores[subjectName].count += 1;
    });

    // Calculate averages
    const breakdown = {};
    Object.entries(subjectScores).forEach(([subject, data]) => {
      breakdown[subject] = {
        average: (data.total / data.count).toFixed(2),
        assessments: data.count,
        scores: data.scores
      };
    });
    return breakdown;
  }

  // Helper methods
  calculateAverageScore(results) {
    if (!results || results.length === 0) return 0;
    const sum = results.reduce((acc, r) => acc + parseFloat(r.percentage || 0), 0);
    return (sum / results.length).toFixed(2);
  }

  calculateAttendanceRate(attendances) {
    if (!attendances || attendances.length === 0) return 0;
    const present = attendances.filter(a => a.status === 'present').length;
    return ((present / attendances.length) * 100).toFixed(2);
  }

  summarizeGrades(results) {
    if (!results || results.length === 0) return {};
    const grades = {};
    results.forEach(r => {
      grades[r.grade] = (grades[r.grade] || 0) + 1;
    });
    return grades;
  }

  identifyWeakSubjects(results) {
    if (!results || results.length === 0) return [];
    
    const subjectScores = {};
    results.forEach(r => {
      let subjectName = null;
      
      if (r.exam && r.exam.subject) {
        subjectName = r.exam.subject.subjectName;
      } else if (r.assignment && r.assignment.subject) {
        subjectName = r.assignment.subject.subjectName;
      }
      
      if (!subjectName) return;
      
      if (!subjectScores[subjectName]) {
        subjectScores[subjectName] = { total: 0, count: 0 };
      }
      subjectScores[subjectName].total += parseFloat(r.percentage || 0);
      subjectScores[subjectName].count += 1;
    });

    return Object.entries(subjectScores)
      .filter(([_, data]) => (data.total / data.count) < 60)
      .map(([subject]) => subject);
  }

  identifyStrongSubjects(results) {
    if (!results || results.length === 0) return [];
    
    const subjectScores = {};
    results.forEach(r => {
      let subjectName = null;
      
      if (r.exam && r.exam.subject) {
        subjectName = r.exam.subject.subjectName;
      } else if (r.assignment && r.assignment.subject) {
        subjectName = r.assignment.subject.subjectName;
      }
      
      if (!subjectName) return;
      
      if (!subjectScores[subjectName]) {
        subjectScores[subjectName] = { total: 0, count: 0 };
      }
      subjectScores[subjectName].total += parseFloat(r.percentage || 0);
      subjectScores[subjectName].count += 1;
    });

    return Object.entries(subjectScores)
      .filter(([_, data]) => (data.total / data.count) >= 80)
      .map(([subject]) => subject);
  }

  calculateClassAverage(students) {
    if (!students || students.length === 0) return 0;
    const allResults = students.flatMap(s => s.results || []);
    if (allResults.length === 0) return 0;
    const sum = allResults.reduce((acc, r) => acc + parseFloat(r.percentage || 0), 0);
    return (sum / allResults.length).toFixed(2);
  }

  async buildContextForQuery(query, user = null) {
    let context = {};

    const role = user?.role;
    const isStudentScoped = role === 'student';

    if (isStudentScoped) {
      const student = await this.getStudentByUserId(user?.id);

      if (student) {
        const full = await this.loadFullStudentById(student.id);
        if (full) {
          context.specificStudent = full;
        }
      }

      return context;
    }

    // Load all essential data for comprehensive responses
    const safeLoad = async (key, loaderFn, fallbackValue) => {
      try {
        context[key] = await loaderFn();
      } catch (err) {
        console.error(`Context load failed for ${key}:`, err?.message || err);
        context[key] = fallbackValue;
        context._contextErrors = context._contextErrors || {};
        context._contextErrors[key] = err?.message || String(err);
      }
    };

    await safeLoad('students', () => this.getStudentsData(50), []); // Load up to 50 students with full details
    await safeLoad('topPerformers', () => this.getTopPerformers(10), []);
    await safeLoad('studentsNeedingImprovement', () => this.getStudentsNeedingImprovement(50), []);
    await safeLoad('classStats', () => this.getClassStats(), []);
    await safeLoad('subjectPerformance', () => this.getSubjectPerformance(), []);
    await safeLoad('attendanceSummary', () => this.getAttendanceSummary(), null);

    const normalizedQuery = String(query || '').toLowerCase();

    // Detect if user is asking about the whole/entire school explicitly (including follow-ups)
    const wantsWholeSchool =
      normalizedQuery.includes('whole school') ||
      normalizedQuery.includes('entire school') ||
      normalizedQuery.includes('in the school') ||
      normalizedQuery.includes('in school') ||
      normalizedQuery.includes('all students') ||
      normalizedQuery.includes('total students') ||
      normalizedQuery.includes('total number');

    const wantsOverallGender =
      wantsWholeSchool ||
      normalizedQuery.includes('gender ratio') ||
      normalizedQuery.includes('girls') ||
      normalizedQuery.includes('boys') ||
      normalizedQuery.includes('male') ||
      normalizedQuery.includes('female') ||
      normalizedQuery.includes('ratio');

    if (wantsOverallGender) {
      await safeLoad('overallGenderSummary', () => this.getOverallGenderSummary(), null);
    }

    const gradeMatch = query.match(/\bgrade\s*(\d{1,2})\b/i);
    if (gradeMatch) {
      const gradeLevel = parseInt(gradeMatch[1], 10);
      if (!Number.isNaN(gradeLevel)) {
        await safeLoad('gradeGenderSummary', () => this.getGradeGenderSummary(gradeLevel), null);
      }
    }

    const queryWordsForClass = query.split(/\s+/);
    let foundClass = null;
    const stopWords = new Set(['grade', 'class', 'section', 'batch', 'standard']);
    for (let i = 0; i < queryWordsForClass.length; i++) {
      const word = queryWordsForClass[i].toLowerCase();
      if (stopWords.has(word)) continue;

      if (queryWordsForClass[i].length > 2 && /\d/.test(queryWordsForClass[i])) {
        const classData = await this.searchClassByName(queryWordsForClass[i]);
        if (classData.length > 0) {
          foundClass = classData[0];
          break;
        }
      }

      if (i < queryWordsForClass.length - 1) {
        const twoWords = `${queryWordsForClass[i]} ${queryWordsForClass[i + 1]}`;
        if (twoWords.length > 3 && /\d/.test(twoWords)) {
          const classData = await this.searchClassByName(twoWords);
          if (classData.length > 0) {
            foundClass = classData[0];
            break;
          }
        }
      }

      if (i < queryWordsForClass.length - 2) {
        const threeWords = `${queryWordsForClass[i]} ${queryWordsForClass[i + 1]} ${queryWordsForClass[i + 2]}`;
        if (threeWords.length > 5 && /\d/.test(threeWords)) {
          const classData = await this.searchClassByName(threeWords);
          if (classData.length > 0) {
            foundClass = classData[0];
            break;
          }
        }
      }
    }

    if (foundClass) {
      try {
        const genderRatio = await this.getClassGenderRatio(foundClass.id);
        const attendance = await this.getClassAttendanceSummary(foundClass.id);
        const subjectPerformance = await this.getClassSubjectPerformance(foundClass.id);

        context.specificClass = {
          ...foundClass.toJSON(),
          genderRatio,
          attendanceSummary: attendance,
          subjectPerformance
        };
      } catch (error) {
        console.error('Error loading specific class context:', error);
      }
    }

    // Search for specific student if name mentioned in query
    // Extract possible names (handle multi-word names like "Geeta Kumari")
    const queryWords = query.split(/\s+/);
    let foundStudent = null;
    
    // Try matching individual words and combinations
    for (let i = 0; i < queryWords.length; i++) {
      // Try single word
      if (queryWords[i].length > 2 && /^[A-Za-z]+$/.test(queryWords[i])) {
        const studentData = await this.searchStudentByName(queryWords[i]);
        if (studentData.length > 0) {
          foundStudent = studentData[0];
          break;
        }
      }
      
      // Try two-word combination (e.g., "Geeta Kumari")
      if (i < queryWords.length - 1) {
        const twoWords = `${queryWords[i]} ${queryWords[i + 1]}`;
        if (/^[A-Za-z\s]+$/.test(twoWords) && twoWords.length > 3) {
          const studentData = await this.searchStudentByName(twoWords);
          if (studentData.length > 0) {
            foundStudent = studentData[0];
            break;
          }
        }
      }
    }
    
    if (foundStudent) {
      const full = await this.loadFullStudentById(foundStudent.id);
      if (full) {
        context.specificStudent = full;
      }
    }

    return context;
  }
}

export default AcademicContextBuilder;
