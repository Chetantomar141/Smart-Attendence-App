import db from "./models/index.js";
const User = db.users;
const Fee = db.fees;
const Expense = db.expenses;
const Notice = db.notices;
const Event = db.events;
const Assignment = db.assignments;
import bcrypt from "bcryptjs";

const seed = async () => {
  try {
    await db.sequelize.sync({ force: true });
    console.log("Database dropped and synced.");

    // Create Admin
    const admin = await User.create({
      username: "admin",
      password: bcrypt.hashSync("admin123", 8),
      role: "admin",
      name: "System Admin",
      email: "admin@school.com",
      uniqueId: "ADM001"
    });

    // Create Teacher
    const teacher = await User.create({
      username: "teacher",
      password: bcrypt.hashSync("teacher123", 8),
      role: "teacher",
      name: "John Doe",
      email: "john@school.com",
      uniqueId: "TEA001"
    });

    // Create Parent
    const parent = await User.create({
      username: "parent",
      password: bcrypt.hashSync("parent123", 8),
      role: "parent",
      name: "Mr. Smith",
      email: "smith@parent.com",
      uniqueId: "PAR001"
    });

    // Create Student
    const student = await User.create({
      username: "student",
      password: bcrypt.hashSync("student123", 8),
      role: "student",
      name: "Jane Smith",
      email: "jane@school.com",
      uniqueId: "STU001",
      class: "10A",
      rollNo: "01",
      subjects: ["Mathematics", "Science", "English", "History"],
      teacherId: teacher.id,
      parentId: parent.id
    });

    // Create Fees for Student
    await Fee.create({
      total: 50000,
      paid: 35000,
      status: "Pending",
      userId: student.id
    });

    // Create Expenses
    await Expense.create({ title: "Electricity Bill", amount: 12000, date: "2026-03-01", category: "Utility" });
    await Expense.create({ title: "Teacher Salaries", amount: 450000, date: "2026-03-05", category: "Salary" });
    await Expense.create({ title: "Lab Equipment", amount: 85000, date: "2026-03-10", category: "Academic" });

    // Create Notices
    await Notice.create({
      title: "Annual Sports Day",
      description: "The annual sports day will be held on 25th March. All students must participate.",
      date: "2026-03-25",
      createdBy: admin.id
    });

    await Notice.create({
      title: "Examination Schedule",
      description: "The final examination schedule has been posted on the website. Please check your dashboard.",
      date: "2026-04-01",
      createdBy: teacher.id
    });

    // Create Events
    await Event.create({
      title: "Science Fair 2026",
      description: "Showcase your innovation at the annual science fair.",
      date: "2026-03-30",
      time: "10:00 AM",
      location: "Main Hall",
      createdBy: admin.id
    });

    // Create Assignments
    await Assignment.create({
      title: "Mathematics Project",
      description: "Complete the geometry section exercises 1-10.",
      deadline: "2026-04-05",
      teacherId: teacher.id
    });

    console.log("Database seeded successfully.");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seed();
