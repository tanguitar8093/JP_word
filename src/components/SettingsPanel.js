import React from "react";

export default function SettingsPanel({
  rate,
  setRate,
  pitch,
  setPitch,
  voices,
  selectedVoice,
  setSelectedVoice,
}) {
  return (
    <div
      style={{
        marginTop: 10,
        border: "1px solid #ccc",
        padding: 10,
        borderRadius: 5,
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <label>
          速度 (Rate):
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
          {rate}
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          音調 (Pitch):
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
          />
          {pitch}
        </label>
      </div>

      <div>
        <label>
          播報員 (Voice):
          <select
            value={selectedVoice?.name || ""}
            onChange={(e) => {
              const v = voices.find((voice) => voice.name === e.target.value);
              setSelectedVoice(v);
            }}
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
