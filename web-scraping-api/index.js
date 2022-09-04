const express = require("express");
const axios = require("axios"),
  cheerio = require("cheerio");
var postTitle = "",
  id = "shrutikuhar";
var app = express();

const getPostTitles = async () => {
  try {
    const { data } = await axios.get(
      "https://www.codechef.com/users/".concat(id)
    );
    const $ = cheerio.load(data);

    $("div.rating-number").each((_idx, el) => {
      postTitle = $(el).text();
    });

    return postTitle;
  } catch (error) {
    throw error;
  }
};

app.get("/", (req, res) => {
  getPostTitles().then((postTitle) => console.log(postTitle));
});

var port = process.env.PORT || "3000";
app.listen(port, (err) => {
  if (err) throw err;
  console.log("Server listening on port ", port);
});
// body.main.div.div.div.aside.div.widget.pl0.pr0.widget-rating.div.div.rating-header.text-center.div.rating-number
