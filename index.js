const express = require("express"); //підключаю експерс
const fs = require("fs"); // підключаю файлову систему
const multer = require("multer"); // підключаю мультер для роботи з файлами
const bodyParser = require("body-parser");

const upload = multer();
const app = express();


const notesFile = (__dirname + "/notes.json"); //створюю джесон файл з нотатками
app.use(bodyParser.raw({type:"text:plain"}))
if (!fs.existsSync(notesFile)) {
    fs.writeFileSync(notesFile, '[]');
}

app.get('/', (req, res) => { //вивід при запиті гет
    res.send(`<h1>Запити</h1>
            1. /notes (всі нотатки) <b1>
            2. /UploadForm.html (форма для запису всіх нотатків) <b1>
            3. /notes/<note_name> (пошук окремого нотатку)<b1>`);
})

app.get('/notes', (req, res) => { // вивід нотаток
    try {
        const data = fs.readFileSync(notesFile, 'utf8');  // читаю файл
        const notes = data ? JSON.parse(data) : [];  // парсую файл
        res.json(notes);  // виводжу результат
    } catch (e) {
        res.status(500).send("error while reading notes");  
    }
});

app.get('/UploadForm.html', (req, res) => {  // додавання нотаток через форму
    const path = (__dirname + '/static/UploadForm.html');  // вивід форми
    res.sendFile(path);
})

app.post('/upload', upload.fields([{ name: 'note_name' }, { name: 'note' }]), (req, res) => {  // завантаження нотаток
    const { note_name, note } = req.body; //запрошую даін з хтмл

    try {
        const data = fs.readFileSync(notesFile, 'utf8'); //читаю файл з нотатками
        const notes = data ? JSON.parse(data) : []; //парсую дані

        const existingNote = notes.find(n => n.note_name === note_name);
        if (existingNote) {
            return res.status(400).send("There is already a note with this name"); //перевірка чи така нотатка вже існує
        }

        notes.push({ note_name, note }); //впроваджую зміни
        fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));
        res.status(201).send("Note is uploaded succesfully");
    } catch (e) {
        res.status(500).send("An error while processing a note");
    }
});

app.get('/notes/:noteName', (req, res) => {  // вивід нотатки за іменем
    const noteName = req.params.noteName;

    try {
        const data = fs.readFileSync(notesFile, 'utf8');//читаю дані з файлу
        const notes = data ? JSON.parse(data) : []; //парусю дані

        const foundNote = notes.find(note => note.note_name === noteName); //шукаю нотатку з таким же ж іменем

        if (!foundNote) {
            return res.status(404).send("There is no such note"); //перевірка чи така нотатка взагалі існує
        }

        res.send(foundNote.note);
    } catch (e) {
        res.status(500).send("An error while readinf a note");
    }
});

app.put('/notes/:noteName', express.text(), (req, res) => { //зміна нотатки
    const noteName = req.params.noteName;
    const note = req.body;

    try {
        let data = fs.readFileSync(notesFile, 'utf8'); //читаю файл з нотатками
        const notes = data ? JSON.parse(data) : []; //парсую дані

        const foundNoteIndex = notes.findIndex(note => note.note_name === noteName); //шукаю нотатку з таким же ж іменнем

        if (foundNoteIndex === -1) {
            return res.status(404).send("There is no such note"); //на випадок що такої нотатки нема
        }

        // Заміна тексту нотатки
        notes[foundNoteIndex].note = note;
        fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));

        res.send("Text is changed succesfully");
    } catch (e) {
        res.status(500).send("An error while updating note");
    }
});

app.delete('/notes/:noteName', (req, res) => {  // видалення нотатки
    const noteName = req.params.noteName;

    try {
        let data = fs.readFileSync(notesFile, 'utf8');
        const notes = data ? JSON.parse(data) : [];

        const foundNoteIndex = notes.findIndex(note => note.note_name === noteName);

        if (foundNoteIndex === -1) {
            return res.status(404).send("There is no such note");
        }

        notes.splice(foundNoteIndex, 1);
        fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));

        res.send("A note is deleted");
    } catch (e) {
        res.status(500).send("An error while deleting a note");
    }
});

app.listen(8000);
