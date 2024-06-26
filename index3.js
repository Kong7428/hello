var express = require("express");
var app = express();
const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
const dbPath = path.join(__dirname, "database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
});

// let comments = []; // 빈 db... 껐다 켜면 사라지죠?
const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,

  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/css", express.static(path.join(__dirname, 'css')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// app.get("/", function (req, res) {
//   res.render("index3", { comments: comments });
// }); // 루트 페이지에 index3.ejs 파일을 render 시키겠다!
app.get("/", async function (req, res) {
  // 데이터베이스에서 모든 댓글을 가져옵니다.
  // const user = await User.findAll();
  res.render("home");
});

app.post("/register", async function (req, res) {
  const { name, username, password } = req.body;
  console.log(name, username, password); // 로그로 데이터 확인

  try {
    // 이름과 사용자 이름이 이미 존재하는지 확인합니다.
    const existingName = await User.findOne({ where: { name } });
    const existingUsername = await User.findOne({ where: { username } });
    
    let errorMessage = "";
    if (existingName) {
      errorMessage += "이미 존재하는 닉네임입니다. ";
    }
    if (existingUsername) {
      errorMessage += "이미 존재하는 아이디입니다.";
    }
    
    if (errorMessage) {
      return res.render("register", { errorMessage });
    }

    await User.create({ name, username, password });
    res.redirect("/login");
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
});


app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register"); 
});

app.get("/review", function(req, res) {
  res.render("review"); 
});


app.post("/login", async function (req, res) {
  const { username, password } = req.body;
  console.log(username, password);

  try {
    const user = await User.findOne({ where: { username, password } });

    if (user) {
      res.redirect("/home");
    } else {
      res.render("login", { errorMessage: "ID 또는 비밀번호가 틀렸습니다." });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Error logging in");
  }
});


app.get("/home", function (req, res) {
  res.render("home");
});

// app.listen(3000);
// console.log("Server is listening on port 3000");
(async () => {
  await sequelize.sync({ force: false }); // 개발 단계에서는 { force: true } 옵션으로 테이블을 매번 초기화
  app.listen(3000, "0.0.0.0", () => {
    console.log("Server is listening on port 3000");
  });
})();
