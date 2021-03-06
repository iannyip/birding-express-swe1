// Step 1: Import modules
import express, { query } from "express";
import pg from "pg";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
const { Pool } = pg;

// Step 2: set up
let pgConnectionConfig;
if (process.env.ENV === "PRODUCTION") {
  pgConnectionConfig = {
    user: "postgres",
    password: process.env.DB_PASSWORD,
    host: "localhost",
    database: "birding",
    port: 5432,
  };
} else {
  pgConnectionConfig = {
    user: "iannyip",
    host: "localhost",
    database: "birding",
    port: 5432,
  };
}

const pool = new Pool(pgConnectionConfig);
const PORT = process.argv[2];
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(cookieParser());

// Helper functions
const joinDateTime = (inputDate, inputTime) => {
  const joinedDateTime = new Date(inputDate + " " + inputTime);
  return joinedDateTime;
};

const separateDateTime = (inputDateTime) => {
  const Date = inputDateTime.toISOString().substring(0, 10);
  const Time = inputDateTime.toLocaleTimeString("en-SG");
  return [Date, Time];
};

const checkLoginCookie = (reqObj, resObj) => {
  if (reqObj.cookies.userId === undefined) {
    resObj.redirect("/login");
    return true;
  }
};

// Step 3: Create routes
app.get("/note", (request, response) => {
  console.log("GET note");
  // Verify login
  if (checkLoginCookie(request, response)) {
    return;
  }
  // Get the ID of the user
  const { userId }= request.cookies;
  console.log(userId);
  const noteData = {};
  pool
    .query('SELECT * FROM behaviours')
    .then((result) => {
      noteData.behaviours= result.rows;
      noteData.id= userId;
      return pool.query(`SELECT email FROM users WHERE id = ${userId}`);
    })
    .then((result) => {
      noteData.email = result.rows[0].email;
      return pool.query(`SELECT * FROM species`);
    })
    .then((result) => {
      noteData.species = result.rows;
      console.log(noteData);
      response.render("note", noteData);
    })
    .catch((error) => console.log(error.stack));
});

app.post("/note", (request, response) => {
  console.log("POST note");
  // Get form data and process date
  const submittedData = request.body;
  const inputData = [
    joinDateTime(submittedData.date, submittedData.time),
    submittedData.behaviour_id,
    submittedData.flock_size,
    submittedData.user_id,
    submittedData.species_id,
  ];
  console.log(inputData);
  console.log(submittedData);
  // Query: Input into TABLE notes
  const querySubmitSighting =
    "INSERT INTO notes (datetime, behaviour_id, flock_size, user_id, species_id) VALUES ($1, $2, $3, $4, $5)";
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
  // Verify login
  if (checkLoginCookie(request, response)) {
    return;
  }
  const id = request.params.id;
  console.log(`GET note ${id}`);
  
  // Query: Get note
  let queryResult;
  const querySingleSighting = `SELECT notes.id, notes.datetime, notes.flock_size, behaviours.name as behaviour, users.email, species.name as species FROM notes INNER JOIN behaviours ON notes.behaviour_id = behaviours.id INNER JOIN users ON notes.user_id = users.id INNER JOIN species ON notes.species_id = species.id WHERE notes.id = ${id}`;
  pool
    .query(querySingleSighting)
    .then((result) => {
      queryResult = result.rows[0];
      console.log(queryResult); // This is an object
      const noteId = queryResult.id;
      const queryComments = (`SELECT comments.id, comments.comment, users.email FROM comments INNER JOIN users ON comments.commenter_id = users.id WHERE note_id = ${noteId} ORDER BY comments.id DESC`);
      return pool.query(queryComments);
    })
    .then((result) => {
      queryResult.comments = result.rows; // This is an array;
      queryResult.commenter = request.cookies.userId;
      queryResult.email = queryResult.email.split("@")[0];
      console.log(queryResult);
      response.render("note_single", { noteObj: queryResult });
    })
    .catch((error) => console.log(error.stack));
});

