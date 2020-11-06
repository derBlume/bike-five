const express = require("express");
const exphbs = require("express-handlebars");

const db = require("./db.js");

const app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(require("cookie-parser")());

app.get("/", (request, response) => {
    response.render("home");
});

app.get("/signees", (request, response) => {
    db.getSignatures().then((data) => {
        console.log(data.rows);

        response.render("signees", { signatures: data.rows });
    });
});

// TODO: add signature
app.post("/sign-petition", (request, response) => {
    if (
        request.body.first_name &&
        request.body.last_name &&
        request.body.signature
    ) {
        db.addSignature(
            request.body.first_name,
            request.body.last_name,
            request.body.signature
        ).then(() => {
            response.cookie("petitionSigned", "true");
            response.redirect("/thank-you");
        });
    } else {
        response.render("home", {
            messageFillAllFields: "All fields must be completed!",
        });
    }
});

app.get("/thank-you", (request, response) => {
    response.render("thank-you");
});

app.listen(8080, () => {
    console.log("PETITION IS LISTENING...");
});
