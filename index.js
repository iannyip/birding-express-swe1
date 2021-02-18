// Step 1: Import modules
import express, { response } from 'express';
import pg from 'pg';
const { Pool } = pg;

// Step 2: set up
const pgConnectionConfig ={
  user: 'iannyip',
  host: 'localhost',
  database: 'birding',
  port: 5432,
}
const pool = new Pool(pgConnectionConfig);
const PORT = 3004;
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// Step 3: Create routes
app.get('/note', (request, response)=>{
  console.log("GET note");
  response.render('note');
})

app.post('/note', (request, response) => {
  console.log("POST note");
  const submittedData = request.body;
  const joinedDateTime = new Date(submittedData.date + " " + submittedData.time);
  const processedDate = joinedDateTime.toISOString();
  const inputData = [processedDate, submittedData.behaviour, submittedData.flock_size]
  console.log(inputData);
  const querySubmitSighting = "INSERT INTO notes (datetime, behaviour, flock_size) VALUES ($1, $2, $3)";
  pool.query(querySubmitSighting, inputData, (error, result) =>{
    if (error){
      console.log("submit error", error);
      return;
    }
    console.log("Insert success!");
    response.redirect('/');
  })
})

app.get('/note/:id', (request, response)=>{
  const id = request.params.id;
  console.log(id);
  console.log(typeof(id));
  const querySingleSighting = `SELECT * FROM notes WHERE id = ${id}`;
  pool.query(querySingleSighting, (error, result) => {
    if (error){
      console.log('single note error: ', error);
    } else{
      const queryResult = result.rows[0];
      console.table(queryResult);
      console.log(queryResult);
      response.render('note_single', {noteObj: queryResult});
    }
  })
  
})

app.get('/', (req, res) =>{
  console.log("incoming request");
  const queryRoot = "SELECT * FROM notes";
  pool.query(queryRoot, (error, result)=>{
    if (error){
      console.log("root error: ", error.stack);
      response.status(503).send(result.rows);
      return;
    }
    console.table(result.rows);
    const rootTableData = result.rows;
    console.log(rootTableData);
    res.render('root', {rootTableData});
  });
})

// Step 4: Start Server
console.log('starting server...');
app.listen(PORT);