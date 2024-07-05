const { writeDocumentation } = require("./agents/documentAgents");
const serialize = require('serialize-javascript');
const codebolt = require("@codebolt/codeboltjs").default;
const util = require('util');

codebolt.chat.onActionMessage().on("userMessage", async (req, response) => {
  await codebolt.waitForConnection();
  codebolt.browser.newPage()

  // await codebolt.browser.goToPage("https://www.facebook.com/")
  
  const message = await codebolt.chat.waitforReply("");

  // console.log(message)
  codebolt.chat.processStarted();
  const { projectPath } = await codebolt.project.getProjectPath();

  console.log(projectPath);
  
  const { payload } = await codebolt.codeutils.getJsTree();

  // /Users/ravirawat/Desktop/nodeApp/index.js
  payload.forEach((tree) => {
    writeDocumentation(tree,projectPath);
  });
  
})
// (async () => {
//   await execute();
// })();
