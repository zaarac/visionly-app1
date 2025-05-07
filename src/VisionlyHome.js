import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";

const activities = ["Watching TV", "Playing Games", "Reading Books", "Outdoors"];
const feelings = ["Tired", "Sore", "Dry", "Fine"];

export default function VisionlyHome() {
  const [theme, setTheme] = useState("underwater");
  const [logs, setLogs] = useState([]);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [showExercise, setShowExercise] = useState(false);
  const [dotPos, setDotPos] = useState({ top: "40%", left: "40%" });

  const handleExercise = () => {
    setShowExercise(true);
    const interval = setInterval(() => {
      setDotPos({
        top: Math.floor(Math.random() * 80) + "%",
        left: Math.floor(Math.random() * 80) + "%",
      });
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      setShowExercise(false);
    }, 30000);
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition.");
      return Promise.resolve("");
    }

    return new Promise((resolve) => {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setRecording(true);
      recognition.onend = () => setRecording(false);
      recognition.onerror = () => {
        setRecording(false);
        resolve("");
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.start();
      recognitionRef.current = recognition;
    });
  };

  const handleDoubleVision = async () => {
    const timestamp = new Date().toLocaleString();

    const activity = await new Promise((resolve) => {
      const choice = window.prompt("What were you doing?\n" + activities.join(" / "));
      resolve(choice);
    });

    const feeling = await new Promise((resolve) => {
      const choice = window.prompt("How did your eyes feel?\n" + feelings.join(" / "));
      resolve(choice);
    });

    const voiceNote = await startVoiceRecognition();
    const newLog = { time: timestamp, activity, feeling, voiceNote };
    setLogs((prevLogs) => [...prevLogs, newLog]);
    alert("Thanks for telling us!");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Visionly Double Vision Report", 10, 10);
    logs.forEach((log, i) => {
      const y = 20 + i * 20;
      doc.text(`Time: ${log.time}`, 10, y);
      doc.text(`Activity: ${log.activity}`, 10, y + 6);
      doc.text(`Feeling: ${log.feeling}`, 10, y + 12);
      if (log.voiceNote) doc.text(`Note: ${log.voiceNote}`, 10, y + 18);
    });
    doc.save("visionly-report.pdf");
  };

  const exportCSV = () => {
    const header = "Time,Activity,Feeling,Note\n";
    const rows = logs.map(log =>
      [log.time, log.activity, log.feeling, log.voiceNote || ""].join(",")
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visionly-report.csv";
    a.click();
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "underwater" ? "space" : "underwater"));
  };

  return (
    <div
      className={`min-h-screen p-4 transition-all duration-500 ${
        theme === "underwater"
          ? "bg-blue-100"
          : "bg-gradient-to-b from-gray-900 to-black text-white"
      }`}
      style={{
        backgroundImage: theme === "underwater"
          ? "url('https://i.imgur.com/zz8Ffmc.jpg')"
          : "url('https://i.imgur.com/nONhh1R.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full"
      >
        Switch to {theme === "underwater" ? "Space" : "Underwater"} Theme
      </button>

      <h1 className="text-4xl font-bold text-center mb-6">VISIONLY</h1>

      {showExercise ? (
        <div className="relative h-64 w-full border-2 border-dashed border-white rounded-xl overflow-hidden mb-6">
          <div
            className="absolute w-10 h-10 bg-red-500 rounded-full"
            style={{ top: dotPos.top, left: dotPos.left }}
          ></div>
          <p className="text-center mt-72 font-semibold">Follow the red dot for 30 seconds!</p>
        </div>
      ) : (
        <div className="bg-white text-black p-4 rounded-2xl shadow-md w-72 mx-auto mb-6">
          <button
            onClick={handleExercise}
            className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-full mb-4 w-full"
          >
            START EXERCISE
          </button>
          <button
            onClick={handleDoubleVision}
            className="bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-full w-full"
          >
            I SAW DOUBLE
          </button>
          {recording && <p className="text-sm mt-2 text-red-500">Listening...</p>}
        </div>
      )}

      <div className="bg-white text-black p-4 rounded-xl w-full max-w-lg mx-auto shadow-md mb-6">
        <h2 className="text-md font-bold mb-3">Double Vision Journal</h2>
        {logs.length === 0 && <p className="text-sm">No entries yet.</p>}
        <ul className="text-left max-h-64 overflow-y-auto space-y-3">
          {logs.map((log, index) => (
            <li key={index} className="bg-gray-100 p-3 rounded-lg">
              <p className="text-xs text-gray-600">{log.time}</p>
              <p className="text-sm font-semibold">Activity: {log.activity}</p>
              <p className="text-sm">Feeling: {log.feeling}</p>
              {log.voiceNote && <p className="text-sm italic">Note: {log.voiceNote}</p>}
            </li>
          ))}
        </ul>
        {logs.length > 0 && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={exportPDF}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Download PDF
            </button>
            <button
              onClick={exportCSV}
              className="bg-gray-600 text-white px-3 py-1 rounded"
            >
              Download CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
