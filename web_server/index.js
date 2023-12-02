// express.js
require('dotenv').config()
const path = require("path");
const express = require("express");
const subredditController = require("./controllers/subreddit");
const userController = require("./controllers/users");
const app = express();

const PORT = 3000;
const testPostData = [
  {
    id: 1,
    title:
      "TIL the FBI has struggled to hire hackers because of the FBI hiring rule that the applicant must not have used marijuana during the last 3 years",
    author: "flaggingd",
    timestamp: Date.now() - 213444,
    content:
      "Its funny how much people will lie about this stuff on the internet. I am in no way a hacker but i can assure you that there are many people out there who smoke weed regularly and do it professionally as well. This is just an example of someones opinion being passed around as fact without any research done.\n\nThe problem with this is that when you start looking into what is actually true, you find more lies than facts. ",
    upvotes: 124,
    downvotes: 9,
    comments: [
      {
        id: 1,
        author: "BooBan44x",
        timestamp: Date.now() - 132415,
        content: "Great post!",
      },
      {
        id: 2,
        author: "Cptn_Squirrel",
        timestamp: Date.now() - 107886,
        content: "This is why I don't use the internet.",
      },
    ],
  },
  {
    id: 2,
    title: "How to tell if your phone is listening to you",
    author: "Alyssa_Wolfe",
    timestamp: Date.now() - 197831,
    content:
      "I know that there are many ways to tell if your phone is listening to you, but I thought I would share my personal experience with you all. A few weeks ago, I was sitting at home watching TV when I heard a strange noise coming from my phone. It sounded like someone was talking to me through the speaker. I looked over at my phone and saw that it was recording a video of me.\n\nAt first, I thought it was just a glitch or something, but after a few minutes, I realized that it was actually recording me. I quickly turned off my phone and went to the store to get a new one.",
    upvotes: 100,
    downvotes: 12,
    comments: [
      {
        id: 3,
        author: "Alice_Rosie",
        timestamp: Date.now() - 181452,
        content: "That is so creepy!",
      },
      {
        id: 4,
        author: "Jayden_Harris",
        timestamp: Date.now() - 175431,
        content: "What kind of phone did you have?",
      },
    ],
  },
  {
    id: 3,
    title: 'What does the term "ghosting" mean?',
    author: "Lilly_Gibbs",
    timestamp: Date.now() - 181388,
    content:
      'I recently learned about the term "ghosting" and wanted to share my thoughts on it with you all. Ghosting is when someone stops responding to your messages or calls without any explanation. It usually happens after a date or meeting someone new. I think that ghositng is a cowardly act and it is not a nice thing to do to someone. It leaves the person feeling confused and hurt. I hope that people will stop using this term and start being more respectful to others.',
    upvotes: 120,
    downvotes: 10,
    comments: [
      {
        id: 5,
        author: "James_Henderson",
        timestamp: Date.now() - 169321,
        content: "I agree with you, it is not nice at all.",
      },
      {
        id: 6,
        author: "Emma_Williams",
        timestamp: Date.now() - 165431,
        content: "I have experienced this and it was really hurtful.",
      },
    ],
  },
  {
    id: 4,
    title: "How to spot a fake smile",
    author: "James_Henderson",
    timestamp: Date.now() - 165311,
    content:
      'I recently learned about the term "fake smile" and wanted to share my thoughts on it with you all. A fake smile is when someone smiles but their eyes do not show any happiness. It is a way for people to hide their true feelings. I think that it is important to be aware of fake smiles, as they can be a sign of dishonesty or discomfort. I hope that people will start to recognize fake smiles and be more open with their emotions.',
    upvotes: 110,
    downvotes: 9,
    comments: [
      {
        id: 7,
        author: "Emma_Williams",
        timestamp: Date.now() - 161321,
        content:
          "I have noticed this in some people and it is quite interesting.",
      },
      {
        id: 8,
        author: "Lilly_Gibbs",
        timestamp: Date.now() - 157311,
        content: "I have also noticed this and it is quite sad.",
      },
    ],
  },
  {
    id: 5,
    title: "The importance of self-care",
    author: "Alice_Rosie",
    timestamp: Date.now() - 157211,
    content:
      'I recently learned about the term "self-care" and wanted to share my thoughts on it with you all. Self-care is the practice of taking care of yourself and prioritizing your own well-being. It is important to practice self-care because it helps you to be more productive, happier, and healthier. I hope that people will start to prioritize self-care in their lives and make it a regular habit.',
    upvotes: 100,
    downvotes: 8,
    comments: [
      {
        id: 9,
        author: "Jayden_Harris",
        timestamp: Date.now() - 153211,
        content: "I agree, self-care is very important.",
      },
      {
        id: 10,
        author: "Alyssa_Wolfe",
        timestamp: Date.now() - 147211,
        content:
          "I have started practicing self-care and it has made a big difference in my life.",
      },
    ],
  },
  {
    id: 6,
    title: "The dangers of social media",
    author: "Cptn_Squirrel",
    timestamp: Date.now() - 147111,
    content:
      'I recently learned about the term "social media" and wanted to share my thoughts on it with you all. Social media can be a great way to connect with people and share information, but it can also be dangerous. It can lead to cyberbullying, privacy issues, and even mental health problems. I hope that people will be more cautious when using social media and take steps to protect themselves and their information.',
    upvotes: 90,
    downvotes: 10,
    comments: [
      {
        id: 11,
        author: "BooBan44x",
        timestamp: Date.now() - 141111,
        content:
          "I have experienced some of these dangers and it is quite scary.",
      },
      {
        id: 12,
        author: "Flaggingd",
        timestamp: Date.now() - 135111,
        content:
          "I have also noticed these dangers and it is important to be aware of them.",
      },
    ],
  },
  {
    id: 7,
    title: "The impact of technology on our lives",
    author: "Flaggingd",
    timestamp: Date.now() - 135011,
    content:
      'I recently learned about the term "technology" and wanted to share my thoughts on it with you all. Technology has had a significant impact on our lives, both positive and negative. It has made our lives easier and more connected, but it has also led to a decrease in face-to-face communication and an increase in screen time. I hope that people will find a balance between using technology and maintaining human connections.',
    upvotes: 110,
    downvotes: 9,
    comments: [
      {
        id: 13,
        author: "Cptn_Squirrel",
        timestamp: Date.now() - 129011,
        content: "I agree, it is important to find a balance.",
      },
      {
        id: 14,
        author: "Emma_Williams",
        timestamp: Date.now() - 125011,
        content: "I have noticed this and it is quite concerning.",
      },
    ],
  },
  {
    id: 8,
    title: "The importance of voting",
    author: "BooBan44x",
    timestamp: Date.now() - 125011,
    content:
      'I recently learned about the term "voting" and wanted to share my thoughts on it with you all. Voting is an important part of democracy and it allows people to have a say in the decisions that affect their lives. It is important for everyone to vote, regardless of their political beliefs, because it helps to ensure that our government represents the will of the people. I hope that people will take the time to educate themselves on the issues and vote in every election.',
    upvotes: 100,
    downvotes: 8,
    comments: [
      {
        id: 15,
        author: "James_Henderson",
        timestamp: Date.now() - 119011,
        content: "I agree, voting is very important.",
      },
      {
        id: 16,
        author: "Lilly_Gibbs",
        timestamp: Date.now() - 115011,
        content:
          "I have started voting and it is my way of making a difference.",
      },
    ],
  },
  {
    id: 9,
    title: "The impact of climate change on our planet",
    author: "Jayden_Harris",
    timestamp: Date.now() - 115011,
    content:
      'I recently learned about the term "climate change" and wanted to share my thoughts on it with you all. Climate change is a major issue that is affecting our planet and its inhabitants. It is causing extreme weather events, loss of biodiversity, and rising sea levels. It is important for everyone to be aware of the impacts of climate change and take steps to reduce their carbon footprint and support policies that address this issue. I hope that people will work together to protect our planet and its future.',
    upvotes: 110,
    downvotes: 9,
    comments: [
      {
        id: 17,
        author: "Alyssa_Wolfe",
        timestamp: Date.now() - 111011,
        content:
          "I have started making changes in my life to reduce my carbon footprint.",
      },
      {
        id: 18,
        author: "Alice_Rosie",
        timestamp: Date.now() - 105011,
        content:
          "I have also noticed the impacts of climate change and it is quite concerning.",
      },
    ],
  },
  {
    id: 10,
    title: "The benefits of exercise",
    author: "Emma_Williams",
    timestamp: Date.now() - 105011,
    content:
      'I recently learned about the term "exercise" and wanted to share my thoughts on it with you all. Exercise is important for both physical and mental health. It helps to improve cardiovascular health, build muscle strength, and reduce stress. I hope that people will make exercise a regular part of their lives and experience the many benefits it has to offer.',
    upvotes: 100,
    downvotes: 8,
    comments: [
      {
        id: 19,
        author: "Cptn_Squirrel",
        timestamp: Date.now() - 99011,
        content:
          "I have noticed the benefits of exercise and it has improved my life.",
      },
      {
        id: 20,
        author: "Flaggingd",
        timestamp: Date.now() - 95011,
        content:
          "I have started exercising and it has made a big difference in my life.",
      },
    ],
  },
];
app
  .use("/", express.static(path.join(__dirname, "../client/dist/")))
  .use(express.json())

  // CORS
  .use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  })
  .use("/api/v1/me", (req, res, next) => {
    res.json({ message: "user profile" });
  })
  .use("/api/v1/subreddits", subredditController)
  .use("/api/v1/users", userController)
  .get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err?.status || 500).json({ message: err?.message || err });
});

console.log("1: Trying to start server...");

app.listen(PORT, () => {
  console.log(`2: Server is running at http://localhost:${PORT}`);
});

console.log("3: End of file, waiting for requests...");
