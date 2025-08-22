import React, { useState } from 'react';
import SettingsPanel from '../../components/common/SettingsPanel/index.js';

function SystemSettingsPage() {
  const [rate, setRate] = useState(1.0);
  const [playbackOptions, setPlaybackOptions] = useState({
    jp: true,
    ch: true,
    jpEx: false,
    chEx: false,
    autoNext: true,
  });

  return (
    <div>
      <h1>系統設定</h1>
      <SettingsPanel
        rate={rate}
        setRate={setRate}
        playbackOptions={playbackOptions}
        setPlaybackOptions={setPlaybackOptions}
      />
    </div>
  );
}

export default SystemSettingsPage;
