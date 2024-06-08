import { useState, useRef, useEffect } from "react";

const App = () => {
  const [selectedButtons, setSelectedButtons] = useState(new Array(96).fill(0));
  const [isDragging, setIsDragging] = useState(false);
  const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 });
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Shift") {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (event) => {
        const { clientX, clientY } = event;
        const containerRect = containerRef.current.getBoundingClientRect();
        const x1 = Math.min(mouseStart.x, clientX - containerRect.left);
        const y1 = Math.min(mouseStart.y, clientY - containerRect.top);
        const x2 = Math.max(mouseStart.x, clientX - containerRect.left);
        const y2 = Math.max(mouseStart.y, clientY - containerRect.top);

        setSelectionBox({
          left: x1,
          top: y1,
          width: x2 - x1,
          height: y2 - y1,
        });

        setSelectedButtons((prevSelectedButtons) =>
          prevSelectedButtons.map((selected, index) => {
            const button = buttonRefs.current[index];
            if (!button) return selected;
            const bounds = button.getBoundingClientRect();
            const inBounds =
              bounds.left >= containerRect.left + x1 &&
              bounds.right <= containerRect.left + x2 &&
              bounds.top >= containerRect.top + y1 &&
              bounds.bottom <= containerRect.top + y2;

            return inBounds ? (isShiftPressed ? 0 : 1) : selected;
          })
        );
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        setSelectionBox(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, mouseStart, isShiftPressed]);

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;
    const containerRect = containerRef.current.getBoundingClientRect();
    setMouseStart({
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
    });
    setIsDragging(true);
  };

  const handleButtonClick = (index) => {
    setSelectedButtons((prevSelectedButtons) =>
      prevSelectedButtons.map((selected, idx) =>
        idx === index ? (selected ? 0 : 1) : selected
      )
    );
  };

  const numbers = Array.from({ length: 32 }, (_, index) => (
    <div key={index + 1} className="font-bold text-xl">
      {index + 1}
    </div>
  ));

  return (
    <div className="bg-black/80 h-screen flex justify-center items-center">
      <div className="text-[#DADDE0] " onMouseDown={handleMouseDown}>
        <div className="flex justify-center px-3 text-3xl font-bold ">
          Select Tip
        </div>
        <div className="flex items-center gap-3 py-5">
          <div className="flex flex-col gap-2">
            <div className="font-bold text-xl mt-4">A</div>
            <div className="font-bold text-xl mt-4">B</div>
            <div className="font-bold text-xl mt-4">C</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-[10.2px] w-[950px] pl-2.5">{numbers}</div>
            <div
              className="flex bg-gray-700 p-2 gap-4 rounded-xl relative"
              ref={containerRef}
            >
              <div className="flex flex-wrap gap-[10px] justify-center w-[950px]">
                {selectedButtons.map((selected, index) => (
                  <button
                    key={index}
                    ref={(el) => (buttonRefs.current[index] = el)}
                    className={`inline-block px-2.5 py-2.5 my-3 rounded-full ${
                      selected
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                    onClick={() => handleButtonClick(index)}
                  ></button>
                ))}
                {selectionBox && (
                  <div
                    className="absolute bg-black/40 border-2 border-dotted opacity-50"
                    style={{
                      left: `${selectionBox.left}px`,
                      top: `${selectionBox.top}px`,
                      width: `${selectionBox.width}px`,
                      height: `${selectionBox.height}px`,
                    }}
                  ></div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-start items-center gap-2">
          <button
            className="bg-[#804BD8] w-28"
            onClick={() => {
              setSelectedButtons(new Array(96).fill(1));
            }}
          >
            Select All
          </button>
          <button
            className="bg-[#804BD8] w-28"
            onClick={() => {
              setSelectedButtons(new Array(96).fill(0));
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
