// Step 1: Import modules
import express, { query, response } from "express";
import pg from "pg";
import methodOverride from "method-override";
const { Pool } = pg;

// Step 2: set up
const pgConnectionConfig = {
  user: "iannyip",
  host: "localhost",
  database: "birding",
  port: 5432,
};
const pool = new Pool(pgConnectionConfig);
const PORT = 3004;
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

// Helper functions
const joinDateTime = (inputDate, inputTime) => {
  const joinedDateTime = new Date(inputDate + " " + inputTime);
  return joinedDateTime;
};

const separateDateTime = (inputDateTime) => {
  const Date = inputDateTime.toISOString().substring(0, 10);
  const Time = inputDateTime.toLocaleTimeString("en-SG");
  console.log(inputDateTime);
  return [Date, Time];
};

// Step 3: Create routes
app.get("/note", (request, response) => {
  console.log("GET note");
  response.render("note");
});

app.post("/note", (request, response) => {
  console.log("POST note");
  // Get form data and process date
  const submittedData = request.body;
  const inputData = [
    joinDateTime(submittedData.date, submittedData.time),
    submittedData.behaviour,
    submittedData.flock_size,
  ];
  console.log(inputData);

  // Query: Input into TABLE notes
  const querySubmitSighting =
    "INSERT INTO notes (datetime, behaviour, flock_size) VALUES ($1, $2, $3)";
  pool.query(querySubmitSighting, inputData, (error, result) => {
    if (error) {
      console.log("submit error", error);
      return;
    }
    console.log("Insert success!");
    response.redirect("/");
  });
});

app.get("/note/:id", (request, response) => {
  const id = request.params.id;
  console.log(`GET note ${id}`);
  const querySingleSighting = `SELECT * FROM notes WHERE id = ${id}`;
  pool.query(querySingleSighting, (error, result) => {
    if (error) {
      console.log("single note error: ", error);
    } else {
      const queryResult = result.rows[0];
      console.table(queryResult);
      console.log(queryResult);
      response.render("note_single", { noteObj: queryResult });
    }
  });
});

app.get("/", (req, res) => {
  console.log("GET ROOT");
  // Query: Get all information from TABLE notes
  const queryRoot = "SELECT * FROM notes";
  pool.query(queryRoot, (error, result) => {
    if (error) {
      console.log("root error: ", error.stack);
      response.status(503).send(result.rows);
      return;
    }
    console.table(result.rows);
    const rootTableData = result.rows;
    console.log(rootTableData);
    rootTableData.forEach((note) => {
      note.date = separateDateTime(note.datetime)[0];
      note.time = separateDateTime(note.datetime)[1];
    });
    res.render("root", { rootTableData });
  });
});

app.get("/note/:id/edit", (request, response) => {
  console.log("GET NOTE EDIT");
  const noteId = request.params.id;
  // Query that particular id
  const queryId = `SELECT * FROM notes WHERE id=${noteId}`;
  pool.query(queryId, (error, result) => {
    if (error) {
      console.log("error: ", error);
      return;
    } else {
      const queryIdResult = result.rows[0];
      queryIdResult.date = separateDateTime(queryIdResult.datetime)[0];
      queryIdResult.time = separateDateTime(queryIdResult.datetime)[1];
      console.log(queryIdResult);
      response.render("note_edit", { noteObj: queryIdResult });
    }
  });
});

app.put("/note/:id/edit", (request, response) => {
  console.log("PUT EDIT NOTE");
  // Get form data and process
  const noteId = request.params.id;
  const reSubmittedData = request.body;
  const inputData = [
    joinDateTime(reSubmittedData.date, reSubmittedData.time),
    reSubmittedData.behaviour,
    Number(reSubmittedData.flock_size),
  ];

  // Query: update database
  const queryUpdateNote = `UPDATE notes SET datetime=$1, behaviour=$2, flock_size=$3 WHERE id = ${noteId}`;
  pool.query(queryUpdateNote, inputData, (error, result) => {
    if (error) {
      console.log("error: ", error);
    } else {
      console.log("updated");
      response.redirect(`/note/${noteId}`);
    }
  });
});

app.delete("/note/:id/delete", (request, response) => {
  const { id } = request.params;
  console.log(id);
  // Query to delete
  const queryDelete = `DELETE FROM notes WHERE id=${id}`;
  pool.query(queryDelete, (error, result) => {
    if (error) {
      console.log("error: ", error);
    } else {
      console.log("deleted");
      response.redirect("/");
    }
  });
});

// Step 4: Start Server
console.log("starting server...");
app.listen(PORT);
