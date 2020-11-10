#!/usr/bin/env node
import { Command } from 'commander';

import os from 'os';

import chalk from 'chalk';

import { Terminal, WIZARD_TYPES } from './core/terminal';
import { downloadAsset } from './core/files';

/*
 *   Utilities related to yea https://github.com/heilmela/yea
 */

const cmd = new Command();
cmd
  .command('generate')
  .option('-a, --author <author>', 'Author of the project.')
  .action(async (options) => {
    let result;
    try {
      result = await generateProject({
        author: options.author,
        terminal: new Terminal('Yea'),
      });
    } catch (err) {
      console.log('Generating failed.');
      console.log(err);
      return;
    }
    console.log(result);
  });

async function generateProject({ author, terminal }) {
  terminal.nextPage();
  let content = [
    {
      type: WIZARD_TYPES.input,
      name: 'author',
      question: 'Enter your name/email',
      default: os.hostname,
    },
    {
      type: WIZARD_TYPES.input,
      name: 'path',
      question: `Enter the project path (defaults to ${process.cwd()}`,
      default: process.cwd(),
    },
    {
      type: WIZARD_TYPES.checkbox,
      name: 'types',
      question: 'Select template features to include ',
      choices: ['MongoDB', 'Integration Tests', 'Authentication'],
    },
  ];
  let wizard = terminal.wizard(content);
  let result = await wizard.start();
  console.log(chalk.yellowBright('Creating the following project:'));
  console.log(
    chalk.cyan('Author: '),
    chalk.redBright(result[0].author),
  );
  console.log(chalk.cyan('Path: '), chalk.redBright(result[1].path));
  console.log(
    chalk.cyan('Options: '),
    chalk.redBright(result[2].types.join(', ')),
  );
  let url = 'https://github.com/heilmela/yea/zipball/main';

  let path = result[1].path == '' ? process.cwd() : result[1].path;

  let projectPath = await downloadAsset({
    name: 'yea',
    path,
    url,
    terminal,
  });
  console.log(projectPath);
}

cmd.parseAsync(process.argv);
