// Prints design boards without the noise, so reading them costs far fewer tokens.
// Usage (from the folder the Artifact "read" told you about):
//   node D:/Work-or-ticket/quiz/docs/tools/compact-board.cjs project/Quizzes.dc.html project/NewQuiz.dc.html
const fs = require("fs");

for (const file of process.argv.slice(2)) {
  let s = fs.readFileSync(file, "utf8");
  s = s
    .replace(/<!doctype[\s\S]*?<x-dc>/i, "") // page head
    .replace(/<\/x-dc>[\s\S]*$/, "") // the tweak script at the end
    .replace(/<link[^>]*fonts[^>]*>\s*/g, "") // font links
    .replace(/<path[^>]*d="[^"]*"[^>]*\/?>/g, "<path/>") // icon drawing data
    .replace(/<svg[^>]*>/g, "<svg>");
  console.log(`=== ${file}\n${s}`);
}
