const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:patrick:postgres@localhost:5432/petition"
);

module.exports.addUser = function addUser(
    first_name,
    last_name,
    email,
    password
) {
    return db.query(
        "INSERT INTO users (first_name, last_name, email, hashed_password) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name",
        [first_name, last_name, email, password]
    );
};

module.exports.updateProfile = function updateProfile({
    user_id,
    age,
    city,
    homepage,
}) {
    return db.query(
        "INSERT INTO user_profiles (user_id, age, city, homepage) VALUES ($1, $2, $3, $4) ON CONFLICT(user_id) DO UPDATE SET age=$2, city=$3, homepage=$4",
        [user_id, age, city, homepage]
    );
};

module.exports.updateUser = function updateUser({
    user_id,
    first_name,
    last_name,
    email,
    password,
}) {
    if (password) {
        return db.query(
            "UPDATE users SET first_name = $2, last_name = $3, email = $4, hashed_password = $5 WHERE id = $1",
            [user_id, first_name, last_name, email, password]
        );
    } else {
        return db.query(
            "UPDATE users SET first_name = $2, last_name = $3, email = $4 WHERE id = $1",
            [user_id, first_name, last_name, email]
        );
    }
};

module.exports.addSignature = function addSignature(user_id, signature_data) {
    return db.query(
        "INSERT INTO signatures (user_id, signature_data) VALUES ($1, $2)",
        [user_id, signature_data]
    );
};

module.exports.getSignatureByUserId = function getSignatureByUserId(user_id) {
    return db.query("SELECT * FROM signatures WHERE user_id = $1", [user_id]);
};

module.exports.removeSignature = function removeSignature(user_id) {
    return db.query("DELETE FROM signatures WHERE user_id = $1", [user_id]);
};

module.exports.getUserByEmail = function getUserByEmail(email) {
    return db.query("SELECT * FROM users WHERE email = $1", [email]);
};

module.exports.getUserById = function getUserById(id) {
    return db.query(
        "SELECT * FROM users JOIN user_profiles ON users.id =user_profiles.user_id WHERE users.id = $1",
        [id]
    );
};

module.exports.getSignees = function getSignees(city) {
    if (city) {
        return db.query(
            "SELECT users.first_name AS first_name, users.last_name AS last_name, user_profiles.age AS age, user_profiles.city AS city, user_profiles.homepage AS homepage FROM signatures JOIN users ON signatures.user_id = users.id JOIN user_profiles ON users.id = user_profiles.user_id WHERE LOWER(user_profiles.city) = LOWER($1)",
            [city]
        );
    } else {
        return db.query(
            "SELECT users.first_name AS first_name, users.last_name AS last_name, user_profiles.age AS age, user_profiles.city AS city, user_profiles.homepage AS homepage FROM signatures JOIN users ON signatures.user_id = users.id JOIN user_profiles ON users.id = user_profiles.user_id"
        );
    }
};
