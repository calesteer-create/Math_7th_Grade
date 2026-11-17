import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BOOK_GROUPS } from "../src/lib/natural-numbers";
import { canonicalPractice, gradePractice, publicPractice, validatePracticeBank, validatePracticeResponse, type PracticeBank } from "../src/lib/practice-grading";
import { validateLessonPresentation } from "../src/lib/lesson-presentation";
import { validateLessonPublication, type LessonDraft } from "../src/lib/lesson-publication";
import type { OriginalAssessment } from "../src/lib/assessment";

const lesson = JSON.parse(readFileSync("src/content/lesson-1.json", "utf8")) as LessonDraft;
const bank = JSON.parse(readFileSync("src/content/practice/natural-numbers.json", "utf8")) as PracticeBank;

test("all six original textbook tasks have an interactive activity and a detailed solution", () => {
  assert.equal(bank.exercises.length,6);
  assert.deepEqual(bank.exercises.map(e=>e.sourceOrder),[1,2,3,4,5,6]);
  assert.deepEqual(new Set(bank.exercises.map(e=>e.view.kind)),new Set(["sets","digit-choice","twins","number-line","digit-value","planet"]));
  assert.doesNotThrow(()=>validatePracticeBank(lesson,bank));
  for(const definition of bank.exercises) {
    assert.ok(definition.solution.steps.length>=4);
    assert.ok(definition.solution.steps.every(step=>step.text.length>35));
    assert.ok(definition.hints.length>=2);
    assert.ok(gradePractice(definition,validatePracticeResponse(definition,definition.expected)).correct);
  }
});
test("task answers match the supplied book values, not invented replacements", () => {
  const byKey=Object.fromEntries(bank.exercises.map(e=>[e.key,e]));
  assert.equal(byKey["count-five"].expected.group,BOOK_GROUPS.find(g=>g.count===5)?.label);
  for(const key of ["place-7430","big-place"]) {
    const definition=byKey[key];
    const position=Number(definition.expected.position);
    const digit=definition.view.number![definition.view.number!.length-1-position];
    assert.equal(digit,definition.view.focusDigit);
    assert.equal(Number(definition.expected.value),Number(digit)*10**position);
  }
  assert.deepEqual(byKey["twin-fives"].expected,{leftValue:"500000",rightValue:"5000"});
  assert.equal(byKey["point-eight"].expected.point,"8");
  const neptune=byKey["neptune-code"].expected;
  assert.equal(Number(neptune.number),Number(neptune.billions)*1e9+Number(neptune.millions)*1e6+Number(neptune.thousands)*1000+Number(neptune.units));
  assert.equal(neptune.number,"4503444000");
});
test("wrong but complete attempts get actionable feedback, not false success", () => {
  for(const definition of bank.exercises) {
    const response={...definition.expected};
    const field=definition.view.fields[0];
    response[field.key]=field.type==="choice" ? field.choices!.find(v=>v!==response[field.key])! : response[field.key]==="0"?"1":"0";
    const feedback=gradePractice(definition,validatePracticeResponse(definition,response));
    assert.equal(feedback.correct,false);
    assert.ok(feedback.fields.some(f=>!f.correct && f.message.length>10));
  }
});
test("initial and hint-only responses never expose the solution or answer map", () => {
  const definition=bank.exercises[0];
  const publicEntry=publicPractice(definition.key,"sample-version",definition);
  assert.equal(publicEntry.solution,undefined);
  assert.equal(publicEntry.state.feedback,null);
  assert.equal(publicEntry.state.attempts,0);
  assert.deepEqual(publicEntry.state.hints,[]);
  assert.ok(!JSON.stringify(publicEntry).includes('"expected"'));
  assert.ok(!JSON.stringify(publicEntry).includes('"mistakes"'));
  assert.ok(!JSON.stringify(publicEntry).includes('"sourceOrder"'));
  const hinted=publicPractice(definition.key,"sample-version",definition,{response:{},attempts:0,solved:false,hintsShown:1,solutionViewed:true});
  assert.equal(hinted.state.hints.length,1);
  assert.equal(hinted.solution,undefined);
  assert.equal(hinted.state.solutionViewed,false);
});
test("student coaching is released only after a real recorded attempt and explicit viewing", () => {
  const definition=bank.exercises[1];
  const tried={response:{position:"2",value:"4"},attempts:1,solved:false,hintsShown:0,solutionViewed:false};
  assert.equal(publicPractice(definition.key,"v",definition,tried).solution,undefined);
  const opened=publicPractice(definition.key,"v",definition,{...tried,solutionViewed:true});
  assert.deepEqual(opened.solution,definition.solution);
  assert.equal(opened.state.feedback?.correct,false);
});
test("incomplete or invalid input is not an attempt; numeric formatting remains supported", () => {
  const definition=bank.exercises.find(e=>e.key==="big-place")!;
  assert.throws(()=>validatePracticeResponse(definition,{}));
  assert.throws(()=>validatePracticeResponse(definition,{position:"8",value:"200000000x"}));
  assert.throws(()=>validatePracticeResponse(definition,{position:"8",value:"200000000",solved:"true"}));
  assert.deepEqual(validatePracticeResponse(definition,{position:"8",value:"٢٠٠٬٠٠٠٬٠٠٠"}),{position:"8",value:"200000000"});
});
test("canonical comparison is stable across database JSON key ordering", () => {
  assert.equal(canonicalPractice({b:[2,3],a:{y:2,x:1}}),canonicalPractice({a:{x:1,y:2},b:[2,3]}));
});
test("the notebook is four writing sheets, not a repeated summary", () => {
  assert.equal(lesson.notebook.length,4);
  assert.equal(new Set(lesson.notebook.map(s=>s.id)).size,4);
  for(const section of lesson.notebook) {
    assert.ok(section.writingTask.length>35);
    assert.ok(!section.blocks.some(block=>block.kind==="summary" || block.kind==="exercise" || block.kind==="check"));
  }
  assert.ok(lesson.notebook.some(s=>s.blocks.some(b=>b.kind==="example" && b.steps.length>=5)));
  assert.ok(lesson.notebook.some(s=>s.blocks.some(b=>b.kind==="law")));
  assert.ok(lesson.notebook.some(s=>s.blocks.some(b=>b.kind==="bookFigure" && b.figure==="numberLine")));
  assert.ok(lesson.notebook.some(s=>s.blocks.some(b=>b.kind==="bookFigure" && b.figure==="placeValue")));
  assert.doesNotThrow(()=>validateLessonPresentation(lesson));
});
test("future notebook publication rejects replacing writing sheets with summaries", () => {
  const invalid=structuredClone(lesson);
  invalid.notebook[0].blocks=[{kind:"summary",origin:"book",items:["ملخص قصير"]}];
  assert.throws(()=>validateLessonPresentation(invalid),/لا ملخصًا/);
});


test("copybook sheet identities cannot collide and erase each other's notes", () => {
  const bad=structuredClone(lesson);
  bad.notebook[1].id=bad.notebook[0].id;
  const assessment=JSON.parse(readFileSync("src/content/assessments/natural-numbers.json","utf8")) as OriginalAssessment;
  assert.throws(()=>validateLessonPublication(bad,assessment),/فريدة/);
});
test("activity contracts reject fields that cannot be rendered or answered", () => {
  const bad=structuredClone(bank);
  bad.exercises[1].view.number=undefined;
  assert.throws(()=>validatePracticeBank(lesson,bad),/غير صالح/);
  const wrongFields=structuredClone(bank);
  wrongFields.exercises[0].view.fields[0].key="unknown";
  assert.throws(()=>validatePracticeBank(lesson,wrongFields),/لا تتوافق/);
});
