const { getPR } = require("../../src/services/nlpSearch");
const nlp = require("compromise");
describe("getPR", () => {
  let req;

  beforeEach(() => {
    req = {
      body: {
        query: "",
      },
    };
    // Spy on console.log to capture output
    // jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });
  test("should extract active status for open projects", async () => {
    req.body.query = "open Java project";

    await getPR(req);

    // expect(console.log).toHaveBeenCalledWith("Extracted Status:", "active");
    // expect(console.log).toHaveBeenCalledWith(
    //   "Project Mentions:",
    //   "Java project"
    // );
    // expect(console.log).toHaveBeenCalledWith("Extracted Project Name:", "Java");
  });
  test("Test NLP library", async () => {
    let query = "Find all Java project's open PRs";

    const doc = nlp(query);
    let status = "";
    // Extract status:
    if (doc.has("open")) {
      status = "active";
    } else if (doc.has("closed")) {
      status = "completed";
    }

    console.log("Extracted Status:", status);
    // Extract repository name:
    let opts = {
      keepPunct: false,
    };
    const projectMentions = doc
      //   .normalize()
      .matchOne("#Noun+ #Noun")
      .text(opts);
    console.log("Project Mentions:", projectMentions);
  });
  test("Documentations", () => {
    let sentence = "Find all Java project's open PRs";
    let doc = nlp(sentence);
    doc.possessives().strip();
    let strippedText = doc.text();
    let newDoc = nlp(strippedText); // Ensure newDoc is created from strippedText

    let matchedDoc = newDoc.match(
      "(java|#ProperNoun) project (#Adjective)? PRs"
    );
    console.log(
      "3. Matched document (before .before('PRs')):",
      matchedDoc.text()
    );

    // Change: Specify the boundary more inclusively
    let projectPhrase = matchedDoc.before("PRs").text();
    console.log("4. Extracted phrase (before 'PRs'):", projectPhrase);

    // If you want "Java project" specifically
    let justProject = matchedDoc.match("(java|#ProperNoun) project").text();
    console.log("5. Just 'Java project':", justProject);

    // If you want "Java project open" specifically
    let projectAndAdjective = matchedDoc
      .match("(java|#ProperNoun) project open")
      .text();
    console.log("6. 'Java project open':", projectAndAdjective);
  });
});
