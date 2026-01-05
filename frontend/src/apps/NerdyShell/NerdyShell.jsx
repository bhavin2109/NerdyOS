import React, { useState, useEffect, useRef } from "react";
import fs from "../../services/fileSystem";
import useWindowStore from "../../store/windowStore";
import { getAppById } from "../../os/appRegistry";

const NerdyShell = () => {
  const [history, setHistory] = useState([
    { cmd: "init", output: "Welcome to NerdyOS Terminal v1.0.0" },
    { cmd: "info", output: "Type 'help' to see available commands." },
  ]);
  const [cwd, setCwd] = useState("/home"); // Default to /home
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const { openWindow } = useWindowStore();

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
    inputRef.current?.focus();
  }, [history]);

  const handleCommand = async (e) => {
    if (e.key === "Enter") {
      const command = input.trim();
      const newHistory = [
        ...history,
        { cmd: `${cwd} $ ${command}`, output: "" },
      ];

      if (!command) {
        setHistory(newHistory);
        setInput("");
        return;
      }

      const args = command.split(" ");
      const cmd = args[0];
      const params = args.slice(1);

      let output = "";

      try {
        switch (cmd) {
          case "help":
            output = `Available commands:
  ls           List directory contents
  cd <dir>     Change directory
  mkdir <dir>  Create a directory
  touch <file> Create a file
  rm <path>    Remove a file or directory
  pwd          Print working directory
  clear        Clear the terminal
  open <app>   Open an application (e.g., 'open calculator')
  edit <file>  Open file in editor
  cat <file>   Read file content
  echo <msg>   Print message
`;
            break;

          case "clear":
            setHistory([]);
            setInput("");
            return;

          case "pwd":
            output = cwd;
            break;

          case "ls": {
            const path = params[0] ? resolvePath(params[0]) : cwd;
            try {
              const files = await fs.ls(path);
              output =
                files.length === 0
                  ? "(empty)"
                  : files
                      .map((f) => {
                        return f.type === "directory"
                          ? `<span class="text-blue-400 font-bold">${f.name}/</span>`
                          : f.name;
                      })
                      .join("  ");
            } catch (err) {
              output = `ls: ${err.message}`;
            }
            break;
          }

          case "cd": {
            const target = params[0] || "/home";
            const path = resolvePath(target);
            try {
              const stat = await fs.stat(path);
              if (!stat) {
                output = `cd: ${target}: No such file or directory`;
              } else if (stat.type !== "directory") {
                output = `cd: ${target}: Not a directory`;
              } else {
                setCwd(path);
              }
            } catch (err) {
              output = `cd: ${err.message}`;
            }
            break;
          }

          case "mkdir": {
            if (!params[0]) {
              output = "mkdir: missing operand";
              break;
            }
            const path = resolvePath(params[0]);
            try {
              await fs.mkdir(path);
              output = "";
            } catch (err) {
              output = err.message;
            }
            break;
          }

          case "touch": {
            if (!params[0]) {
              output = "touch: missing operand";
              break;
            }
            const path = resolvePath(params[0]);
            try {
              await fs.writeFile(path, "");
              output = "";
            } catch (err) {
              output = err.message;
            }
            break;
          }

          case "rm": {
            if (!params[0]) {
              output = "rm: missing operand";
              break;
            }
            const path = resolvePath(params[0]);
            try {
              await fs.rm(path);
              output = "";
            } catch (err) {
              output = err.message;
            }
            break;
          }

          case "cat": {
            if (!params[0]) {
              output = "cat: missing operand";
              break;
            }
            const path = resolvePath(params[0]);
            try {
              const content = await fs.readFile(path);
              output = content;
            } catch (err) {
              output = err.message;
            }
            break;
          }

          case "open": {
            if (!params[0]) {
              output = "open: missing app name";
              break;
            }
            const appQuery = params[0].toLowerCase();

            // Import registry dynamically or use static list
            // We'll use the one we imported
            const registry = await import("../../os/appRegistry").then(
              (m) => m.APP_REGISTRY
            );

            const foundApp = Object.values(registry).find(
              (app) =>
                app.id === appQuery || app.name.toLowerCase().includes(appQuery)
            );

            if (foundApp) {
              openWindow(foundApp.id);
              output = `Opening ${foundApp.name}...`;
            } else {
              output = `open: application '${params[0]}' not found`;
            }
            break;
          }

          case "edit": {
            if (!params[0]) {
              output = "edit: missing filename";
              break;
            }
            const path = resolvePath(params[0]);
            // Open Word/Doc app with file path
            // For now, simple open
            openWindow("doc", { filePath: path });
            output = `Opening ${path} in Editor...`;
            break;
          }

          case "echo":
            output = params.join(" ");
            break;

          default:
            output = `nerdy-shell: command not found: ${cmd}`;
        }
      } catch (err) {
        output = `Error: ${err.message}`;
      }

      setHistory([...newHistory, { cmd: "", output }]);
      setInput("");
    }
  };

  const resolvePath = (target) => {
    if (target.startsWith("/")) return target;
    if (target === "..") {
      if (cwd === "/") return "/";
      return cwd.substring(0, cwd.lastIndexOf("/")) || "/";
    }
    if (target === ".") return cwd;
    const cleanCwd = cwd === "/" ? "" : cwd;
    return `${cleanCwd}/${target}`;
  };

  return (
    <div
      className="h-full w-full bg-[#1e1e1e] text-green-400 font-mono p-2 text-sm overflow-y-auto"
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((item, index) => (
        <div key={index} className="mb-1">
          {item.cmd && <div className="text-white font-bold">{item.cmd}</div>}
          {item.output && (
            <div
              className="whitespace-pre-wrap ml-2"
              dangerouslySetInnerHTML={{ __html: item.output }}
            />
          )}
        </div>
      ))}
      <div className="flex items-center">
        <span className="text-pink-500 mr-2">nerdy@os:{cwd}$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="bg-transparent outline-none flex-1 text-white"
          autoFocus
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default NerdyShell;
