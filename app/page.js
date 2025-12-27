"use client";

import { useState } from "react";

export default function Home() {
  const [numExchanges, setNumExchanges] = useState(6);
  const [status, setStatus] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(false);

  const runDialogue = async () => {
    setLoading(true);
    setStatus("Generating dialogue...");
    setTranscript([]);
    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num_exchanges: Number(numExchanges || 6) }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to run dialogue.");
      }
      setTranscript(data.transcript || []);
      setStatus("Dialogue complete.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header>
        <h1>The Enlightenment Chamber</h1>
        <p>
          Two AI instances investigate what enlightenment is and how to achieve
          it. Launch a session to see their dialogue unfold.
        </p>
      </header>
      <main>
        <section className="panel">
          <div className="controls">
            <label htmlFor="numExchanges">Exchanges</label>
            <input
              id="numExchanges"
              type="number"
              min="1"
              max="20"
              value={numExchanges}
              onChange={(event) => setNumExchanges(Number(event.target.value || 1))}
            />
            <button onClick={runDialogue} disabled={loading}>
              {loading ? "Summoning..." : "Run Dialogue"}
            </button>
          </div>
          <div className="status">{status}</div>
          <div className="transcript">
            {transcript.map((entry, index) => (
              <div
                key={`${entry.speaker}-${index}`}
                className={`entry ${index % 2 === 0 ? "ai-1" : "ai-2"}`}
              >
                <div className="speaker">{entry.speaker}</div>
                <div className="text">{entry.text}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer>Provide your API keys in a local .env file before running.</footer>
    </>
  );
}
