import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame, submitGuess, skipClue, publicProgress} from '../game/state.mjs';
const roster = Array.from({length:12}, (_,i)=>({id:i+1,name:`Meal ${i+1}`,ingredients:['a','b','c']}));
const meal = n => ({id:1,name:'Meal 1',ingredients:Array.from({length:n},(_,i)=>`Clue ${i}`)});
for (const n of [3,4,7,9]) for (const startWithClue of [true,false]) {
  test(`${n} ingredients, free clue ${startWithClue}: final wrong guess loses with exact budget`,()=>{
    let s=createGame(meal(n),{startWithClue});
    assert.equal(s.revealed,Number(startWithClue));
    assert.equal(publicProgress(s,false),`Guess 1/${n}`);
    for(let i=0;i<n;i++) {
      assert.equal(publicProgress(s,true),`Guess ${i+1}/X`);
      s=submitGuess(s,i+2,roster).state;
      assert.equal(s.status,i===n-1?'lost':'playing');
      assert.ok(s.revealed<=n);
    }
    assert.equal(s.history.length,n);
    assert.strictEqual(submitGuess(s,1,roster).state,s);
    assert.strictEqual(skipClue(s).state,s);
  });
  test(`${n} ingredients: final correct guess wins`,()=>{
    let s=createGame(meal(n),{startWithClue});
    for(let i=0;i<n-1;i++) s=submitGuess(s,i+2,roster).state;
    s=submitGuess(s,1,roster).state;
    assert.equal(s.status,'won'); assert.equal(s.history.length,n);
  });
}
test('invalid and duplicate guesses do not consume turns',()=>{
  let s=createGame(meal(7));
  assert.strictEqual(submitGuess(s,null,roster).state,s);
  assert.strictEqual(submitGuess(s,99,roster).state,s);
  s=submitGuess(s,2,roster).state;
  assert.strictEqual(submitGuess(s,2,roster).state,s);
  assert.equal(s.history.length,1);
});
test('skip costs one attempt, reveals one clue, and preserves the last guess',()=>{
  let s=createGame(meal(3),{startWithClue:false});
  const initial=s;
  s=skipClue(s).state;
  assert.equal(s.revealed,1); assert.equal(s.history.length,1);
  assert.equal(initial.revealed,0);
  s=skipClue(s).state;
  assert.strictEqual(skipClue(s).state,s);
  assert.equal(submitGuess(s,1,roster).state.status,'won');
});
