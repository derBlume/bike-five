const express = require("express");
const expressHandlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const bcrypt = require("bcryptjs");

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
    if (request.session.userId) {
        response.locals.userId = request.session.userId;
        response.locals.userName = request.session.userName;
    }
    next();
});

app.use((request, response, next) => {
    response.setHeader("x-frame-options", "deny");
    next();
});

app.get("/", (request, response) => response.render("home"));

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
                request.session.userName =
                    data.rows[0].first_name + " " + data.rows[0].last_name;

                response.redirect("/profile");
            });
    } else {
        response.render("register", {
            message: "All fields must be completed!",
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
    let id;
    let name;
    db.getUserByEmail(request.body.email)
        .then((data) => {
            if (data.rows.length === 1) {
                id = data.rows[0].id;
                name = data.rows[0].first_name + " " + data.rows[0].last_name;

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
                request.session.userName = name;
                response.redirect("/sign-petition");
            } else {
                throw new Error("Wrong Password!");
            }
        })
        .catch((error) => {
            response.render("login", {
                message: error.message,
            });
        });
});

app.get("/profile", (request, response) => {
    response.render("profile");
});

app.post("/profile", (request, response) => {
    if (
        request.body.homepage.startsWith("http://") ||
        request.body.homepage.startsWith("https://") ||
        request.body.homepage === ""
    ) {
        db.updateProfile({
            user_id: request.session.userId,
            age: request.body.age === "" ? null : request.body.age,
            city: request.body.city,
            homepage: request.body.homepage,
        }).then(() => response.redirect("/sign-petition"));
    } else {
        response.render("profile", {
            message:
                'Enter valid homepage (must start with "http://" or "https://") or leave field empty. Age must be a whole number or empty.',
        });
    }
});

app.get("/edit-profile", (request, response) => {
    if (request.session.userId) {
        db.getUserById(request.session.userId).then((data) => {
            response.render("edit-profile", {
                first_name: data.rows[0].first_name,
                last_name: data.rows[0].last_name,
                email: data.rows[0].email,
                age: data.rows[0].age,
                city: data.rows[0].city,
                homepage: data.rows[0].homepage,
            });
        });
    } else {
        response.redirect("/login");
    }
});

app.post("/edit-profile", (request, response) => {
    const {
        first_name,
        last_name,
        email,
        password,
        age,
        city,
        homepage,
    } = request.body;

    if (
        (homepage.startsWith("http://") ||
            homepage.startsWith("https://") ||
            homepage === "") &&
        first_name &&
        last_name &&
        email
    ) {
        bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
                db.updateUser({
                    user_id: request.session.userId,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: password === "" ? null : hashedPassword,
                });
            })
            .then(() =>
                db.updateProfile({
                    user_id: request.session.userId,
                    age: age === "" ? null : age,
                    city: city,
                    homepage: homepage,
                })
            )

            .then(() => response.redirect("/sign-petition"));
    } else {
        response.render("edit-profile", {
            message:
                'First Name, Last Name and Email must be provided. Enter valid homepage (must start with "http://" or "https://") or leave field empty. Age must be a whole number or empty.',
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

app.post("/sign-petition", (request, response) => {
    if (request.body.signature) {
        db.addSignature(request.session.userId, request.body.signature).then(
            () => {
                response.redirect("/thank-you");
            }
        );
    } else {
        response.render("sign-petition", {
            message: "Please sign in the field provided!",
        });
    }
});

app.get("/signees", (request, response) => {
    db.getSignees().then((data) => {
        response.render("signees", {
            signees: data.rows,
            count: data.rowCount,
        });
        console.log(data);
    });
});

app.get("/signees/:city", (request, response) => {
    db.getSignees(request.params.city).then((data) => {
        response.render("signees", {
            signees: data.rows,
            count: data.rowCount,
            city: request.params.city,
        });
        //console.log(data.rows);
    });
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

app.post("/unsign-petition", (request, response) => {
    if (request.session.userId) {
        db.getSignatureByUserId(request.session.userId).then((data) => {
            if (data.rows.length === 1) {
                db.removeSignature(request.session.userId).then(() =>
                    response.redirect("/sign-petition")
                );
            } else {
                response.redirect("/sign-petition");
            }
        });
    } else {
        response.redirect("/login");
    }
});

app.listen(process.env.PORT || 8080, () => {
    console.log("PETITION IS LISTENING..");
});
