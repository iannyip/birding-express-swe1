-- Step 1: Create birding database
-- Step 2: Run this file with psql -d birding -f create_tables.sql 

DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS users;

CREATE TABLE notes (id SERIAL PRIMARY KEY, datetime TIMESTAMPTZ, behaviour TEXT, flock_size INTEGER, user_id INTEGER);
CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT, password TEXT);

INSERT INTO notes (datetime, behaviour, flock_size, user_id) VALUES ('2021-01-31 21:00:00', 'Tail bobs', 2, 1);
INSERT INTO notes (datetime, behaviour, flock_size, user_id) VALUES ('2021-02-01 22:00:00', 'Head cocks', 3, 2);

INSERT INTO users (email, password) VALUES ('ian@gmail.com', 'ianpassword');
INSERT INTO users (email, password) VALUES ('kai@gmail.com', 'kaipassword');
