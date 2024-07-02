const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv } = require('uuid');
const methodOverride = require('method-override');

const app = express();

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

const projects = [
    {
        id: uuidv(),
        title: "DevPost Hackathon",
        tasks: [
            "task1",
            "task2",
            "task3",
            "task4"
        ]
    }
];

app.get('/', (req, res) => {
    res.render('dashboard', { projects });
});

app.get('/project/:id', (req, res) => {
    const id = req.params.id;
    const proj = projects.find(proj => proj.id === id);
    if (proj) {
        res.render('index', { proj });
    } else {
        res.render('notFound', { proj: id });
    }
});

app.get('/new', (req, res) => {
    res.render('new');
});

app.post('/project', (req, res) => {
    const title = req.body.proj_name;
    const newProject = { id: uuidv(), title };
    projects.push(newProject);
    res.redirect(`/project/${newProject.id}`);
});

app.get('/search', (req, res) => {
    const query = req.query.proj_search;
    const result = projects.find(proj => proj.id === query || proj.title.toLowerCase().split(" ").join("") === query.toLowerCase().split(" ").join(""));
    if (result) {
        res.redirect(`/project/${result.id}`);
    } else {
        res.render('notFound', { proj: query });
    }
});

app.get('/project/:id/edit', (req, res) => {
	const { id } = req.params;
	const proj = projects.find(proj => proj.id === id);
    if(proj){
        res.render('edit',{proj});
    }else{
        res.render('notFound', {proj});
    }
})

app.patch('/project/:id', (req, res) => {
	const { id } = req.params;
	const newTitle = req.body.project_title;
	const project = projects.find(proj => proj.id === id);
	if (project) {
        project.title = newTitle;
        res.redirect('/');
    }else{
        res.send(`${id} not found!!`)
    }
})

app.listen(8080, () => {
    console.log("running on port 8080...");
});
