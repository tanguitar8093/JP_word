import {
  PanelContainer,
  LabelGroup,
  RangeInput,
  SelectInput,
  ValueText,
} from "../styled/SettingsPanel";

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
    <PanelContainer>
      <LabelGroup>
        速度 (Rate):
        <RangeInput
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
        />
        <ValueText>{rate}</ValueText>
      </LabelGroup>

      <LabelGroup>
        音調 (Pitch):
        <RangeInput
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={pitch}
          onChange={(e) => setPitch(Number(e.target.value))}
        />
        <ValueText>{pitch}</ValueText>
      </LabelGroup>

      <LabelGroup>
        播報員 (Voice):
        <SelectInput
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
        </SelectInput>
      </LabelGroup>
    </PanelContainer>
  );
}
