import clear from 'clear';
import figlet from 'figlet';
import chalk from 'chalk';
import { Spinner } from 'clui';
import inquirer from 'inquirer';
export class Terminal {
  constructor(title) {
    this.title = title;
  }

  nextPage() {
    this.clear();
    this.printHeader();
  }
  clear() {
    clear();
  }
  wizard(content) {
    return new Wizard({ content, terminal: this });
  }

  spinner(message) {
    return new Spinner(message);
  }

  printHeader() {
    console.log(
      chalk.cyan(
        figlet.textSync(this.title, { horizontalLayout: 'full' }),
      ),
    );
  }
}
export const WIZARD_TYPES = {
  checkbox: 'checkbox',
  input: 'input',
};
class Wizard {
  constructor({ content, terminal }) {
    this.content = content;
    this.terminal = terminal;
    this.answers = [];
  }

  _createList({ name, question, choices, type }) {
    const questions = [
      {
        type: type,
        name: name,
        message: question,
        choices: choices,
      },
    ];
    return inquirer.prompt(questions);
  }
  async start() {
    let index = 0;
    while (index < this.content.length) {
      let item = this.content[index];
      let prompt = this._createList(item);
      let answers = await prompt;
      this.answers.push(answers);
      this.terminal.nextPage();
      index++;
    }

    return this.answers;
  }
}