app.get("/", (request, response) => {
  console.log("GET ROOT");
  console.log("user id: ", request.cookies.userId);

  // Verify login
  if (checkLoginCookie(request, response)) {
    return;
  }

  // Query: Get all information from TABLE notes
  const queryRoot = "SELECT notes.id, notes.datetime, notes.flock_size, users.email, behaviours.name AS behaviour, species.name AS species FROM notes INNER JOIN behaviours ON notes.behaviour_id = behaviours.id INNER JOIN users ON users.id = notes.user_id INNER JOIN species ON notes.species_id = species.id ORDER BY notes.id ASC";
  pool.query(queryRoot, (error, result) => {
    if (error) {
      console.log("root error: ", error.stack);
      response.status(503).send(result.rows);
      return;
    }
    const rootTableData = result.rows;
    console.log(rootTableData);
    rootTableData.forEach((note) => {
      note.date = separateDateTime(note.datetime)[0];
      note.time = separateDateTime(note.datetime)[1];
      note.email = note.email.split("@")[0];
    });
    response.render("root", { rootTableData });
  });
});

app.get("/note/:id/edit", (request, response) => {
  // Verify login
  if (checkLoginCookie(request, response)) {
    return;
  }
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
  const queryUpdateNote = `UPDATE notes SET datetime=$1, behaviour_id=$2, flock_size=$3 WHERE id = ${noteId}`;
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

app.get("/signup", (request, response) => {
  console.log("GET signup");
  response.render("signup");
});

app.post("/signup", (request, response) => {
  console.log("POST signup");
  // Get the data
  const signupData = request.body;
  console.log(signupData);

  // Query: insert into db
  const querySignUp = `INSERT INTO users (email, password) VALUES ('${signupData.email}', '${signupData.password}')`;
  pool.query(querySignUp, (error, result) => {
    if (error) {
      console.log("INSERT error", error);
    } else {
      console.log("insert successful");
      response.redirect("/login");
    }
  });
});

app.get("/login", (request, response) => {
  console.log("GET login");
  response.render("login");
});

app.post("/login", (request, response) => {
  console.log("POST login");
  const userInput = request.body;
  // Query db for user
  const queryUser = `SELECT * FROM users WHERE email = '${userInput.email}'`;
  pool.query(queryUser, (error, result) => {
    if (error) {
      console.log("Error executing query", error.stack);
      response.status(503).send(result.rows);
      return;
    }
    if (result.rows.length === 0) {
      response.status(403).send("sorry! Please try again!");
      return;
    }
    if (userInput.password === result.rows[0].password) {
      response.cookie("userId", result.rows[0].id);
      response.redirect("/");
    } else {
      response.status(403).send("wrong password!");
      response.redirect("/login");
    }
  });
});

app.delete("/logout", (request, response) => {
  console.log("DEL logout");
  response.clearCookie("userId");
  response.redirect("/login");
});

app.get('/species', (request, response) => {
  console.log("GET species");
  response.render('species');
})

app.post('/species', (request, response) =>{
  console.log("POST species");
  const newSpeciesData = request.body;
  console.log(newSpeciesData);

  // Query: Insert new data
  const queryNewSpecies = "INSERT INTO species (name, scientific_name) VALUES ($1, $2)";
  pool.query(queryNewSpecies, [newSpeciesData.name, newSpeciesData.scientific_name], (error, result) => {
    if (error) {
      console.log("error: ", error);
    } else {
      response.redirect('/species/all');
    }
  })
})

app.get('/species/all', (request, response) => {
  console.log("GET all species");

  // Query to get all species
  const queryAllSpecies = "SELECT * FROM species";
  pool.query(queryAllSpecies, (error, result) => {
    if (error){
      console.log("error: ", error);
    } else {
      const allSpeciesData = result.rows;
      response.render('species_all', {allSpeciesData});
    }
  })
})

app.get('/species/:index', (request, response) => {
  console.log("GET SPECIES INDEX");
  const {index} = request.params;
  
  // Query: particular species index
  const querySpeciesIndex = `SELECT * FROM species WHERE id='${index}'`;
  pool.query(querySpeciesIndex, (error, result) =>{
    if (error){
      console.log("error: ", error);
    } else{
      const speciesData = result.rows[0];
      response.render('species_single', {speciesData});
    }
  })
})

app.get('/species/:index/edit', (request, response) => {
  console.log("GET edit SPECIES");
  const {index} = request.params;

  // Query: get species info
  const querySpeciesIndex = `SELECT * FROM species WHERE id='${index}'`;
  pool.query(querySpeciesIndex, (error, result) =>{
    if (error){
      console.log("error: ", error);
    } else{
      const speciesData = result.rows[0];
      response.render('species_single_edit', {speciesData});
    }
  })
})

app.put('/species/:index/edit', (request, response) => {
  console.log("PUT species index");
  const {index} = request.params;
  const updatedData = request.body;
  console.log(updatedData);

  // Query: update species table
  const queryUpdateSpecies = `UPDATE species SET name=$1, scientific_name=$2 WHERE id=${index}`;
  pool.query(queryUpdateSpecies, [updatedData.name, updatedData.scientific_name], (error, result) =>{
    if (error){
      console.log("error: ", error);
    } else {
      console.log('updated');
      response.redirect(`/species/${index}`)
    }
  } )
})

app.delete('/species/:index/delete', (request, response) => {
  console.log("DELETE species index");
  const {index} = request.params;

  // Query: Delete 
  const queryDeleteSpecies = `DELETE FROM species WHERE id=${index}`;
  pool.query(queryDeleteSpecies, (error, result) => {
    if (error) {
      console.log('error: ', error);
    } else{
      response.redirect('/species/all');
    }
  })
})

app.get('/behaviours', (request, response) => {
  console.log("GET behaviours");
  // Query: Retrieve all behaviours
  const queryBehaviour = "SELECT * FROM behaviours";
  pool.query(queryBehaviour, (error, result) => {
    if (error){
      console.log("error: ", error);
    } else {
      const allBehaviourArr = result.rows;
      let counter = 0;
      allBehaviourArr.forEach(behaviour => {
        pool.query(`SELECT COUNT(*) FROM notes WHERE behaviour_id='${behaviour.id}'`, (errorNoteCount, resultNoteCount) => {
          counter += 1;
          if (errorNoteCount){
            console.log("error", errorNoteCount);
          } else{
            behaviour.count = Number(resultNoteCount.rows[0].count);
          }

          if (counter === allBehaviourArr.length){
            response.render('behaviours', {allBehaviourArr});
          }
        });
      })
    }
  })
})

app.get('/behaviours/:id', (request, response) => {
  console.log("GET BEHAVIOUR ID");
  const {id} = request.params;

  // Query
  const queryRoot = `SELECT notes.id, notes.datetime, notes.flock_size, users.email, behaviours.name AS behaviour, species.name AS species FROM notes INNER JOIN behaviours ON notes.behaviour_id = behaviours.id INNER JOIN users ON users.id = notes.user_id INNER JOIN species ON notes.species_id = species.id WHERE notes.behaviour_id = ${id} ORDER BY notes.id ASC`;
  pool.query(queryRoot, (error, result) => {
    if (error) {
      console.log("root error: ", error.stack);
      response.status(503).send(result.rows);
      return;
    }
    const notesData = result.rows;
    console.log(notesData);
    notesData.forEach((note) => {
      note.date = separateDateTime(note.datetime)[0];
      note.time = separateDateTime(note.datetime)[1];
    });
    console.log({notesData});
    response.render("behaviours_single", { notesData });
  });
})

app.post('/note/:id/comment', (request, response) =>{
  console.log("POST Comment");
  const newComment = request.body;
  console.log(newComment);
  pool.query(`INSERT INTO comments (note_id, commenter_id, comment) VALUES (${newComment.note_id}, ${newComment.commenter_id}, '${newComment.comment}')`, (error, result) => {
    if (error) {
      console.log("error: ", error);
    } else {
      response.redirect(`/note/${newComment.note_id}`);
    }
  })
})

app.get('/user', (request, response) => {
  console.log("GET user");
    // Verify login
  if (checkLoginCookie(request, response)) {
    return;
  }
  const {userId} = request.cookies;
  const userActivity = {};
  const queryUserActivity = `SELECT notes.id, notes.datetime, behaviours.name AS behaviour, species.name as species, flock_size FROM notes INNER JOIN behaviours ON notes.behaviour_id = behaviours.id INNER JOIN species ON notes.species_id = species.id WHERE user_id=${userId}`;
  pool
    .query(queryUserActivity)
    .then((result) => {
      userActivity.notes = result.rows;
      userActivity.notes.forEach(note => {
        note.date = separateDateTime(note.datetime)[0];
        note.time = separateDateTime(note.datetime)[1];
      })
      return pool.query(`SELECT * FROM comments WHERE commenter_id=${userId}`)
    })
    .then((result) => {
      userActivity.comments = result.rows;
      console.log("#####################")
      console.log(userActivity);
      response.render('user', userActivity)
    })
    .catch((error) => console.log(error.stack));
})


// Step 4: Start Server
console.log("starting server...");
app.listen(PORT);
