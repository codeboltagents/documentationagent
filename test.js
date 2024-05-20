const fs = require('fs');
const path = require('path');
const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript');

const parser = new Parser();
parser.setLanguage(JavaScript);


const filePath = path.resolve('/Users/ravirawat/Desktop/nodeApp/index.js');
console.log(filePath)
let sourceCode = fs.readFileSync(filePath, 'utf8');
console.log(sourceCode)

const comments = [];

const tree = parser.parse(sourceCode);
console.log(tree.rootNode);

const commentInsertions = [];

tree.rootNode.descendantsOfType('function_declaration').forEach(node => {
  const functionName = node.childForFieldName('name').text;
  console.log(functionName)

    comments.push({
      functionName :functionName,
      jsDoc: `/**\n  This is the ${functionName} function\n */`
    });
  const commentIndex = comments.findIndex(comment => comment.functionName === functionName);
  console.log(commentIndex)
  
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
}

// fs.writeFileSync(filePath, sourceCode, 'utf8');
