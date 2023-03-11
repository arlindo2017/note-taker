const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');

const PORT = process.env.PORT || 3001;
const app = express();

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);



// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Functions to read and write
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );



const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        parsedData.push(content);
        writeToFile(file, parsedData);
      }
    });
};


//Allow access to all files in public directory
app.use(express.static('public'));

// Route all requests to index.html
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

//GET notes should return the notes.html file.
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

//GET /api/notes should read the db.json file and return all saved notes as JSON.
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
  });

  //POST /api/notes should receive a new note to save on the request body, add it to the db.json file, and then return the new note to the client. You'll need to find a way to give each note a unique id when it's saved (look into npm packages that could do this for you).
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a new note`);
  
    const { title, text } = req.body;
  
    if (req.body) {
      const newNote = {
        title,
        text,
        //tip_id: uuid(),
      };
  
      readAndAppend(newNote, './db/db.json');
      res.json(`Note was added successfully 🚀`);
    } else {
      res.error('Error adding new note');
    }
  });










app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);