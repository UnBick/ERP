export interface TeacherRole {
  isClassTeacher: boolean;
  classTeacherFor: {
    classId: string;
    sectionId: string;
    subjects: string[];
  }[];
  isSubjectTeacher: boolean;
  subjectTeacherFor: {
    classId: string;
    sectionId: string;
    subjectId: string;
  }[];
}

export interface ClassSection {
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface GradeSubmission {
  classId: string;
  sectionId: string;
  subjectId: string;
  examType: string;
  grades: Record<string, number>;
  date: string;
  maxMarks: number;
}
