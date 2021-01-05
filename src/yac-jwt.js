#!/usr/bin/env node
import { Command } from 'commander';
import jwt from 'jsonwebtoken';

/*
 *   General JWT utilities
 */

const cmd = new Command();
cmd
  .command('generate')
  .option('-p, --payload <payload>', 'Payload of the jwt.')
  .requiredOption('-s, --secret <secret>', 'Secret is required.')
  .action(async (options) => {
    let result;
    try {
      result = await createToken({
        secret: options.secret,
        payload: JSON.parse(options.payload),
      });
    } catch (err) {
      console.log('Signing failed.');
      return;
    }
    console.log(result);
  });

cmd
  .command('verify <token>')
  .requiredOption('-s, --secret <secret>', 'Secret is required.')
  .action(async (token, options) => {
    let result;
    try {
      result = await verifyToken({
        secret: options.secret,
        token: token,
      });
    } catch (err) {
      //console.log(err);
    }
    if (!result) console.log('Invalid token/secret');
    else console.log(result);
  });

async function createToken({ secret, payload }) {
  const token = await jwt.sign({ data: payload }, secret);
  return token;
}

async function verifyToken({ secret, token }) {
  console.log(token);
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, payload) =>
      err ? reject(err) : resolve(payload.data),
    );
  });
}

cmd.parseAsync(process.argv);
