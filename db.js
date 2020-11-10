const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:patrick:postgres@localhost:5432/petition");

module.exports.addUser = function addUser(
    first_name,
    last_name,
    email,
    password
) {
    return db.query(
        "INSERT INTO users (first_name, last_name, email, hashed_password) VALUES ($1, $2, $3, $4) RETURNING id",
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
        "INSERT INTO user_profiles (user_id, age, city, homepage) VALUES ($1, $2, $3, $4)",
        [user_id, age, city, homepage]
    );
};

module.exports.addSignature = function addSignature(user_id, signature_data) {
    return db.query(
        "INSERT INTO signatures (user_id, signature_data) VALUES ($1, $2)",
        [user_id, signature_data]
    );
};

module.exports.getSignatureByUserId = function getSignatureByUserId(id) {
    return db.query("SELECT * FROM signatures WHERE user_id = $1", [id]);
};

module.exports.getUserByEmail = function getUserByEmail(email) {
    return db.query("SELECT * FROM users WHERE email = $1", [email]);
};

module.exports.getSignees = function getSignees() {
    return db.query(
        "SELECT users.first_name AS first_name, users.last_name AS last_name, user_profiles.age AS age, user_profiles.city AS city FROM signatures JOIN users ON signatures.user_id = users.id JOIN user_profiles ON users.id = user_profiles.user_id"
    );
};
