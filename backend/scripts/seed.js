import dotenv from 'dotenv';
import { sequelize } from '../config/database.js';
import * as models from '../models/index.js';

dotenv.config();

const {
  User,
  Teacher,
  Student,
  Parent,
  Class,
  Subject,
  Lesson,
  Exam,
  Assignment,
  Result,
  Attendance,
  Announcement,
  Event
} = models;

const days = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const dateOnly = (d) => d.toISOString().slice(0, 10);

const time = (hh, mm) => `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;

const main = async () => {
  const t = await sequelize.transaction();

  try {
    await sequelize.authenticate();

    await sequelize.sync({ alter: false, force: true });

    const adminUser = await User.create(
      {
        username: 'admin',
        email: 'admin@school.com',
        password: 'admin',
        role: 'admin',
        name: 'System Admin'
      },
      { transaction: t, validate: false }
    );

    const teacherUser = await User.create(
      {
        username: 'teach',
        email: 'teach@school.com',
        password: 'teach123',
        role: 'teacher',
        name: 'Anita Teacher'
      },
      { transaction: t }
    );

    const studentLoginUser = await User.create(
      {
        username: 'stu',
        email: 'stu@school.com',
        password: 'stu123',
        role: 'student',
        name: 'Ravi Student'
      },
      { transaction: t }
    );

    const teacher = await Teacher.create(
      {
        userId: teacherUser.id,
        teacherId: 'T-1001',
        name: teacherUser.name,
        email: teacherUser.email,
        phone: '9000000001',
        address: 'School Staff Quarters',
        dateOfBirth: '1990-06-12',
        gender: 'female',
        qualification: 'M.Ed',
        experience: 8,
        specialization: 'Mathematics',
        salary: 45000,
        bloodGroup: 'O+',
        emergencyContact: '9000000099'
      },
      { transaction: t }
    );

    const parentUser = await User.create(
      {
        username: 'parent1',
        email: 'parent1@school.com',
        password: 'parent123',
        role: 'parent',
        name: 'Kumar Parent'
      },
      { transaction: t }
    );

    const parent = await Parent.create(
      {
        userId: parentUser.id,
        parentId: 'P-2001',
        name: parentUser.name,
        email: parentUser.email,
        phone: '9000000002',
        occupation: 'Engineer',
        relationship: 'father',
        address: 'Near City Park'
      },
      { transaction: t }
    );

    const academicYear = new Date().getFullYear();

    const class10A = await Class.create(
      {
        name: 'Grade 10-A',
        gradeLevel: 10,
        section: 'A',
        capacity: 40,
        supervisorId: teacher.id,
        supervisorName: teacher.userId ? teacherUser.name : teacher.name,
        academicYear
      },
      { transaction: t }
    );

    const class10B = await Class.create(
      {
        name: 'Grade 10-B',
        gradeLevel: 10,
        section: 'B',
        capacity: 40,
        supervisorId: teacher.id,
        supervisorName: teacher.userId ? teacherUser.name : teacher.name,
        academicYear
      },
      { transaction: t }
    );

    const subjects = await Subject.bulkCreate(
      [
        {
          subjectName: 'Mathematics',
          code: 'MATH-10',
          description: 'Algebra, Geometry, and Trigonometry',
          gradeLevel: 10,
          type: 'core',
          credits: 4
        },
        {
          subjectName: 'Science',
          code: 'SCI-10',
          description: 'Physics, Chemistry, and Biology fundamentals',
          gradeLevel: 10,
          type: 'core',
          credits: 4
        },
        {
          subjectName: 'English',
          code: 'ENG-10',
          description: 'Reading, writing, and communication',
          gradeLevel: 10,
          type: 'core',
          credits: 3
        }
      ],
      { transaction: t, returning: true }
    );

    const subjectByName = Object.fromEntries(subjects.map(s => [s.subjectName, s]));

    const lessons = await Lesson.bulkCreate(
      [
        {
          subjectId: subjectByName.Mathematics.id,
          classId: class10A.id,
          teacherId: teacher.id,
          dayOfWeek: 'Monday',
          startTime: time(9, 0),
          endTime: time(9, 45),
          room: 'A-101'
        },
        {
          subjectId: subjectByName.Science.id,
          classId: class10A.id,
          teacherId: teacher.id,
          dayOfWeek: 'Tuesday',
          startTime: time(10, 0),
          endTime: time(10, 45),
          room: 'Lab-1'
        },
        {
          subjectId: subjectByName.English.id,
          classId: class10A.id,
          teacherId: teacher.id,
          dayOfWeek: 'Wednesday',
          startTime: time(11, 0),
          endTime: time(11, 45),
          room: 'A-103'
        }
      ],
      { transaction: t, returning: true }
    );

    const loginStudent = await Student.create(
      {
        userId: studentLoginUser.id,
        studentId: 'S-3001',
        name: studentLoginUser.name,
        email: studentLoginUser.email,
        phone: '9000000003',
        address: 'Green Street 12',
        classId: class10A.id,
        gradeLevel: 10,
        section: 'A',
        dateOfBirth: '2009-02-18',
        gender: 'male',
        bloodGroup: 'B+',
        parentId: parent.id,
        contact: '9000000002'
      },
      { transaction: t }
    );

    const extraUsers = await User.bulkCreate(
      [
        { username: 'sneha', email: 'sneha10@school.com', password: 'pass1234', role: 'student', name: 'Sneha' },
        { username: 'arjun', email: 'arjun10@school.com', password: 'pass1234', role: 'student', name: 'Arjun' },
        { username: 'meera', email: 'meera10@school.com', password: 'pass1234', role: 'student', name: 'Meera' },
        { username: 'farah', email: 'farah10@school.com', password: 'pass1234', role: 'student', name: 'Farah' }
      ],
      { transaction: t, returning: true }
    );

    const extraStudents = await Student.bulkCreate(
      [
        {
          userId: extraUsers[0].id,
          studentId: 'S-3002',
          name: extraUsers[0].name,
          email: extraUsers[0].email,
          classId: class10A.id,
          gradeLevel: 10,
          section: 'A',
          dateOfBirth: '2009-10-04',
          gender: 'female',
          admissionDate: dateOnly(days(-320))
        },
        {
          userId: extraUsers[1].id,
          studentId: 'S-3003',
          name: extraUsers[1].name,
          email: extraUsers[1].email,
          classId: class10A.id,
          gradeLevel: 10,
          section: 'A',
          dateOfBirth: '2009-05-20',
          gender: 'male',
          admissionDate: dateOnly(days(-320))
        },
        {
          userId: extraUsers[2].id,
          studentId: 'S-3004',
          name: extraUsers[2].name,
          email: extraUsers[2].email,
          classId: class10B.id,
          gradeLevel: 10,
          section: 'B',
          dateOfBirth: '2009-01-11',
          gender: 'female',
          admissionDate: dateOnly(days(-320))
        },
        {
          userId: extraUsers[3].id,
          studentId: 'S-3005',
          name: extraUsers[3].name,
          email: extraUsers[3].email,
          classId: class10B.id,
          gradeLevel: 10,
          section: 'B',
          dateOfBirth: '2009-08-15',
          gender: 'female',
          admissionDate: dateOnly(days(-320))
        }
      ],
      { transaction: t, returning: true }
    );

    const allStudents = [loginStudent, ...extraStudents];

    const exams = await Exam.bulkCreate(
      [
        {
          title: 'Math Unit Test 1',
          subjectId: subjectByName.Mathematics.id,
          classId: class10A.id,
          teacherId: teacher.id,
          examDate: dateOnly(days(-14)),
          startTime: time(9, 0),
          endTime: time(10, 0),
          totalMarks: 100,
          passingMarks: 40,
          examType: 'unit_test',
          description: 'Algebra basics'
        },
        {
          title: 'Science Quiz 1',
          subjectId: subjectByName.Science.id,
          classId: class10A.id,
          teacherId: teacher.id,
          examDate: dateOnly(days(-12)),
          startTime: time(10, 0),
          endTime: time(10, 30),
          totalMarks: 50,
          passingMarks: 20,
          examType: 'quiz',
          description: 'Physics and Chemistry fundamentals'
        },
        {
          title: 'English Unit Test 1',
          subjectId: subjectByName.English.id,
          classId: class10A.id,
          teacherId: teacher.id,
          examDate: dateOnly(days(-10)),
          startTime: time(11, 0),
          endTime: time(12, 0),
          totalMarks: 100,
          passingMarks: 40,
          examType: 'unit_test',
          description: 'Comprehension and grammar'
        }
      ],
      { transaction: t, returning: true }
    );

    const assignments = await Assignment.bulkCreate(
      [
        {
          title: 'Math Homework 1',
          description: 'Practice set on linear equations',
          subjectId: subjectByName.Mathematics.id,
          classId: class10A.id,
          teacherId: teacher.id,
          dueDate: days(-8),
          totalMarks: 20,
          attachments: []
        },
        {
          title: 'Science Project 1',
          description: 'Write a short report on renewable energy',
          subjectId: subjectByName.Science.id,
          classId: class10A.id,
          teacherId: teacher.id,
          dueDate: days(-7),
          totalMarks: 30,
          attachments: []
        }
      ],
      { transaction: t, returning: true }
    );

    const examByTitle = Object.fromEntries(exams.map(e => [e.title, e]));
    const assignmentByTitle = Object.fromEntries(assignments.map(a => [a.title, a]));

    const mk = (obt, tot) => ({ marksObtained: obt, totalMarks: tot });

    const scoreMatrix = new Map([
      [loginStudent.id, { math: 76, sci: 34, eng: 68, hw: 14, proj: 21 }],
      [extraStudents[0].id, { math: 92, sci: 44, eng: 86, hw: 18, proj: 26 }],
      [extraStudents[1].id, { math: 58, sci: 25, eng: 61, hw: 11, proj: 18 }],
      [extraStudents[2].id, { math: 84, sci: 40, eng: 79, hw: 17, proj: 24 }],
      [extraStudents[3].id, { math: 66, sci: 29, eng: 54, hw: 13, proj: 16 }]
    ]);

    const resultsToCreate = [];
    for (const s of allStudents) {
      const scores = scoreMatrix.get(s.id);
      if (!scores) continue;

      resultsToCreate.push({
        studentId: s.id,
        examId: examByTitle['Math Unit Test 1'].id,
        ...mk(scores.math, 100),
        remarks: 'Unit test'
      });

      resultsToCreate.push({
        studentId: s.id,
        examId: examByTitle['Science Quiz 1'].id,
        ...mk(scores.sci, 50),
        remarks: 'Quiz'
      });

      resultsToCreate.push({
        studentId: s.id,
        examId: examByTitle['English Unit Test 1'].id,
        ...mk(scores.eng, 100),
        remarks: 'Unit test'
      });

      resultsToCreate.push({
        studentId: s.id,
        assignmentId: assignmentByTitle['Math Homework 1'].id,
        ...mk(scores.hw, 20),
        remarks: 'Homework'
      });

      resultsToCreate.push({
        studentId: s.id,
        assignmentId: assignmentByTitle['Science Project 1'].id,
        ...mk(scores.proj, 30),
        remarks: 'Project'
      });
    }

    await Result.bulkCreate(resultsToCreate, { transaction: t, individualHooks: true });

    const attendanceRows = [];
    const baseDate = days(-9);

    const attendancePattern = new Map([
      [loginStudent.id, ['present', 'present', 'absent', 'present', 'late', 'present', 'present', 'absent', 'present', 'present']],
      [extraStudents[0].id, ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present']],
      [extraStudents[1].id, ['absent', 'absent', 'present', 'absent', 'present', 'absent', 'present', 'absent', 'absent', 'present']],
      [extraStudents[2].id, ['present', 'late', 'present', 'present', 'present', 'present', 'late', 'present', 'present', 'present']],
      [extraStudents[3].id, ['present', 'absent', 'present', 'absent', 'present', 'present', 'absent', 'present', 'late', 'present']]
    ]);

    for (const s of allStudents) {
      const pattern = attendancePattern.get(s.id);
      if (!pattern) continue;

      for (let i = 0; i < pattern.length; i++) {
        attendanceRows.push({
          studentId: s.id,
          lessonId: lessons[i % lessons.length].id,
          date: dateOnly(days(-9 + i)),
          status: pattern[i],
          remarks: pattern[i] === 'absent' ? 'Not well' : null
        });
      }
    }

    await Attendance.bulkCreate(attendanceRows, { transaction: t });

    await Announcement.bulkCreate(
      [
        {
          title: 'Midterm Schedule Update',
          description: 'Midterm dates are updated. Please check the exam calendar.',
          publishedBy: adminUser.id,
          targetAudience: 'all',
          classId: null,
          priority: 'high',
          publishDate: days(-3),
          expiryDate: days(10)
        },
        {
          title: 'Grade 10-A Parent Meeting',
          description: 'Parent-teacher meeting for Grade 10-A on Friday 4 PM.',
          publishedBy: teacherUser.id,
          targetAudience: 'parents',
          classId: class10A.id,
          priority: 'medium',
          publishDate: days(-2),
          expiryDate: days(5)
        }
      ],
      { transaction: t }
    );

    await Event.bulkCreate(
      [
        {
          title: 'Science Fair',
          description: 'Annual science fair for all Grade 10 students.',
          startDate: days(15),
          endDate: days(15),
          location: 'Auditorium',
          eventType: 'academic',
          classId: null
        },
        {
          title: 'Sports Practice',
          description: 'After-school practice session.',
          startDate: days(4),
          endDate: days(4),
          location: 'Playground',
          eventType: 'sports',
          classId: class10B.id
        }
      ],
      { transaction: t }
    );

    await t.commit();

    console.log('✅ Seed completed successfully.');
    console.log('Login credentials:');
    console.log('- Admin: admin@school.com / admin');
    console.log('- Teacher: teach@school.com / teach123');
    console.log('- Student: stu@school.com / stu123');
  } catch (err) {
    await t.rollback();
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

main();
