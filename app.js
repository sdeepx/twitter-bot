const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "config/.conf.env") });
const twit = require("./twit");

const paramsPath = path.join(__dirname, "params.json");

const writeParams = (data) => {
  console.log("Writing the params file... ", data);
  return fs.writeFileSync(paramsPath, JSON.stringify(data), "UTF-8");
};

const readParams = () => {
  console.log("reading params ..");
  const data = fs.readFileSync(paramsPath);
  return JSON.parse(data.toString());
};

const getTweet = (since_id) => {
  return new Promise((resolve, reject) => {
    const params = {
      q: "#security",
      count: 1,
    };
    since_id && (params.since_id = since_id);
    console.log(`We are getting the tweets.. ${params.since_id}`);
    twit.get("search/tweets", params, (err, data) =>
      err ? reject(err) : resolve(data)
    );
  });
};

const postTweet = (id) => {
  return new Promise((resolve, reject) => {
    const params = { id };
    twit.post("statuses/retweet/:id", params, (err, data) =>
      err ? reject(err) : resolve(data)
    );
  });
};

const main = async () => {
  try {
    const params = readParams();
    const data = await getTweet(params.since_id);
    const tweets = data.statuses;
    console.log("we got tweets", tweets.length);
    for await (const tweet of tweets) {
      try {
        await postTweet(tweet.id_str);
        console.log(`Successful ${tweet.id_str}`);
      } catch (error) {
        console.log("unsuccessful retweet " + tweet.id_str);
      }
      params.since_id = tweet.id_str;
    }
    writeParams(params);
  } catch (error) {
    console.log(err);
  }
};

console.log("starting twitter bot.....");
setInterval(main, 10000);
