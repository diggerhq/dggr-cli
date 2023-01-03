import { execSync } from "node:child_process";
import { lookpath } from "lookpath";

export const callTF = async (args: string, infraDirectory: string) => {
  const tfPath = (await lookpath("terraform")) ?? "terraform";

  execSync(`${tfPath} ${args}`, {
    stdio: [process.stdin, process.stdout, process.stderr],
    cwd: infraDirectory,
  });
};

export const tfOutput = async (infraDirectory: string) => {
  const tfPath = (await lookpath("terraform")) ?? "terraform";
  const outputs = execSync(`${tfPath} output -json`, {
    cwd: infraDirectory,
  });
  return JSON.parse(String(outputs));
};
