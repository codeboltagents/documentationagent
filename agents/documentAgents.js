const codebolt = require("@codebolt/codeboltjs").default;
const { readFileSync } = require("fs");

const { compile } = require("handlebars");
const path = require("path");

const writeDocumentation = async (tree,projectPath) => {
    // typeof(tree)
    let sourceCode= tree.input;
    // console.log(sourceCode);
    let filePath= tree.rootNode.path;
    // return
    let templatePath = `${__dirname}/prompt.handlebars`;
    const PROMPT = readFileSync(templatePath, "utf-8").trim();
    let template = compile(PROMPT);
    let renderedTemplate = template({ nodeTypeInfo:sourceCode });
    console.log(renderedTemplate);

    const llmresponse = await codebolt.llm.inference(renderedTemplate);
    console.log(llmresponse);

    let response = llmresponse.message.trim();
    let start = response.indexOf("~~~") + 3;
    let end = response.lastIndexOf("~~~");
    response = response.slice(start, end).trim();
    response = response.trim();
    // console.log(response);
    const comments = [];
    let current_function = null;
    let current_comment = [];
    let code_block = false;

    for (const line of response.split("\n")) {
        if (line.startsWith("Function:")) {
            if (current_function && current_comment.length) {
                comments.push({ functionName: current_function, jsDoc: current_comment.join("\n") });
            }
            current_function = line.split("`")[1].trim();
            current_comment = [];
            code_block = false;
        } else if (line.startsWith("```")) {
            code_block = !code_block;
        } else if (code_block) {
            current_comment.push(line);
        }
    }

    if (current_function && current_comment.length) {
        comments.push({ functionName: current_function, jsDoc: current_comment.join("\n") });
    }
    

    /**
     * changed by ravi
     */

    const commentInsertions = [];
    tree.rootNode.descendantsOfType('function_declaration').forEach(node => {
        const functionName = node.childForFieldName('name').text;
        // console.log(functionName)
        const commentIndex = comments.findIndex(comment => comment.functionName === functionName);
        // console.log(commentIndex)

        if (commentIndex !== -1) {
            const newJsDoc = comments[commentIndex].jsDoc;
            const previousNode = node.previousNamedSibling;

            if (previousNode && previousNode.type === 'comment') {
                // Update existing comment
                const startIndex = previousNode.startIndex;
                const endIndex = previousNode.endIndex;
                sourceCode = sourceCode.slice(0, startIndex) + newJsDoc + sourceCode.slice(endIndex);
            } else {
                // Note the position for new comment
                const functionStartLine = node.startPosition.row;
                commentInsertions.push({ line: functionStartLine, comment: newJsDoc });
            }
        }
    });

    // Add new comments at the noted positions
    if (commentInsertions.length > 0) {
        const lines = sourceCode.split('\n');
        commentInsertions.sort((a, b) => b.line - a.line); // Sort in reverse order to avoid messing up line numbers

        commentInsertions.forEach(insertion => {
            lines.splice(insertion.line, 0, insertion.comment);
        });
        sourceCode = lines.join('\n');
        //now we have updated file here 
        console.log(sourceCode);
    }
    // let filePath= tree.rootNode.path;
    console.log(filePath);


const relativeFilePath = path.relative(projectPath, filePath);
console.log(relativeFilePath); // Output: index.js
    await codebolt.fs.updateFile('',relativeFilePath, sourceCode, 'utf8');
};

module.exports = { writeDocumentation };
