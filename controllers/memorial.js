const Memorial = require('../models/memorial');
const { validationResult } = require('express-validator');
const fs = require('fs');

const getMemorials = async (req, res) => {
  try {
    const memorials = await Memorial.find();
    res.json(memorials);
  } catch (e) {
    res.status(500).send(e);
  }
};

const getMemorialById = async (req, res) => {
  const id = req.params.id;
  try {
    const memorial = await Memorial.findById(id);
    if (!memorial) {
      return res.status(404).json({ error: 'memorial not found' });
    }

    return res.json(memorial);
  } catch (e) {
    res.status(500).send(e);
  }
};

const addMemorial = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }

    return res.status(400).json({ errors: formattedErrors });
  }

  try {
    const { name, description, dateOfBirth, dateOfPassing } = req.body;

    // Get today's date
    const today = new Date();

    // Convert date strings to Date objects
    const birthDate = new Date(dateOfBirth);
    const passingDate = new Date(dateOfPassing);

    // Validation checks
    if (birthDate > today) {
      return res.status(400).json({
        errors: { dateOfBirth: 'Date of birth cannot be in the future' },
      });
    }

    if (passingDate > today) {
      return res.status(400).json({
        errors: { dateOfPassing: 'Date of passing cannot be in the future' },
      });
    }

    if (passingDate <= birthDate) {
      return res.status(400).json({
        errors: {
          dateOfPassing: 'Date of passing must be after the date of birth',
        },
      });
    }
    const newMemorial = new Memorial({
      name,
      description,
      imageUrl: req.file ? req.file.path : '',
      dateOfBirth,
      dateOfPassing,
    });

    await newMemorial.save();
    return res.status(201).json(newMemorial);
  } catch (e) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }
    res.status(500).json({ errors: { server: 'server error' } });
  }
};

const updateMemorial = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).json({ errors: formattedErrors });
  }

  const id = req.params.id;
  try {
    const memorial = await Memorial.findById(id);
    if (!memorial) {
      return res.status(404).json({ error: 'memorial not found' });
    }
    const { name, description, dateOfBirth, dateOfPassing } = req.body;

    // Get today's date
    const today = new Date();

    // Convert date strings to Date objects
    const birthDate = new Date(dateOfBirth);
    const passingDate = new Date(dateOfPassing);

    // Validation checks
    if (birthDate > today) {
      return res
        .status(400)
        .json({ error: 'Date of birth cannot be in the future' });
    }

    if (passingDate > today) {
      return res
        .status(400)
        .json({ error: 'Date of passing cannot be in the future' });
    }

    if (passingDate <= birthDate) {
      return res
        .status(400)
        .json({ error: 'Date of passing must be after the date of birth' });
    }

    memorial.name = name;
    memorial.description = description;
    memorial.dateOfBirth = dateOfBirth;
    memorial.dateOfPassing = dateOfPassing;

    const n = await memorial.save();

    return res.json(n);
  } catch (e) {
    res.status(500).send(e);
  }
};

const deleteMemorial = async (req, res) => {
  const id = req.params.id;
  try {
    const memorial = await Memorial.findByIdAndDelete(id);
    if (!memorial) {
      return res.status(404).send({ error: 'memorial not found' });
    }

    return res.status(204).json();
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.addMemorial = addMemorial;
exports.getMemorials = getMemorials;
exports.getMemorialById = getMemorialById;
exports.updateMemorial = updateMemorial;
exports.deleteMemorial = deleteMemorial;
