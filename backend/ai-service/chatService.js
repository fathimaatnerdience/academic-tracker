import { model } from './config.js';
import AcademicContextBuilder from './contextBuilder.js';

/**
 * Academic Chat Service - Handles AI chat interactions
 */

export class AcademicChatService {
  constructor(models) {
    this.contextBuilder = new AcademicContextBuilder(models);
    this.models = models;
    this.conversationHistory = new Map(); // Store conversation history by user ID
    this.currentStudent = new Map(); // Track currently discussed student by user ID
  }

  isOutOfScopeForStudent(message = '') {
    const msg = String(message || '').toLowerCase();

    const indicators = [
      'best performer',
      'top performer',
      'top student',
      'best student',
      'rank',
      'ranking',
      'top 10',
      'lowest attendance',
      'highest attendance',
      'gender ratio',
      'boys',
      'girls',
      'male',
      'female',
      'overall',
      'all students',
      'everyone',
      'entire school',
      'whole school',
      'class attendance',
      'section attendance',
      'batch attendance'
    ];

    const asksAggregates = indicators.some(t => msg.includes(t));
    if (!asksAggregates) return false;

    const selfMarkers = ['my ', 'me ', 'mine', 'i ', 'myself'];
    const isExplicitlySelf = selfMarkers.some(t => msg.includes(t));

    return !isExplicitlySelf;
  }

  async generateResponse(userMessage, user = null) {
    try {
      const userId = user?.id || 'default';
      const role = user?.role || 'unknown';

      const normalizedMessage = String(userMessage || '').toLowerCase();

      // Check if this is a follow-up question about a previously mentioned student
      const currentStudentName = this.currentStudent.get(userId);
      const isFollowUpQuestion = this.isFollowUpQuestion(userMessage);
      
      // Build context based on the user's query
      const context = await this.contextBuilder.buildContextForQuery(userMessage, user);

      const asksBestPerformer =
        normalizedMessage.includes('best performing') ||
        normalizedMessage.includes('best performer') ||
        normalizedMessage.includes('top performer') ||
        normalizedMessage.includes('top performing');

      if ((role === 'admin' || role === 'teacher') && asksBestPerformer) {
        const top = Array.isArray(context.topPerformers) ? context.topPerformers : [];
        if (top.length > 0) {
          const best = top[0];
          const bestName = best?.name || 'Unknown';
          const bestAvg = best?.averageScore ?? 0;
          const bestAttendance = best?.attendanceRate ?? 0;
          return {
            success: true,
            response: `Best performing student: ${bestName}\nAverage score: ${bestAvg}%\nAttendance: ${bestAttendance}%`,
            contextUsed: Object.keys(context)
          };
        }

        return {
          success: true,
          response: 'I cannot identify the best performing student because there are no recorded marks/results yet (or percentages are missing). Please add exam/assignment results to enable performance rankings.',
          contextUsed: Object.keys(context)
        };
      }

      if (role === 'student') {
        if (!context.specificStudent) {
          return {
            success: true,
            response: 'Your student profile is not linked to this account yet, so I can only answer general study guidance right now. Please contact your admin to link your student profile.',
            contextUsed: Object.keys(context)
          };
        }

        if (this.isOutOfScopeForStudent(userMessage)) {
          return {
            success: true,
            response: 'I can only help with your own academic data (your marks, attendance, subjects, and improvement steps). I cannot provide other students\' data, class-wide rankings, gender ratios, or overall statistics.',
            contextUsed: Object.keys(context)
          };
        }
      }
      
      // If this is a follow-up and we have a current student, ensure they're in the context
      if (isFollowUpQuestion && currentStudentName && !context.specificStudent) {
        try {
          // Find the student from the existing students list
          const student = context.students?.find(s => 
            s.name.toLowerCase().includes(currentStudentName.toLowerCase())
          );
          if (student) {
            // Load full details for this student
            const fullStudent = await this.models.Student.findByPk(student.id, {
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
            
            if (fullStudent) {
              context.specificStudent = {
                ...fullStudent.toJSON(),
                averageScore: this.contextBuilder.calculateAverageScore(fullStudent.results),
                attendanceRate: this.contextBuilder.calculateAttendanceRate(fullStudent.attendances),
                weakSubjects: this.contextBuilder.identifyWeakSubjects(fullStudent.results),
                strongSubjects: this.contextBuilder.identifyStrongSubjects(fullStudent.results),
                subjectBreakdown: this.contextBuilder.getSubjectBreakdown(fullStudent.results)
              };
            }
          }
        } catch (error) {
          console.error('Error loading follow-up student context:', error);
        }
      }
      
      // Track the student mentioned in this response for future follow-ups
      if (context.specificStudent?.user?.name) {
        this.currentStudent.set(userId, context.specificStudent.user.name);
      }
      
      // Create system prompt with academic context
      const systemPrompt = this.createSystemPrompt(context, currentStudentName, isFollowUpQuestion, user);
      
      // Get or initialize conversation history
      const history = this.conversationHistory.get(userId) || [];
      
      // Build the conversation
      const chat = model.startChat({
        history: history,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.8,
          topK: 40
        }
      });

      // Generate response
      const result = await chat.sendMessage(`${systemPrompt}\n\nUser Query: ${userMessage}`);
      const response = result.response.text();
      
      // Update conversation history (keep last 10 exchanges)
      const newHistory = [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: response }] }
      ].slice(-20);
      
