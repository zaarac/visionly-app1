import React, { useState, useRef } from "react";

const activities = ["Watching TV", "Playing Games", "Reading Books", "Outdoors"];
const feelings = ["Tired", "Sore", "Dry", "Fine"];

export default function VisionlyHome() {
  const [stars, setStars] = useState(0);
  const [logs, setLogs] = useState([]);
  const [theme, setTheme] = useState("underwater");
  const recognitionRef = useRef(null);
  const [recording, setRecording] = useState(false);

  const handleExercise = () => {
    alert("Starting exercise...");
    setStars((prev) => Math.min(prev + 1, 3));
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

    const activity = prompt("What were you doing when you saw double?");
    const feeling = prompt("How did your eyes feel?");

    alert("Now tell us more by speaking. Click OK and begin speaking.");
    const voiceNote = await startVoiceRecognition();

    const newLog = {
      time: timestamp,
      activity,
      feeling,
      voiceNote,
    };

    setLogs((prevLogs) => [...prevLogs, newLog]);
    alert("Thanks for telling us!");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "underwater" ? "space" : "underwater"));
  };

  return (
    <div
      className={\`min-h-screen p-4 flex flex-col items-center justify-center text-center transition-all duration-500 \${theme === "underwater" ? "bg-blue-200" : "bg-purple-900 text-white"}\`}
    >
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full"
      >
        Switch to {theme === "underwater" ? "Space" : "Underwater"} Theme
      </button>

      <h1 className="text-4xl font-bold mb-6">VISIONLY</h1>

      <div className="bg-white text-black p-4 rounded-2xl shadow-md w-72 mb-6">
        <h2 className="text-lg font-semibold mb-2">Stars Earned</h2>
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={\`text-3xl \${i < stars ? "text-yellow-400" : "text-gray-300"}\`}>
              {'\u2B50'}
            </span>
          ))}
        </div>
        <button
          onClick={handleExercise}
          className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-full mb-4"
        >
          START EXERCISE
        </button>
        <button
          onClick={handleDoubleVision}
          className="bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-full"
        >
          I SAW DOUBLE
        </button>
        {recording && <p className="text-sm mt-2 text-red-500">Listening...</p>}
      </div>

      <div className="bg-white text-black p-4 rounded-xl w-80 shadow-md">
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
      </div>
    </div>
  );
}
