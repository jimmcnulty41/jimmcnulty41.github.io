const sources = [
  "002_1.WAV",
  "002_2.WAV",
  "003_1.WAV",
  "003_2.WAV",
  "004_1.WAV",
  "004_2.WAV",
  "005_1.WAV",
  "006_1.WAV",
  "007_1.WAV",
  "007_2.WAV",
  "008_1.WAV",
  "008_2.WAV",
  "009_1.WAV",
  "009_2.WAV",
  "010_1.WAV",
  "010_2.WAV",
  "011_1.WAV",
  "012_1.WAV",
  "012_2.WAV",
  "013_1.WAV",
  "013_2.WAV",
  "014_1.WAV",
  "014_2.WAV",
  "015_1.WAV",
  "016_1.WAV",
  "017_1.WAV",
  "018_1.WAV",
  "018_2.WAV",
  "019_1.WAV",
  "019_2.WAV",
  "020_1.WAV",
  "021_1.WAV",
  "021_2.WAV",
  "022_1.WAV",
  "023_1.WAV",
  "023_2.WAV",
  "024_1.WAV",
  "024_2.WAV",
  "025_1.WAV",
  "025_2.WAV",
  "026_1.WAV",
  "026_2.WAV",
  "027_1.WAV",
  "027_2.WAV",
  "028_1.WAV",
  "029_1.WAV",
  "029_2.WAV",
  "030_1.WAV",
  "030_2.WAV",
  "031_1.WAV",
  "032_1.WAV",
  "032_2.WAV",
  "033_1.WAV",
  "034_1.WAV",
  "034_2.WAV",
  "035_1.WAV",
  "035_2.WAV",
  "036_1.WAV",
  "037_1.WAV",
  "038_1.WAV",
  "039_1.WAV",
  "040_1.WAV",
  "041_1.WAV",
  "042_1.WAV",
  "042_2.WAV",
  "043_1.WAV",
  "044_1.WAV",
  "045_1.WAV",
  "046_1.WAV",
  "047_1.WAV",
  "048_1.WAV",
  "049_1.WAV",
  "050_1.WAV",
  "051_1.WAV",
  "052_1.WAV",
  "052_2.WAV",
  "053_1.WAV",
  "053_2.WAV",
  "054_1.WAV",
  "055_1.WAV",
  "056_1.WAV",
  "056_2.WAV",
  "057_1.WAV",
  "058_1.WAV",
  "059_1.WAV",
  "060_1.WAV",
  "061_1.WAV",
  "062_1.WAV",
  "062_2.WAV",
  "063_1.WAV",
  "064_1.WAV",
  "065_1.WAV",
  "065_2.WAV",
  "066_1.WAV",
  "066_2.WAV",
  "067_1.WAV",
  "068_1.WAV",
  "069_1.WAV",
  "069_2.WAV",
  "070_1.WAV",
  "071_1.WAV",
  "072_1.WAV",
  "073_1.WAV",
  "073_2.WAV",
  "074_1.WAV",
  "075_1.WAV",
  "075_2.WAV",
  "076_1.WAV",
  "076_2.WAV",
  "077_1.WAV",
  "078_1.WAV",
  "079_1.WAV",
  "079_2.WAV",
  "080_1.WAV",
  "081_1.WAV",
  "082_1.WAV",
  "083_1.WAV",
  "084_1.WAV",
  "085_1.WAV",
  "086_1.WAV",
  "086_2.WAV",
  "087_1.WAV",
  "087_2.WAV",
  "088_1.WAV",
  "089_1.WAV",
  "090_1.WAV",
  "091_1.WAV",
  "092_1.WAV",
  "093_1.WAV",
  "094_1.WAV",
  "094_2.WAV",
  "095_1.WAV",
  "096_1.WAV",
  "096_2.WAV",
  "097_1.WAV",
  "098_1.WAV",
  "099_1.WAV",
  "099_2.WAV",
];

const activeSounds = {};

const parseSourceName = (n) => {
  const [name, _ext] = n.split(".");
  const [song, track] = name.split("_");
  return {
    song: Number.parseInt(song),
    track: Number.parseInt(track),
  };
};

const songs = [...Array(100)]
  .map((_x, i) => i)
  .reduce((m, e) => ({ ...m, [e]: null }), {});

