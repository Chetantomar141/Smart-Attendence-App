import db from "../models/index.js";
const Event = db.events;

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location } = req.body;
    const attachment = req.file ? req.file.filename : null;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      attachment,
      createdBy: req.userId
    });

    res.status(201).send({ message: "Event created successfully!", event });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['date', 'DESC']],
      include: [{ model: db.users, attributes: ['name', 'role'] }]
    });
    res.send(events);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.destroy({ where: { id } });
    res.send({ message: "Event deleted successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
