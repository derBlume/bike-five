const express = require("express");
const expressHandlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const bcrypt = require("bcryptjs");

const db = require("./db.js");
const { request, response } = require("express");

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
});

app.get("/", (request, response) => response.redirect("/sign-petition"));

app.get("/register", (request, response) => {
    if (request.session.userId) {
        response.redirect("/sign-petition");
    } else {
        response.render("register");
    }
});

app.post("/register", (request, response) => {
    if (
        request.body.first_name &&
        request.body.last_name &&
        request.body.email &&
        request.body.password
    ) {
        bcrypt
            .hash(request.body.password, 10)
            .then((hashedPassword) =>
                db.addUser(
                    request.body.first_name,
                    request.body.last_name,
                    request.body.email,
                    hashedPassword
                )
            )
            .then((data) => {
                request.session.userId = data.rows[0].id;

                response.redirect("/sign-petition");
            });
    } else {
        response.render("register", {
            messageFillAllFields: "All fields must be completed!",
        });
    }
});

app.get("/login", (request, response) => {
    if (request.session.userId) {
        response.redirect("/sign-petition");
    } else {
        response.render("login");
    }
});

app.get("/logout", (request, response) => {
    request.session.userId = null;
    response.redirect("/login");
});

app.post("/login", (request, response) => {
    if (request.body.email && request.body.password) {
        let id;
        db.getUserByEmail(request.body.email)
            .then((data) => {
                if (data.rows.length === 1) {
                    id = data.rows[0].id;

                    return bcrypt.compare(
                        request.body.password,
                        data.rows[0].hashed_password
                    );
                } else {
                    throw new Error("Wrong Username!");
                }
            })
            .then((match) => {
                if (match) {
                    request.session.userId = id;
                    response.redirect("/sign-petition");
                    console.log(id);
                } else {
                    throw new Error("Wrong Password!");
                }
            })
            .catch((error) => {
                response.render("login", {
                    message: error.message,
                });
            });
    } else {
        response.render("register", {
            messageFillAllFields: "All fields must be completed!",
        });
    }
});

app.get("/sign-petition", (request, response) => {
    if (request.session.userId) {
        db.getSignatureByUserId(request.session.userId).then((data) => {
            if (data.rows.length === 1) {
                response.redirect("/thank-you");
            } else {
                response.render("sign-petition");
            }
        });
    } else {
        response.redirect("register");
    }
});

app.get("/signees", (request, response) => {
    db.getSignees().then((data) => {
        response.render("signees", { signees: data.rows });
        //console.log(data.rows);
    });
});

app.post("/sign-petition", (request, response) => {
    if (request.body.signature) {
        db.addSignature(request.session.userId, request.body.signature).then(
            () => {
                response.redirect("/thank-you");
            }
        );
    } else {
        response.render("sign-petition", {
            messageFillAllFields: "All fields must be completed!",
        });
    }
});

app.get("/thank-you", (request, response) => {
    if (request.session.userId) {
        db.getSignatureByUserId(request.session.userId).then((data) => {
            if (data.rows.length === 1) {
                response.render("thank-you", {
                    signature: data.rows[0].signature_data,
                });
            } else {
                response.redirect("/sign-petition");
            }
        });
    } else {
        response.redirect("/login");
    }
});

app.listen(8080, () => {
    console.log("PETITION IS LISTENING...");
});
