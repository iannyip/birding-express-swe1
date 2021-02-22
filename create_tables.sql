-- Step 1: Create birding database
-- Step 2: Run this file with psql -d birding -f create_tables.sql 

DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS species;
DROP TABLE IF EXISTS behaviours;
DROP TABLE IF EXISTS comments;

CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT, password TEXT);
CREATE TABLE species (id SERIAL PRIMARY KEY, name TEXT, scientific_name TEXT);
CREATE TABLE behaviours (id SERIAL PRIMARY KEY, name TEXT);
CREATE TABLE comments (id SERIAL PRIMARY KEY, note_id INTEGER, commenter_id INTEGER, comment TEXT);
CREATE TABLE notes (id SERIAL PRIMARY KEY, datetime TIMESTAMPTZ, behaviour_id INTEGER, flock_size INTEGER, user_id INTEGER);


INSERT INTO notes (datetime, behaviour_id, flock_size, user_id) VALUES ('2021-01-31 21:00:00', 2, 2, 1);
INSERT INTO notes (datetime, behaviour_id, flock_size, user_id) VALUES ('2021-02-01 22:00:00', 5, 3, 2);
INSERT INTO notes (datetime, behaviour_id, flock_size, user_id) VALUES ('2021-02-03 09:00:00', 1, 5, 2);
INSERT INTO notes (datetime, behaviour_id, flock_size, user_id) VALUES ('2021-02-04 15:00:00', 2, 1, 2);
INSERT INTO notes (datetime, behaviour_id, flock_size, user_id) VALUES ('2021-02-08 19:00:00', 6, 7, 2);

INSERT INTO users (email, password) VALUES ('ian@gmail.com', 'ianpassword');
INSERT INTO users (email, password) VALUES ('kai@gmail.com', 'kaipassword');

INSERT INTO species (name, scientific_name) VALUES ('King Quail', 'Excalfactoria chinensis');
INSERT INTO species (name, scientific_name) VALUES ('Red Junglefowl','Gallus gallus');
INSERT INTO species (name, scientific_name) VALUES ('Wandering Whistling Duck', 'Dendrocygna arcuata');
INSERT INTO species (name, scientific_name) VALUES ('Grey Nightjar', 'Caprimulgus jotaka');

INSERT INTO behaviours (name) VALUES ('Walking');
INSERT INTO behaviours (name) VALUES ('Resting');
INSERT INTO behaviours (name) VALUES ('Gathering Nesting Materials');
INSERT INTO behaviours (name) VALUES ('Mobbing');
INSERT INTO behaviours (name) VALUES ('Long Song');
INSERT INTO behaviours (name) VALUES ('Bathing');
INSERT INTO behaviours (name) VALUES ('Preening');
INSERT INTO behaviours (name) VALUES ('Territory Defence');
INSERT INTO behaviours (name) VALUES ('Climbing Tree');
INSERT INTO behaviours (name) VALUES ('Bark Feeding');
INSERT INTO behaviours (name) VALUES ('Hunting');
INSERT INTO behaviours (name) VALUES ('Flying');
INSERT INTO behaviours (name) VALUES ('Tail bobs');
INSERT INTO behaviours (name) VALUES ('Head cocks');

INSERT INTO comments (note_id, commenter_id, comment) VALUES (2, 1, 'this is very good!');
INSERT INTO comments (note_id, commenter_id, comment) VALUES (2, 2, 'nice!');
INSERT INTO comments (note_id, commenter_id, comment) VALUES (3, 1, 'suj!');
INSERT INTO comments (note_id, commenter_id, comment) VALUES (3, 2, 'bravo!');
INSERT INTO comments (note_id, commenter_id, comment) VALUES (4, 2, 'got the bird wrong!');
INSERT INTO comments (note_id, commenter_id, comment) VALUES (4, 1, 'this is fake');
INSERT INTO comments (note_id, commenter_id, comment) VALUES (5, 1, 'nice!');
INSERT INTO comments (note_id, commenter_id, comment) VALUES (5, 1, 'love it!');