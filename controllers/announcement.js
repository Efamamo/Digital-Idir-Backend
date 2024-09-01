const Announcement = require('../models/announcement');
const { validationResult } = require('express-validator');
const sendAnnouncement = require('../cron/announcement');

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.json(announcements);
  } catch (e) {
    res.status(500).send(e);
  }
};

const getAnnouncementById = async (req, res) => {
  const id = req.params.id;
  try {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).send({ error: 'announcement not found' });
    }

    return res.json(announcement);
  } catch (e) {
    res.status(500).send(e);
  }
};

const addAnnouncement = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }

  try {
    const { description } = req.body;
    const newAnnouncement = new Announcement({
      description,
    });

    const result = await newAnnouncement.save();

    sendAnnouncement();
    return res.status(201).json(newAnnouncement);
  } catch (e) {
    res.status(500).send(e);
  }
};

const updateAnnouncement = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }
  const id = req.params.id;
  try {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).send({ error: 'announcement not found' });
    }
    const { description } = req.body;

    announcement.description = description;

    const n = await announcement.save();

    return res.json(n);
  } catch (e) {
    res.status(500).send(e);
  }
};

const deleteAnnouncement = async (req, res) => {
  const id = req.params.id;
  try {
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).send({ error: 'announcement not found' });
    }

    return res.status(204).json();
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.addAnnouncement = addAnnouncement;
exports.getAnnouncements = getAnnouncements;
exports.getAnnouncementById = getAnnouncementById;
exports.updateAnnouncement = updateAnnouncement;
exports.deleteAnnouncement = deleteAnnouncement;
