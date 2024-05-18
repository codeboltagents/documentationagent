const { writeDocumentation } = require("./agents/documentAgents");

const codebolt = require("@codebolt/codeboltjs").default;

async function execute() {
  await codebolt.waitForConnection();
  // const message = await codebolt.chat.waitforReply("Hi I am Documnetation Agent,I will help you to create documentaion of your code")
  // console.log(message)
  const { projectPath } = await codebolt.project.getProjectPath();
  console.log(projectPath + "\\library.js");
  const { payload } = await codebolt.codeutils.getJsTree(projectPath);
  payload.forEach((tree) => {
    // console.log(tree.language.nodeTypeInfo)
    writeDocumentation(JSON.stringify(tree.input));
  });

  // const readFile= await codebolt.fs.readFile("index.js", filePath: string)
}
(async () => {
  await execute();
})();
