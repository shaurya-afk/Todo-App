const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv } = require('uuid');
const methodOverride = require('method-override');
const fs = require('fs').promises;

const app = express();

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const projectsFile = path.join(__dirname, 'projects.json');

const readProjects = async () => {
    try{
        const data = await fs.readFile(projectsFile, 'utf-8');
        return JSON.parse(data);
    }catch(err){
        console.log(err);
        return [];
    }
};

const writeProjects = async (projects) => {
    try {
        await fs.writeFile(projectsFile, JSON.stringify(projects, null, 2));
    } catch (err) {
        console.error("Error writing to projects file:", err);
    }
};

app.get('/', async (req, res) => {
    const projects = await readProjects();
    res.render('dashboard', { projects });
});

app.get('/project/:id', async (req, res) => {
    const projects = await readProjects();
    const id = req.params.id;
    const proj = projects.find(proj => proj.id === id);
    if (proj) {
        res.render('index', { proj });
    } else {
        res.render('notFound', { proj: id });
    }
});

app.get('/new', async (req, res) => {
    res.render('new');
});

app.post('/project', async (req, res) => {
    const projects = await readProjects();
    const title = req.body.proj_name;
    const newProject = { id: uuidv(), title, tasks: []};
    projects.push(newProject);
    await writeProjects(projects);
    res.redirect(`/project/${newProject.id}`);
});

app.post('/project/:id/task', async (req, res) => {
    const projects = await readProjects();
    const {id} = req.params;
    const {task} = req.body;
    const project = projects.find(proj => proj.id === id);
    if(project){
        project.tasks.push(task);
        // console.log();
        await writeProjects(projects);
        res.status(200).send('Task Added');
    }else{
        res.status(404).send('Project not found!!');
    }
});

app.delete('/project/:id/task', async (req, res) => {
    const projects = await readProjects();
    const { id } = req.params;
    const { task } = req.body;
    const project = projects.find(proj => proj.id === id);
    if (project) {
        project.tasks = project.tasks.filter(t => t !== task);
        await writeProjects(projects);
        res.status(200).send('Task removed');
    } else {
        res.status(404).send('Project not found');
    }
});

app.get('/search', async (req, res) => {
    const projects = await readProjects();
    const query = req.query.proj_search;
    const result = projects.find(proj => proj.id === query || proj.title.toLowerCase().split(" ").join("") === query.toLowerCase().split(" ").join(""));
    if (result) {
        res.redirect(`/project/${result.id}`);
    } else {
        res.render('notFound', { proj: query });
    }
});

app.get('/project/:id/edit', async (req, res) => {
    const projects = await readProjects();
	const { id } = req.params;
	const proj = projects.find(proj => proj.id === id);
    if(proj){
        res.render('edit',{proj});
    }else{
        res.render('notFound', {proj});
    }
})

app.patch('/project/:id',async  (req, res) => {
    const projects = await readProjects();
	const { id } = req.params;
	const newTitle = req.body.project_title;
	const project = projects.find(proj => proj.id === id);
	if (project) {
        project.title = newTitle;
        await writeProjects(projects);
        res.redirect('/');
    }else{
        res.send(`${id} not found!!`)
    }
})

app.delete('/project/:id', async (req, res) => {
    let projects = await readProjects();
    const {id} = req.params;
    projects = projects.filter(proj => proj.id !== id);
    await writeProjects(projects);
    res.redirect('/');
})

app.listen(8080, () => {
    console.log("running on port 8080...");
});
