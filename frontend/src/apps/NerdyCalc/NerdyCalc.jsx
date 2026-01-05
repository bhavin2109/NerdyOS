import React, { useState } from "react";

const NerdyCalc = () => {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");

  const handlePress = (val) => {
    if (val === "C") {
      setDisplay("0");
      setEquation("");
      return;
    }

    if (val === "=") {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(equation.replace(/x/g, "*"));
        setDisplay(String(result));
        setEquation(String(result));
      } catch {
        setDisplay("Error");
        setEquation("");
      }
      return;
    }

    if (val === "±") {
      setDisplay((prev) => String(parseFloat(prev) * -1));
      return;
    }

    if (val === "%") {
      setDisplay((prev) => String(parseFloat(prev) / 100));
      return;
    }

    const newEq = equation === "0" ? val : equation + val;
    setEquation(newEq);

    // If operator, don't update main display immediately or show partial?
    // mimic standard calc: display shows current number being typed
    if (["+", "-", "x", "/"].includes(val)) {
      // just show operator in equation logic, keep display as is or reset?
      // Simple implementation: show whole equation or just the last number
      // Let's keep it simple: Display shows what we are building
    }
    setDisplay(newEq);
  };

  const buttons = [
    ["C", "±", "%", "/"],
    ["7", "8", "9", "x"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4">
      <div className="flex-1 flex justify-end items-end text-5xl font-light pb-4 break-all">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            onClick={() => handlePress(btn)}
            className={`
              h-14 rounded-full text-xl font-medium transition active:scale-95
              ${btn === "0" ? "col-span-2 text-left pl-6" : ""}
              ${
                ["/", "x", "-", "+", "="].includes(btn)
                  ? "bg-orange-500 hover:bg-orange-400"
                  : ["C", "±", "%"].includes(btn)
                  ? "bg-gray-400 text-black hover:bg-gray-300"
                  : "bg-gray-700 hover:bg-gray-600"
              }
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NerdyCalc;
