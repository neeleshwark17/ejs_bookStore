var express = require("express");
var router = express.Router();
var db = require("../database");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const session = require("express-session");

router.use(
  session({ secret: "secret", saveUninitialized: false, resave: false })
);

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use("/uploads", express.static(path.join(__dirname, "/uploads")));
router.use(express.static("uploads"));

/* GET home page. */
router.get("/", function (req, res) {
  var query =
    "create table if not exists books(bookId int(4) auto_increment primary key,bookName varchar(40),bookAuthor varchar(30),bookPrice decimal(12,2),bookImage varchar(50))";
  db.query(query, (err, result) => {
    let sql = "select *from books";
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.render("index", { title: "Home", results: result });
    });
  });
});

//Admin Page route
router.get("/adminPage", (req, res) => {
  var sess = req.session;
  if (sess.metaData) {
    var data = sess.metaData;

    let sql = "select *from books";
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.render("adminLoggedIn", {
        title: "Admin Portal",
        metaData: data,
        results: result,
      });
    });
  } else res.render("admin", { title: "Admin Login" });
});

//About Page route
router.get("/aboutPage", (req, res) => {
  var sess = req.session;
  var data = sess.metaData;
  if (sess.metaData) {
    res.render("about", { title: "About", metaData: data });
  } else res.render("about", { title: "About" });
});

var image = "";
////////MULTER

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    image = Date.now() + path.extname(file.originalname) + "";
    cb(null, image);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png")
    cb(null, true);
  else cb(null, false);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post("/insert", upload.single("imageName"), (req, res, next) => {
  var sess = req.session; ///SESSION VARIABLE

  console.log("INSERT");
  let data = {
    bookName: req.body.bookName,
    bookAuthor: req.body.bookAuthor,
    bookPrice: req.body.bookPrice,
    bookImage: image,
  };

  var query = "insert into books set ?";
  db.query(query, data, (err, results) => {
    console.log("INSERT QUERY");
    if (err) throw err;
    else {
      if (sess.metaData) {
        var data = sess.metaData;
      }
      res.render("adminLoggedIn", { title: "Admin Portal", metaData: data });
    }
  });
});

router.post("/logins", (req, res) => {
  var sess = req.session; ///SESSION VARIABLE

  var email = req.body.aemail;
  var pass = req.body.apass;

  let query =
    "select*from admins where aemail='" + email + "' and apass='" + pass + "'";
  db.query(query, (err, results) => {
    if (results.length === 0) {
      console.log("No Such user");
      res.render("admin", { title: "Admin Login", msg: "wrong credentials" });
    } else {
      sess.metaData = results;
      res.render("adminLoggedIn", {
        title: "Amdmin Portal",
        // result: results,
        metaData: results,
      });
    }
  });
});

router.get("/delete/:id", (req, res) => {
  let bookID = req.params.id;
  var query = 'delete from books where bookId="' + bookID + '" ';
  db.query(query, (err, result) => {
    console.log(bookID);
    if (err) throw err;
    var sql = "select *from books";
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.redirect("/");
    });
  });
});

router.get("/edit/:id", (req, res) => {
  let ID = req.params.id;
  let query = "select *from books where bookId=" + ID;
  db.query(query, (err, result) => {
    res.render("edit", { title: "Edit Page", results: result });
  });
});

router.post("/edit/:id", (req, res) => {
  let bookID = req.params.id;
  let data = {
    Name: req.body.bookName,
    Author: req.body.bookAuthor,
    BookImage: req.body.bookImage,
    Price: req.body.bookPrice,
  };

  var sql = "update books set data";
  db.query(sql, data, (err, result) => {
    if (err) throw err;
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
module.exports = router;
