-- createdb petition
-- psql -d petition -f petition.sql

DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    signature VARCHAR
);

INSERT INTO signatures (first_name, last_name, signature) VALUES ('0First', '0Last', '0SIGNATURE');
INSERT INTO signatures (first_name, last_name, signature) VALUES ('0Firstee', '0Lastee', '0SIGNATUREEE');

SELECT * FROM signatures;