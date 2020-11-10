#!/usr/bin/env node
import { Command } from 'commander';
import pkg from '../package.json';

const cmd = new Command();
cmd.storeOptionsAsProperties(true);
cmd.version(pkg.version);

cmd.command('jwt', 'JWT utilities', {
  executableFile: 'yac-jwt.js',
});

cmd.command('yea', 'Y.E.A utilities', {
  executableFile: 'yac-yea.js',
});

cmd.parse(process.argv);
