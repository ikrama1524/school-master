import { 
  users, students, teachers, attendance, fees, notices,
  type User, type InsertUser,
  type Student, type InsertStudent,
  type Teacher, type InsertTeacher,
  type Attendance, type InsertAttendance,
  type Fee, type InsertFee,
  type Notice, type InsertNotice
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<Student>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Teachers
  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: number): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: number, teacher: Partial<Teacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: number): Promise<boolean>;
  
  // Attendance
  getAttendance(date?: Date): Promise<Attendance[]>;
  getStudentAttendance(studentId: number): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  
  // Fees
  getFees(): Promise<Fee[]>;
  getStudentFees(studentId: number): Promise<Fee[]>;
  createFee(fee: InsertFee): Promise<Fee>;
  updateFee(id: number, fee: Partial<Fee>): Promise<Fee | undefined>;
  
  // Notices
  getNotices(): Promise<Notice[]>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  
  // Stats
  getStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number;
    feeCollection: number;
    pendingFees: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private teachers: Map<number, Teacher>;
  private attendance: Map<number, Attendance>;
  private fees: Map<number, Fee>;
  private notices: Map<number, Notice>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.teachers = new Map();
    this.attendance = new Map();
    this.fees = new Map();
    this.notices = new Map();
    this.currentIds = {
      users: 1,
      students: 1,
      teachers: 1,
      attendance: 1,
      fees: 1,
      notices: 1,
    };

    // Initialize with some default data
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    const adminUser: User = {
      id: this.currentIds.users++,
      username: "admin",
      password: "admin123", // In real app, this would be hashed
      role: "admin",
      name: "John Anderson",
      email: "admin@school.edu",
      phone: "+1234567890",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample students
    const sampleStudents: Student[] = [
      {
        id: this.currentIds.students++,
        rollNumber: "2024001",
        name: "Aarav Sharma",
        email: "aarav@student.edu",
        phone: "+1234567891",
        dateOfBirth: new Date("2010-05-15"),
        gender: "male",
        class: "10",
        section: "A",
        parentName: "Rajesh Sharma",
        parentPhone: "+1234567892",
        parentEmail: "rajesh@parent.com",
        address: "123 Main St, City",
        admissionDate: new Date("2024-10-20"),
        isActive: true,
      },
      {
        id: this.currentIds.students++,
        rollNumber: "2024002",
        name: "Priya Gupta",
        email: "priya@student.edu",
        phone: "+1234567893",
        dateOfBirth: new Date("2012-08-22"),
        gender: "female",
        class: "8",
        section: "B",
        parentName: "Suresh Gupta",
        parentPhone: "+1234567894",
        parentEmail: "suresh@parent.com",
        address: "456 Oak Ave, City",
        admissionDate: new Date("2024-10-19"),
        isActive: true,
      },
      {
        id: this.currentIds.students++,
        rollNumber: "2024003",
        name: "Rohan Kumar",
        email: "rohan@student.edu",
        phone: "+1234567895",
        dateOfBirth: new Date("2008-12-10"),
        gender: "male",
        class: "12",
        section: "C",
        parentName: "Amit Kumar",
        parentPhone: "+1234567896",
        parentEmail: "amit@parent.com",
        address: "789 Pine St, City",
        admissionDate: new Date("2024-10-18"),
        isActive: true,
      },
    ];

    sampleStudents.forEach(student => this.students.set(student.id, student));

    // Create sample teachers
    const sampleTeachers: Teacher[] = [
      {
        id: this.currentIds.teachers++,
        employeeId: "TCH001",
        name: "Dr. Sarah Johnson",
        email: "sarah@school.edu",
        phone: "+1234567897",
        dateOfBirth: new Date("1985-03-20"),
        gender: "female",
        subject: "Mathematics",
        qualification: "PhD in Mathematics",
        experience: 10,
        salary: "50000.00",
        joinDate: new Date("2020-01-15"),
        isActive: true,
      },
      {
        id: this.currentIds.teachers++,
        employeeId: "TCH002",
        name: "Mr. David Wilson",
        email: "david@school.edu",
        phone: "+1234567898",
        dateOfBirth: new Date("1980-07-12"),
        gender: "male",
        subject: "Physics",
        qualification: "MSc Physics",
        experience: 15,
        salary: "55000.00",
        joinDate: new Date("2018-08-20"),
        isActive: true,
      },
    ];

    sampleTeachers.forEach(teacher => this.teachers.set(teacher.id, teacher));

    // Create sample notices
    const sampleNotices: Notice[] = [
      {
        id: this.currentIds.notices++,
        title: "Parent-Teacher Meeting",
        content: "Parent-Teacher meeting scheduled for October 25, 2024",
        priority: "high",
        targetAudience: "parents",
        createdBy: adminUser.id,
        createdAt: new Date(),
        isActive: true,
      },
      {
        id: this.currentIds.notices++,
        title: "Sports Day Registration",
        content: "Register for annual sports day by October 22, 2024",
        priority: "normal",
        targetAudience: "students",
        createdBy: adminUser.id,
        createdAt: new Date(),
        isActive: true,
      },
    ];

    sampleNotices.forEach(notice => this.notices.set(notice.id, notice));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "admin",
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Student methods
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentIds.students++;
    const rollNumber = `2024${String(id).padStart(3, '0')}`;
    const student: Student = {
      ...insertStudent,
      id,
      rollNumber,
      admissionDate: new Date(),
      email: insertStudent.email || null,
      phone: insertStudent.phone || null,
      address: insertStudent.address || null,
      parentEmail: insertStudent.parentEmail || null,
      isActive: insertStudent.isActive ?? true,
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, studentUpdate: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...studentUpdate };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  // Teacher methods
  async getTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }

  async getTeacher(id: number): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = this.currentIds.teachers++;
    const employeeId = `TCH${String(id).padStart(3, '0')}`;
    const teacher: Teacher = {
      ...insertTeacher,
      id,
      employeeId,
      joinDate: new Date(),
      dateOfBirth: insertTeacher.dateOfBirth || null,
      gender: insertTeacher.gender || null,
      subject: insertTeacher.subject || null,
      qualification: insertTeacher.qualification || null,
      experience: insertTeacher.experience || null,
      salary: insertTeacher.salary || null,
      isActive: insertTeacher.isActive ?? true,
    };
    this.teachers.set(id, teacher);
    return teacher;
  }

  async updateTeacher(id: number, teacherUpdate: Partial<Teacher>): Promise<Teacher | undefined> {
    const teacher = this.teachers.get(id);
    if (!teacher) return undefined;
    
    const updatedTeacher = { ...teacher, ...teacherUpdate };
    this.teachers.set(id, updatedTeacher);
    return updatedTeacher;
  }

  async deleteTeacher(id: number): Promise<boolean> {
    return this.teachers.delete(id);
  }

  // Attendance methods
  async getAttendance(date?: Date): Promise<Attendance[]> {
    const allAttendance = Array.from(this.attendance.values());
    if (!date) return allAttendance;
    
    const targetDate = date.toDateString();
    return allAttendance.filter(att => att.date.toDateString() === targetDate);
  }

  async getStudentAttendance(studentId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(att => att.studentId === studentId);
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = this.currentIds.attendance++;
    const attendance: Attendance = { 
      ...insertAttendance, 
      id,
      remarks: insertAttendance.remarks || null
    };
    this.attendance.set(id, attendance);
    return attendance;
  }

  // Fee methods
  async getFees(): Promise<Fee[]> {
    return Array.from(this.fees.values());
  }

  async getStudentFees(studentId: number): Promise<Fee[]> {
    return Array.from(this.fees.values()).filter(fee => fee.studentId === studentId);
  }

  async createFee(insertFee: InsertFee): Promise<Fee> {
    const id = this.currentIds.fees++;
    const fee: Fee = { 
      ...insertFee, 
      id,
      status: insertFee.status || "pending",
      remarks: insertFee.remarks || null,
      paidDate: insertFee.paidDate || null,
      paymentMethod: insertFee.paymentMethod || null
    };
    this.fees.set(id, fee);
    return fee;
  }

  async updateFee(id: number, feeUpdate: Partial<Fee>): Promise<Fee | undefined> {
    const fee = this.fees.get(id);
    if (!fee) return undefined;
    
    const updatedFee = { ...fee, ...feeUpdate };
    this.fees.set(id, updatedFee);
    return updatedFee;
  }

  // Notice methods
  async getNotices(): Promise<Notice[]> {
    return Array.from(this.notices.values()).filter(notice => notice.isActive);
  }

  async createNotice(insertNotice: InsertNotice): Promise<Notice> {
    const id = this.currentIds.notices++;
    const notice: Notice = { 
      ...insertNotice, 
      id,
      createdAt: new Date(),
      priority: insertNotice.priority || "normal",
      isActive: insertNotice.isActive ?? true,
    };
    this.notices.set(id, notice);
    return notice;
  }

  // Stats methods
  async getStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number;
    feeCollection: number;
    pendingFees: number;
  }> {
    const totalStudents = this.students.size;
    const totalTeachers = this.teachers.size;
    
    // Calculate attendance rate (mock calculation)
    const attendanceRate = 94.2;
    
    // Calculate fee collection (mock calculation)
    const allFees = Array.from(this.fees.values());
    const totalFees = allFees.reduce((sum, fee) => sum + parseFloat(fee.amount || "0"), 0);
    const paidFees = allFees
      .filter(fee => fee.status === "paid")
      .reduce((sum, fee) => sum + parseFloat(fee.amount || "0"), 0);
    
    return {
      totalStudents,
      totalTeachers,
      attendanceRate,
      feeCollection: paidFees || 1850000, // Mock value in rupees
      pendingFees: totalFees - paidFees || 250000, // Mock value
    };
  }
}

export const storage = new MemStorage();
