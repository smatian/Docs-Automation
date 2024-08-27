import React, { useState, useEffect } from "react";

function Temp() {
  const [fileContent, setFileContent] = useState("");
  const [googleDriveFile, setGoogleDriveFile] = useState(null);
  const [typingSpeed, setTypingSpeed] = useState(30);
  const [mistakeRate, setMistakeRate] = useState(10);
  const [correctionSpeed, setCorrectionSpeed] = useState(30);
  const [breakTime, setBreakTime] = useState(10);
  const [breakInterval, setBreakInterval] = useState(100);
  const [eta, setEta] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    // Add event listeners for drag and drop
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
    };
    const handleLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
    };
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    };

    // Attach the events to the whole document
    document.addEventListener("dragover", handleDrag);
    document.addEventListener("dragleave", handleLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      // Clean up the event listeners
      document.removeEventListener("dragover", handleDrag);
      document.removeEventListener("dragleave", handleLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target.result);
    };
    reader.readAsText(file);
  };

  const calculateETA = (contentLength, typingSpeed, breakInterval, breakTime) => {
    const wordsPerMinute = typingSpeed;
    const totalWords = contentLength / 5;
    const typingTimeMinutes = totalWords / wordsPerMinute;
    const numberOfBreaks = Math.floor(totalWords / breakInterval);
    const totalBreakTime = numberOfBreaks * breakTime;
    const totalMinutes = typingTimeMinutes + totalBreakTime;
    setEta(`${Math.ceil(totalMinutes)} minutes`);
  };

  const handleStartTyping = () => {
    const contentToType = fileContent || googleDriveFile || "";
    if (contentToType) {
      calculateETA(contentToType.length, typingSpeed, breakInterval, breakTime);

      chrome.runtime.sendMessage({
        action: "startTyping",
        text: contentToType,
        typingSpeed,
        mistakeRate,
        correctionSpeed,
        breakTime,
        breakInterval,
      });
    } else {
      alert("Please upload a file or select a Google Drive document.");
    }
  };

  return (
    <div className="App">
      {dragging && <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontSize: '24px',
        zIndex: 1000,
      }}>Drop files anywhere to upload</div>}
      <h1>Google Docs Auto Typer</h1>
      <div
        id="drag-drop-area"
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center",
          marginTop: "20px",
          cursor: "pointer",
        }}
      >
        <p>Click or Drag & Drop a .txt or .docx file here</p>
        <input
          type="file"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          accept=".txt,.docx"
          style={{ display: 'none' }}
        />
      </div>
      {" "}
      <div>
        <label>Typing Speed (WPM): </label>
        <select
          value={typingSpeed}
          onChange={(e) => setTypingSpeed(parseInt(e.target.value, 10))}
        >
          {[...Array(31)].map((_, i) => (
            <option key={i + 30} value={i + 30}>
              {i + 30} WPM
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Mistake Rate (Words): </label>
        <input
          type="number"
          value={mistakeRate}
          onChange={(e) => setMistakeRate(parseInt(e.target.value, 10))}
        />
      </div>
      <div>
        <label>Correction Speed (WPM): </label>
        <select
          value={correctionSpeed}
          onChange={(e) => setCorrectionSpeed(parseInt(e.target.value, 10))}
        >
          {[...Array(31)].map((_, i) => (
            <option key={i + 30} value={i + 30}>
              {i + 30} WPM
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Break Time (Minutes): </label>
        <input
          type="number"
          value={breakTime}
          onChange={(e) => setBreakTime(parseInt(e.target.value, 10))}
        />
      </div>
      <div>
        <label>Break Interval (Words): </label>
        <input
          type="number"
          value={breakInterval}
          onChange={(e) => setBreakInterval(parseInt(e.target.value, 10))}
        />
      </div>
      <div>
        <label>ETA: {eta}</label>
      </div>
      <button id="startTypingButton" onClick={handleStartTyping}>
        Start Typing
      </button>
    </div>
  );
}

export default Temp;
