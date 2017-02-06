import * as childProcess from "child_process";
import * as path from "path";

import { sync as which } from "which";

function callChild(path, stdin, ...args): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if(!path) {
      return reject("")
    }
    let proc = childProcess.exec(`${path} ${args.join(" ")}`, (err, stdout, stderr) => {
      if(err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
    if(stdin) {
      proc.stdin.write(stdin)
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
  if(process.platform === "win32") {
    console.error("module node-diff3-wrapper requires gnu difftools to be on the path");
  }
}


class Diff3 {

  static diff(fileA: string, fileO: string, fileB:string, stdin?: string): Promise<string> {
    return callChild(diff3Path, stdin, fileA, fileO, fileB);
  }
  static diffM(fileA: string, fileO: string, fileB: string, stdin?: string): Promise<string> {
    return callChild(diff3Path, stdin, "-m", fileA, fileO, fileB);
  }
}

module.exports = Diff3;
