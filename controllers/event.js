const Event = require('../models/event');
const { validationResult } = require('express-validator');

const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (e) {
    res.status(500).send(e);
  }
};

const getEventById = async (req, res) => {
  const id = req.params.id;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).send({ error: 'event not found' });
    }

    return res.json(event);
  } catch (e) {
    res.status(500).send(e);
  }
};

const addEvent = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }

  try {
    const { title, description, date, location } = req.body;
    const today = new Date();

    // Convert date strings to Date objects
    const edate = new Date(date);

    // Validation checks
    if (edate < today) {
      return res.status(400).json({
        errors: { date: 'Date of event cannot be in the past' },
      });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      location,
    });
    const result = await newEvent.save();

    return res.status(201).json(newEvent);
  } catch (e) {
    res.status(500).send(e);
  }
};

const updateEvent = async (req, res) => {
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
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).send({ error: 'event not found' });
    }
    const { title, description, date, location } = req.body;

    const today = new Date();

    // Convert date strings to Date objects
    const edate = new Date(date);

    // Validation checks
    if (edate < today) {
      return res.status(400).json({
        errors: { date: 'Date of event cannot be in the past' },
      });
    }

    event.title = title;
    event.description = description;
    event.date = date;
    event.location = location;

    const e = await event.save();

    return res.json(e);
  } catch (e) {
    res.status(500).send(e);
  }
};

const deleteEvent = async (req, res) => {
  const id = req.params.id;
  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).send({ error: 'event not found' });
    }

    return res.status(204).json();
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.addEvent = addEvent;
exports.getEvents = getEvents;
exports.getEventById = getEventById;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