      this.conversationHistory.set(userId, newHistory);
      
      return {
        success: true,
        response: response,
        contextUsed: Object.keys(context)
      };
    } catch (error) {
      console.error('AI Chat Error:', error);
      return {
        success: false,
        error: error.message,
        response: 'I apologize, but I encountered an error processing your request. Please try again later.'
      };
    }
  }

  isFollowUpQuestion(message) {
    const followUpIndicators = ['she', 'he', 'they', 'this student', 'that student', 'the student', 'her', 'him', 'their', 'which subject', 'what about', 'how about', 'tell me more', 'weak', 'strong'];
    const msg = message.toLowerCase();
    return followUpIndicators.some(indicator => msg.includes(indicator));
  }

  createSystemPrompt(context, currentStudentName = null, isFollowUp = false, user = null) {
    const role = user?.role || 'unknown';
    const isStudent = role === 'student';

    let prompt = `You are an AI Academic Assistant for a school management system called "Academic Tracker".
Your role is to help users with questions about students, classes, attendance, exams, and academic performance.

CRITICAL FORMATTING RULES:
- NEVER use markdown formatting like asterisks (**) for bold, underscores, or other special formatting
- Present all information in clean, plain text format
- Use clear structure with line breaks and dashes for lists
- Percentages and numbers should be plain text (e.g., "75%" not "**75%**")

Guidelines:
1. Be helpful, professional, and concise in your responses
2. Use the provided context data to give accurate, data-driven answers
3. When discussing student performance, be constructive and suggest improvements when relevant
4. Format numbers and statistics clearly in plain text
5. If asked about something not in the context, provide general guidance based on educational best practices
6. Always maintain student privacy - never share sensitive personal information
7. Provide actionable insights and recommendations when appropriate
8. IMPORTANT ACCESS RULE: If the current user role is "student", you MUST ONLY answer using the logged-in student's own data that appears in the context. If the student asks about other students, classes, rank lists, top performers, gender ratio, or any overall statistics, you MUST refuse and say that they can only access their own data.
9. If role is "admin" or "teacher", you can answer school-level and class-level analytics questions.
10. When a student is mentioned, you have access to their complete subject breakdown
11. IMPORTANT: If asked about a specific student's subject performance, check their "Subject Breakdown" section and list actual subject names with scores
12. Each student entry includes subjectBreakdown showing every subject they take with individual scores
13. IMPORTANT: If the user asks a follow-up question using pronouns like "she", "he", "this student", refer to the CURRENTLY DISCUSSED STUDENT and check their Subject Breakdown
14. When listing subjects, ALWAYS use the actual subject names from the Subject Breakdown, never say "undefined"
15. IMPORTANT: If asked about a specific class or batch, use the SPECIFIC CLASS context (gender ratio, attendance summary, subject performance) when available

Available Data Context:`;

    // Add note about current student for follow-ups
    if (currentStudentName && isFollowUp) {
      prompt += `\n\n📝 CURRENTLY DISCUSSED STUDENT: ${currentStudentName}\n`;
      prompt += `When answering questions with "she", "he", "this student", or "which subject", assume the user is asking about ${currentStudentName}.\n`;
    }

    if (context.students && context.students.length > 0) {
      prompt += `\n\n📊 STUDENT DATA (${context.students.length} students):\n`;
      context.students.slice(0, 15).forEach(s => {
        prompt += `- ${s.name} (Grade ${s.gradeLevel}): Avg ${s.averageScore}%, Attendance ${s.attendanceRate}%\n`;
        if (s.weakSubjects.length > 0) {
          prompt += `  Weak in: ${s.weakSubjects.join(', ')}\n`;
        }
        if (s.strongSubjects.length > 0) {
          prompt += `  Strong in: ${s.strongSubjects.join(', ')}\n`;
        }
      });
    }

    if (context.topPerformers && context.topPerformers.length > 0) {
      prompt += `\n🏆 TOP PERFORMERS:\n`;
      context.topPerformers.slice(0, 5).forEach((s, i) => {
        prompt += `${i + 1}. ${s.name}: ${s.averageScore}% average\n`;
      });
    }

    if (context.studentsNeedingImprovement && context.studentsNeedingImprovement.length > 0) {
      prompt += `\n⚠️ STUDENTS NEEDING IMPROVEMENT (below 50%):\n`;
      context.studentsNeedingImprovement.slice(0, 5).forEach(s => {
        prompt += `- ${s.name}: ${s.averageScore}% average, Attendance ${s.attendanceRate}%\n`;
        if (s.weakSubjects.length > 0) {
          prompt += `  Needs help in: ${s.weakSubjects.join(', ')}\n`;
        }
      });
    }

    if (context.classStats && context.classStats.length > 0) {
      prompt += `\n📚 CLASS STATISTICS:\n`;
      context.classStats.forEach(c => {
        prompt += `- ${c.name} (Grade ${c.gradeLevel}): ${c.studentCount} students, Avg ${c.averageScore}%\n`;
      });
    }

    if (context.subjectPerformance && context.subjectPerformance.length > 0) {
      prompt += `\n📖 SUBJECT PERFORMANCE:\n`;
      context.subjectPerformance.forEach(s => {
        prompt += `- ${s.name}: ${s.averageScore}% average (${s.totalAssessments} assessments)\n`;
      });
    }

    if (context.attendanceSummary) {
      const a = context.attendanceSummary;
      prompt += `\n📋 ATTENDANCE SUMMARY:\n`;
      prompt += `- Total Records: ${a.total}\n`;
      prompt += `- Present: ${a.present} (${a.presentRate}%)\n`;
      prompt += `- Absent: ${a.absent} (${a.absentRate}%)\n`;
      prompt += `- Late: ${a.late}\n`;
      prompt += `- Excused: ${a.excused}\n`;
    }

    if (context.overallGenderSummary) {
      const g = context.overallGenderSummary;
      prompt += `\n\n👥 OVERALL GENDER SUMMARY (all students):\n`;
      prompt += `- Total Students: ${g.total}\n`;
      prompt += `- Girls: ${g.female} (${g.femaleRate}%)\n`;
      prompt += `- Boys: ${g.male} (${g.maleRate}%)\n`;
      prompt += `- Other: ${g.other} (${g.otherRate}%)\n`;
    }

    if (context.gradeGenderSummary) {
      const g = context.gradeGenderSummary;
      prompt += `\n\n🎓 GRADE ${g.gradeLevel} GENDER SUMMARY (all sections):\n`;
      prompt += `- Total Students: ${g.total}\n`;
      prompt += `- Girls: ${g.female} (${g.femaleRate}%)\n`;
      prompt += `- Boys: ${g.male} (${g.maleRate}%)\n`;
      prompt += `- Other: ${g.other} (${g.otherRate}%)\n`;
    }

    if (context.specificClass) {
      const c = context.specificClass;
      prompt += `\n\n🏫 SPECIFIC CLASS - ${c.name || 'Unknown'}:\n`;
      prompt += `- Grade Level: ${c.gradeLevel ?? 'N/A'}\n`;
      prompt += `- Section: ${c.section ?? 'N/A'}\n`;
      prompt += `- Academic Year: ${c.academicYear ?? 'N/A'}\n`;

      if (c.genderRatio) {
        prompt += `- Gender Ratio (Total ${c.genderRatio.total}):\n`;
        prompt += `  - Boys: ${c.genderRatio.male} (${c.genderRatio.maleRate}%)\n`;
        prompt += `  - Girls: ${c.genderRatio.female} (${c.genderRatio.femaleRate}%)\n`;
        prompt += `  - Other: ${c.genderRatio.other} (${c.genderRatio.otherRate}%)\n`;
      }

      if (c.attendanceSummary) {
        prompt += `- Class Attendance Summary:\n`;
        prompt += `  - Total Records: ${c.attendanceSummary.total}\n`;
        prompt += `  - Present: ${c.attendanceSummary.present} (${c.attendanceSummary.presentRate}%)\n`;
        prompt += `  - Absent: ${c.attendanceSummary.absent} (${c.attendanceSummary.absentRate}%)\n`;
        prompt += `  - Late: ${c.attendanceSummary.late}\n`;
        prompt += `  - Excused: ${c.attendanceSummary.excused}\n`;
      }

      if (c.subjectPerformance && c.subjectPerformance.length > 0) {
        prompt += `- Class Subject Performance (average %):\n`;
        c.subjectPerformance.slice(0, 12).forEach(s => {
          prompt += `  - ${s.subject}: ${s.averageScore}% (${s.assessments} assessments)\n`;
        });
      }
    }

    if (context.specificStudent) {
      const s = context.specificStudent;
      prompt += `\n\n👤 SPECIFIC STUDENT - ${s.user?.name || 'Unknown'}:\n`;
      prompt += `- Student ID: ${s.studentId}\n`;
      prompt += `- Class: ${s.class?.name || 'N/A'}\n`;
      prompt += `- Grade Level: ${s.gradeLevel}\n`;
      prompt += `- Gender: ${s.gender}\n`;
      if (s.age !== null && s.age !== undefined) {
        prompt += `- Age: ${s.age}\n`;
      }
      prompt += `- Overall Average: ${s.averageScore}%\n`;
      prompt += `- Attendance Rate: ${s.attendanceRate}%\n`;
      
      if (s.weakSubjects && s.weakSubjects.length > 0) {
        prompt += `- Weak Subjects: ${s.weakSubjects.join(', ')}\n`;
      }
      if (s.strongSubjects && s.strongSubjects.length > 0) {
        prompt += `- Strong Subjects: ${s.strongSubjects.join(', ')}\n`;
      }
      
      // Add detailed subject breakdown
      if (s.subjectBreakdown && Object.keys(s.subjectBreakdown).length > 0) {
        prompt += `- Subject Breakdown:\n`;
        Object.entries(s.subjectBreakdown).forEach(([subject, data]) => {
          prompt += `  - ${subject}: ${data.average}% (${data.assessments} assessments)\n`;
        });
      }
    }

    prompt += `\n\nNow respond to the user's query based on the above context.`;
    
    return prompt;
  }

  clearHistory(userId = 'default') {
    this.conversationHistory.delete(userId);
  }

  // Method to generate improvement suggestions
  async generateImprovementPlan(studentId) {
    try {
      const { Student, User, Result, Attendance, Exam, Assignment, Subject } = this.models;
      
      const student = await Student.findByPk(studentId, {
        include: [
          { model: User, as: 'user' },
          { 
            model: Result, 
            as: 'results',
            include: [
              { 
                model: Exam, 
                as: 'exam',
                include: [{ model: Subject, as: 'subject', attributes: ['id', 'subjectName'] }]
              },
              { 
                model: Assignment, 
                as: 'assignment',
                include: [{ model: Subject, as: 'subject', attributes: ['id', 'subjectName'] }]
              }
            ]
          },
          { model: Attendance, as: 'attendances' }
        ]
      });

      if (!student) {
        return { success: false, error: 'Student not found' };
      }

      const studentData = {
        name: student.user?.name || 'Unknown',
        averageScore: this.contextBuilder.calculateAverageScore(student.results),
        attendanceRate: this.contextBuilder.calculateAttendanceRate(student.attendances),
        weakSubjects: this.contextBuilder.identifyWeakSubjects(student.results),
        strongSubjects: this.contextBuilder.identifyStrongSubjects(student.results),
        gradeDistribution: this.contextBuilder.summarizeGrades(student.results)
      };

      const prompt = `As an educational advisor, create a personalized improvement plan for this student:

Student: ${studentData.name}
Current Average: ${studentData.averageScore}%
Attendance Rate: ${studentData.attendanceRate}%
Weak Subjects: ${studentData.weakSubjects.join(', ') || 'None identified'}
Strong Subjects: ${studentData.strongSubjects.join(', ') || 'None identified'}

Provide:
1. A brief analysis of their current performance
2. 3-4 specific, actionable recommendations
3. Study strategies for weak subjects
4. How to maintain strength in good subjects
5. An encouraging closing message

Keep it concise and practical.`;

      const result = await model.generateContent(prompt);
      
      return {
        success: true,
        improvementPlan: result.response.text(),
        studentData
      };
    } catch (error) {
      console.error('Improvement Plan Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Method to generate class analysis
  async generateClassAnalysis(classId) {
    try {
      const { Class, Student, Result } = this.models;
      
      const classData = await Class.findByPk(classId, {
        include: [{
          model: Student,
          as: 'students',
          include: [
            { model: this.models.User, as: 'user' },
            { model: Result, as: 'results' }
          ]
        }]
      });

      if (!classData) {
        return { success: false, error: 'Class not found' };
      }

      const analysis = {
        className: classData.name,
        studentCount: classData.students?.length || 0,
        averageScore: this.contextBuilder.calculateClassAverage(classData.students),
        topStudents: classData.students
          ?.map(s => ({
            name: s.user?.name || 'Unknown',
            score: this.contextBuilder.calculateAverageScore(s.results)
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5) || [],
        strugglingStudents: classData.students
          ?.map(s => ({
            name: s.user?.name || 'Unknown',
            score: this.contextBuilder.calculateAverageScore(s.results)
          }))
          .filter(s => s.score < 50)
          .sort((a, b) => a.score - b.score) || []
      };

      const prompt = `Analyze this class performance and provide insights:

Class: ${analysis.className}
Total Students: ${analysis.studentCount}
Class Average: ${analysis.averageScore}%

Top 3 Students:
${analysis.topStudents.slice(0, 3).map((s, i) => `${i + 1}. ${s.name}: ${s.score}%`).join('\n')}

Students Needing Support (${analysis.strugglingStudents.length}):
${analysis.strugglingStudents.slice(0, 5).map(s => `- ${s.name}: ${s.score}%`).join('\n')}

Provide:
1. Overall class performance assessment
2. Teaching strategy recommendations
3. Intervention suggestions for struggling students
4. Ways to challenge top performers
5. Brief action plan for the teacher`;

      const result = await model.generateContent(prompt);
      
      return {
        success: true,
        analysis: result.response.text(),
        data: analysis
      };
    } catch (error) {
      console.error('Class Analysis Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default AcademicChatService;