// { [song:string] : { A: string, B?: string}}
sources.forEach((s) => {
  const { song, _track } = parseSourceName(s);
  const existing = songs[song];
  if (!existing) {
    songs[song] = {
      A: s,
    };
  } else {
    songs[song] = {
      ...songs[song],
      B: s,
    };
  }
});

const nextSongNumber = (songNumber) => {
  let nextNum = songNumber + 1;
  let existing = songs[nextNum];
  while (!existing) {
    nextNum++;
    if (nextNum > 99) {
      return 0;
    }
    existing = songs[nextNum];
  }
  return nextNum;
};

const nextNumberWithSkip = (num, skips) => {
  let todo = skips;
  let n = nextSongNumber(num);
  while (todo > 0) {
    todo--;
    n = nextSongNumber(n);
  }
  return n;
};

const prevSongNumber = (songNumber) => {
  let prevNum = songNumber - 1;
  let existing = songs[prevNum];
  while (!existing) {
    prevNum--;
    if (prevNum < 0) {
      return 99;
    }
    existing = songs[prevNum];
  }
  return prevNum;
};

const prevNumberWithSkip = (num, skips) => {
  let todo = skips;
  let n = prevSongNumber(num);
  while (todo > 0) {
    todo--;
    n = prevSongNumber(n);
  }
  return n;
};

let state = {
  songNumber: 41,
  A: false,
  B: false,
};

const killSound = () => {
  if (activeSounds.A) {
    activeSounds.A.stop();
    activeSounds.A = null;
  }
  if (activeSounds.B) {
    activeSounds.B.stop();
    activeSounds.B = null;
  }
};

const toggle = (state, button) => {};

let temp = 0;
function tempUpdate() {
  temp *= 0.95;
  requestAnimationFrame(tempUpdate);
}
function tempToSkips() {
  if (Math.abs(temp) > 3) {
    return 4;
  }
  if (Math.abs(temp) > 2) {
    return 2;
  }
  return 0;
}

requestAnimationFrame(tempUpdate);

window.onload = () => {
  document.querySelector("#volume-slider").addEventListener("input", (e) => {
    Howler.volume(e.target.value / 100);
  });

  const display = document.getElementById("songDisplay");

  function updateDisplay() {
    display.textContent = String(state.songNumber).padStart(2, "0");
    if (state.A) {
      aButton.classList.add("active");
      aLED.classList.add("active");
    } else {
      aButton.classList.remove("active");
      aLED.classList.remove("active");
    }

    const hasB = songs[state.songNumber].B;
    if (!hasB) {
      bButton.classList.add("disabled");
    } else {
      bButton.classList.remove("disabled");
    }
    if (state.B) {
      bButton.classList.add("active");
      bLED.classList.add("active");
    } else {
      bButton.classList.remove("active");
      bLED.classList.remove("active");
    }
  }

  document.getElementById("upBtn").addEventListener("click", () => {
    temp++;

    const next = nextNumberWithSkip(state.songNumber, tempToSkips());
    state = { A: false, B: false, songNumber: next };
    updateDisplay();
    killSound();
  });

  document.getElementById("downBtn").addEventListener("click", () => {
    temp--;
    const next = prevNumberWithSkip(state.songNumber, tempToSkips());
    state = { A: false, B: false, songNumber: next };
    updateDisplay();
    killSound();
  });

  const aButton = document.getElementById("btnA");
  const aLED = document.getElementById("ledA");

  aButton.addEventListener("click", () => {
    const next = !state.A;
    state = { ...state, A: next };
    aButton.classList.toggle("active");
    aLED.classList.toggle("active");

    if (next) {
      const sound = new Howl({ src: songs[state.songNumber].A, loop: true });
      sound.play();
      activeSounds.A = sound;
    } else {
      activeSounds.A.stop();
      activeSounds.A = null;
    }
  });

  const bButton = document.getElementById("btnB");
  const bLED = document.getElementById("ledB");

  bButton.addEventListener("click", () => {
    const next = !state.B;
    state = { ...state, B: next };
    bButton.classList.toggle("active");
    bLED.classList.toggle("active");

    if (next) {
      const sound = new Howl({ src: songs[state.songNumber].B, loop: true });
      if (activeSounds.A) {
        sound.seek(activeSounds.A.seek());
        sound.play();
      } else {
        sound.play();
      }
      activeSounds.B = sound;
    } else {
      activeSounds.B.stop();
      activeSounds.B = null;
    }
  });

  updateDisplay();
};
