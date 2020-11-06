const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:patrick:postgres@localhost:5432/petition");

module.exports.getSignatures = function getSignatures() {
    return db.query("SELECT * FROM signatures");
};

// TODO: add signature
module.exports.addSignature = function addSignature(
    first_name,
    last_name,
    signature
) {
    return db.query(
        "INSERT INTO signatures (first_name, last_name, signature) VALUES ($1, $2, $3) RETURNING id",
        [first_name, last_name, signature]
    );
};

module.exports.getSignatureById = function getSignatureById(id) {
    return db.query("SELECT * FROM signatures WHERE id = $1", [id]);
};
