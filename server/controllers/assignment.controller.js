import db from "../models/index.js";
const Assignment = db.assignments;
const Submission = db.submissions;

export const createAssignment = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const attachment = req.file ? req.file.filename : null;

    const assignment = await Assignment.create({
      title,
      description,
      deadline,
      attachment,
      teacherId: req.userId
    });

    res.status(201).send({ message: "Assignment created successfully!", assignment });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      where: { teacherId: req.userId },
      include: [{ model: Submission, attributes: ['id', 'studentId', 'submissionDate', 'attachment', 'grade'] }]
    });
    res.send(assignments);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getStudentAssignments = async (req, res) => {
  try {
    // A student can see assignments from their teacher
    const student = await db.users.findByPk(req.userId);
    const assignments = await Assignment.findAll({
      where: { teacherId: student.teacherId },
      include: [{ 
        model: Submission, 
        where: { studentId: req.userId }, 
        required: false 
      }]
    });
    res.send(assignments);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const attachment = req.file ? req.file.filename : null;

    if (!attachment) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    const submission = await Submission.create({
      studentId: req.userId,
      assignmentId,
      attachment
    });

    res.status(201).send({ message: "Assignment submitted successfully!", submission });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;

    await Submission.update(
      { grade, feedback },
      { where: { id } }
    );

    res.send({ message: "Submission graded successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
