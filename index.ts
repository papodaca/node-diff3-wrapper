import * as childProcess from "child_process";
import * as path from "path";

import { sync as which } from "which";

interface ProcessResult {
  stdout: string;
  stderr: string;
  statusCode: Number;
}

function callChild(path: string, stdin: string | undefined, allowFail: Number | null, ...args): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if(!path) {
      return reject("")
    }
    let proc = childProcess.spawn(path, args);
    let stdout = "";
    proc.stdout.on("data", (data) => {
      stdout = stdout + data.toString();
    });
    proc.on("close", (code, signal) => {
      if(code !== 0) {
        if(allowFail !== null && allowFail === code) {
          resolve(stdout);
        } else {
          reject(code);
        }
      } else {
        resolve(stdout);
      }
    });
    if(stdin) {
      proc.stdin.write(stdin);
      proc.stdin.end();
    }
  });
}

let binDir = path.join(__dirname, "bin");

let diff3Path;

try {
  if(process.platform === "win32") {
    diff3Path = path.join(binDir, "diff3.exe");
  } else {
    diff3Path = which("diff3");
  }
} catch(e) {
  if(process.platform !== "win32") {
    console.error("module node-diff3-wrapper requires gnu difftools to be on the path");
  }
}
export module Diff3 {
  export function diff(fileA: string, fileO: string, fileB:string, stdin?: string): Promise<string> {
    return callChild(diff3Path, stdin, null, fileA, fileO, fileB);
  }
  export function diffM(fileA: string, fileO: string, fileB: string, stdin?: string): Promise<string> {
    return callChild(diff3Path, stdin, 1, "-m", fileA, fileO, fileB);
  }
}
