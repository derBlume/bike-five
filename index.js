const express = require("express");
const expressHandlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

const db = require("./db.js");

const app = express();

app.engine("handlebars", expressHandlebars());
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
    cookieSession({
        secret:
            "I love Spekulatius so much, I sometimes eat a whole pack within a few hours.",
        maxAge: 1000 * 60 * 60 * 24 * 365 * 100, // 100 years
    })
);

app.use(csurf());

app.use(function (request, response, next) {
    response.locals.csrfToken = request.csrfToken();
    next();
});

app.use((request, response, next) => {
    response.setHeader("x-frame-options", "deny");
    next();

app.get("/", (request, response) => {
    if (request.session.petitionSigned) {
        response.redirect("/thank-you");
    } else {
        response.render("home");
    }
});

app.get("/signees", (request, response) => {
    db.getSignatures().then((data) => {
        response.render("signees", { signatures: data.rows });
    });
});

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
        ).then((data) => {
            request.session.signatureId = data.rows[0].id;
            request.session.petitionSigned = true;

            response.redirect("/thank-you");
        });
    } else {
        response.render("home", {
            messageFillAllFields: "All fields must be completed!",
        });
    }
});

app.get("/thank-you", (request, response) => {
    if (request.session.petitionSigned) {
        db.getSignatureById(request.session.signatureId).then((data) => {
            response.render("thank-you", {
                signature: data.rows[0].signature,
            });
        });
    } else {
        response.redirect("/");
    }
});

app.listen(8080, () => {
    console.log("PETITION IS LISTENING...");
});
