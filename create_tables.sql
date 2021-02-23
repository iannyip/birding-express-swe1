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
CREATE TABLE notes (id SERIAL PRIMARY KEY, datetime TIMESTAMPTZ, behaviour_id INTEGER, flock_size INTEGER, user_id INTEGER, species_id INTEGER);


INSERT INTO notes (datetime, behaviour_id, flock_size, user_id, species_id) VALUES 
('2021-01-31 21:00:00', 2, 2, 1, 1),
('2021-02-01 22:00:00', 5, 3, 2, 2),
('2021-02-03 09:00:00', 1, 5, 1, 3),
('2021-02-04 11:00:00', 2, 1, 2, 3),
('2021-02-05 18:00:00', 7, 2, 1, 2),
('2021-02-06 14:00:00', 2, 1, 1, 1),
('2021-02-07 15:00:00', 2, 8, 2, 4),
('2021-01-05 18:00:00', 11, 2, 1, 3),
('2021-02-21 14:00:00', 9, 4, 1, 1),
('2021-01-07 15:00:00', 1, 8, 2, 2),
('2021-02-12 19:00:00', 3, 7, 2, 4);

INSERT INTO users (email, password) VALUES 
('ian@gmail.com', 'ianpassword'),
('kai@gmail.com', 'kaipassword');

INSERT INTO species (name, scientific_name) VALUES 
('King Quail', 'Excalfactoria chinensis'),
('Red Junglefowl','Gallus gallus'),
('Wandering Whistling Duck', 'Dendrocygna arcuata'),
('Grey Nightjar', 'Caprimulgus jotaka');

INSERT INTO behaviours (name) VALUES 
('Walking'),
('Resting'),
('Gathering Nesting Materials'),
('Mobbing'),
('Long Song'),
('Bathing'),
('Preening'),
('Territory Defence'),
('Climbing Tree'),
('Bark Feeding'),
('Hunting'),
('Flying'),
('Tail bobs'),
('Head cocks');

INSERT INTO comments (note_id, commenter_id, comment) VALUES 
(2, 1, 'this is very good!'),
(2, 2, 'nice!'),
(2, 1, 'really cool!!'),
(3, 1, 'suj!'),
(3, 2, 'bravo!'),
(4, 2, 'got the bird wrong!'),
(4, 1, 'this is fake'),
(5, 1, 'outstanding!'),
(5, 1, 'love it!'),
(3, 2, 'There is no better bird watcher in town!'),
(1, 1, 'This is good stuff!'),
(4, 2, 'Wow i am really impressed'),
(5, 1, 'keep it up!'),
(1, 1, 'love it!'),
(2, 1, 'this is fake'),
(3, 1, 'nice!'),
(4, 1, 'love it!'),
(5, 2, 'You woke up really early for this'),
(6, 1, 'Where did you see this bird?'),
(2, 2, 'This is a really rare bird!'),
(1, 1, 'BOoooooo!'),
(5, 1, 'Cheep Cheep I am not a bird');