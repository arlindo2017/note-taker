//Import Libraries
const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { writeToFile, readAndAppend  } = require('./helpers/helpers.js');
const { v4: uuid } = require('uuid');

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON and urlencoded form data
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Allow access to all files in public directory
app.use(express.static('public'));

//GET notes returns the notes.html file.
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

//GET read the db.json file and return all saved notes as JSON.
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

//POST /api/notes should receive a new note to save on the request body, add it to the db.json file, and then return the new note to the client. You'll need to find a way to give each note a unique id when it's saved (look into npm packages that could do this for you).
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a new note`);
  
    const { title, text} = req.body;
  
    if (req.body) {
      const newNote = {
        title,
        text,
        id: uuid(),
      };
      readAndAppend(newNote, './db/db.json');
      res.json(`Note was added successfully 🚀`);
    } else {
      res.error('Error adding new note');
    }
});

// Delete route by ID
app.delete('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    console.info(`${req.method} request received to delete note with id ${id}`);
  
    readFromFile('./db/db.json')
      .then((data) => JSON.parse(data))
      .then((notes) => {
        // Filter out the note with the specified id
        const filteredNotes = notes.filter((note) => note.id !== id);
  
        // Write the filtered notes back to the file
        writeToFile('./db/db.json', filteredNotes);
        res.json(`Note with id ${id} was deleted successfully 🚀`);
      })
  });

//Route all requests to index.html, this needs to be after ALL ROUTES !!!
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

//Server Port
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);