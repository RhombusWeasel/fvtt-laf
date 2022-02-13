import { ATTRIBUTE_TYPES } from "./constants.js";
import { lasersRoll, feelingsRoll } from "./lasersandfeelings.js";

function evaluateRoll(r, num){
  let res = {'Lasers': 0, 'Feelings':0, 'LaserFeelings': 0};
  r.terms[0].results.forEach(die => {
    if (die.result < num)  res['Lasers'] += 1;
    if (die.result > num)  res['Feelings'] += 1;
    if (die.result == num) res['LaserFeelings'] += 1;
  });
  return res;
}

function rollDialogTemplate(type){
  return `
    <div>
      <h1>${type}</h1>
      <input type="radio" name="count" id="normal" value="1" checked>
      <label for="normal">Normal</label><br>
      <input type="radio" name="count" id="prepared" value="2">
      <label for="prepared">Prepared</label><br>
      <input type="radio" name="count" id="expert" value="3">
      <label for="expert">Expert</label><br>
    </div>
  `;
}

function rollTemplate(r, type){
  let resultContent = '';
  if(r['LaserFeelings'] > 0){
    resultContent = `
      <p class="roll success">${game.i18n.localize("SIMPLE.Successes")}: ${r[type]}</p>
      <p class="roll laserfeelings">Laser-Feelings: ${r['LaserFeelings']}</p>
    `;
  }else if(r[type] > 0){
     resultContent = `
       <p class="roll success">${game.i18n.localize("SIMPLE.Successes")}: ${r[type]}</p>
     `;
  }else{
    resultContent = `
      <p class="roll success">Failed</p>
    `;
  }

  return resultContent;
}

function rollDice(type, name, stat){
  new Dialog({
    title: `${type} Roll!`,
    content: rollDialogTemplate(type),
    buttons: {
      roll: {
        label: 'Roll',
        callback: (html) => {
          let amt = "1"
          let radio = document.getElementsByName('count');
          for (let i=0; i<radio.length; i++) {
            if (radio[i].checked) {
              amt = radio[i].value
            }
          }
          let roll = new Roll(`${amt}d6`).evaluate({async: false});
          let result = evaluateRoll(roll, stat);
          roll.toMessage({
            rollMode: 'roll',
            speaker: {alias: name}
          });
          ChatMessage.create({
            content: rollTemplate(result, type),
            roll: roll,
            speaker: {alias: name}
          });
        }
      }
    }
  }).render(true);
}

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SimpleActorSheet extends ActorSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["laf", "sheet", "actor"],
  	  template: "systems/laf/templates/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */
  /** @override */
  getData() {
    const  data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    return  data;
    }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    
    super.activateListeners(html);

    //localizing labels on the character sheet
    $(html).parents('.app').find('.numbersLabel')[0].innerText = game.i18n.localize("SIMPLE.Number");
    $(html).parents('.app').find('#styleLabel')[0].innerText = game.i18n.localize("SIMPLE.Style");
    $(html).parents('.app').find('#roleLabel')[0].innerText = game.i18n.localize("SIMPLE.Role");
    $(html).parents('.app').find('#goalLabel')[0].innerText = game.i18n.localize("SIMPLE.Goal");
    var name = $(html).parents('.app').find('.sheet-header h1.charname input')[0].value;
    let act = game.actors.getName(name)

    //Lasers rolls
    html.find('a.lasers').click(ev => {
      console.log('Attempting Feelings roll.')
      rollDice('Lasers', act.name, act.data.data.theOnlyStat)
    });
    //Feelings rolls
    html.find('a.feelings').click(ev => {
      console.log('Attempting Feelings roll.')
      rollDice('Feelings', act.name, act.data.data.theOnlyStat)
    });
  }//end of activatelisteners

}
