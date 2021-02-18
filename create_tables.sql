-- Step 1: Create birding database
-- Step 2: Run this file with psql -d birding -f create_tables.sql 

DROP TABLE IF EXISTS notes;

CREATE TABLE notes (id SERIAL PRIMARY KEY, datetime TIMESTAMPTZ, behaviour TEXT, flock_size INTEGER);

INSERT INTO notes (datetime, behaviour, flock_size) VALUES ('2021-01-31 21:00:00', 'Tail bobs', 2);
INSERT INTO notes (datetime, behaviour, flock_size) VALUES ('2021-02-01 22:00:00', 'Head cocks', 3);