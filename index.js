const { writeDocumentation } = require("./agents/documentAgents");
const serialize = require('serialize-javascript');
const codebolt = require("@codebolt/codeboltjs").default;
const util = require('util');
async function execute() {
  await codebolt.waitForConnection();
  // const message = await codebolt.chat.waitforReply("Hi I am Documnetation Agent,I will help you to create documentaion of your code")
  // console.log(message)
  const { projectPath } = await codebolt.project.getProjectPath();
  console.log(projectPath);
  const { payload } = await codebolt.codeutils.getJsTree('/Users/ravirawat/Desktop/nodeApp/index.js');

  payload.forEach((tree) => {
 
    writeDocumentation(tree,projectPath);
  });
}
(async () => {
  await execute();
})();
