const codebolt = require("@codebolt/codeboltjs").default;
const { readFileSync } = require("fs");

const { compile } = require("handlebars");

const writeDocumentation = async (nodeTypeInfo) => {
    let templatePath = `${__dirname}/prompt.handlebars`;
  const PROMPT = readFileSync(templatePath, "utf-8").trim();
  let template = compile(PROMPT);
  let renderedTemplate = template({ nodeTypeInfo });
  console.log(renderedTemplate);

  const llmresponse = await codebolt.llm.inference(renderedTemplate);
  console.log(llmresponse);
  
  let response = llmresponse.message.trim();

        let start = response.indexOf("~~~") + 3;
        let end = response.lastIndexOf("~~~");
        response = response.slice(start, end).trim();
        response = response.trim();

        const result = [];
        let current_file = null;
        let current_code = [];
        let code_block = false;

        for (const line of response.split("\n")) {
            if (line.startsWith("File: ")) {
                if (current_file && current_code.length) {
                    result.push({file: current_file, code: current_code.join("\n")});
                }
                current_file = line.split("`")[1].trim();
                current_code = [];
                code_block = false;
            } else if (line.startsWith("```")) {
                code_block = !code_block;
            } else {
                current_code.push(line);
            }
        }

        if (current_file && current_code.length) {
            result.push({file: current_file, code: current_code.join("\n")});
        }
        for (const file of result) {
            await codebolt.fs.createFile(file.file,file.code,null);
        }

};

module.exports = { writeDocumentation };
