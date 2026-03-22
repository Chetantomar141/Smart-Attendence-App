import db from "../models/index.js";
const Notice = db.notices;

export const createNotice = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const attachment = req.file ? req.file.filename : null;

    const notice = await Notice.create({
      title,
      description,
      date,
      attachment,
      createdBy: req.userId
    });

    res.status(201).send({ message: "Notice created successfully!", notice });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.findAll({
      order: [['date', 'DESC']],
      include: [{ model: db.users, attributes: ['name', 'role'] }]
    });
    res.send(notices);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await Notice.destroy({ where: { id } });
    res.send({ message: "Notice deleted successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
