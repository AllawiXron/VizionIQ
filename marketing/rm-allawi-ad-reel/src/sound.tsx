// The voice and every sound cue, exactly as the voice was fitted: a pop on every word and the cues on the moves and hits.
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { FPS } from "./lib";

// the sounds: a pop on every word (the dark key words get the smoother pops), and the cues on the moves and hits
export const NPOP: [string, number][] = [["npop1", 0.24], ["npop2", 0.17], ["npop3", 0.2], ["npop4", 0.18], ["npop5", 0.24]];
export const PPOP: [string, number][] = [["ppop1", 0.19], ["ppop2", 0.13], ["ppop3", 0.17], ["ppop4", 0.13]];
export const WORDS: [number, boolean][] = [
  [0, false], [0.56, false], [0.88, false], [1.38, false], [1.66, false], [2.1, true], [2.65, false], [2.91, true], [3.45, false], [3.73, false], [4.2, false], [4.73, false],
  [5.25, false], [5.63, false], [6.09, false], [6.67, false], [7.09, true], [8.37, false], [8.61, true], [9.63, false], [10.03, false], [11.45, false], [11.83, true],
  [12.67, false], [12.93, false], [13.35, false], [13.73, true], [14.47, false], [14.87, false], [15.09, false], [15.37, false], [15.79, true], [16.41, false], [16.69, true],
  [17.55, false], [17.89, false], [18.23, false], [18.55, true], [19.09, false], [19.65, false], [20.21, false], [20.43, false], [20.69, false], [21.13, false], [21.75, false],
  [22.17, false], [22.69, false], [22.77, false], [23.57, false], [23.93, false], [24.27, false], [24.63, false], [24.97, false], [25.35, false], [25.97, true], [26.67, false],
  [27.01, false], [27.21, true], [27.57, false], [27.97, false], [28.55, false], [28.93, false], [29.15, false], [29.65, false], [30.15, false], [30.85, false], [30.99, false],
  [31.63, false], [32.05, false], [32.51, false], [33.09, true], [33.51, false], [34.05, false], [34.61, false], [34.85, false], [35.53, false], [35.81, false], [36.09, true],
  [36.79, false], [36.99, true], [37.53, false], [38.05, false], [38.71, true], [39.07, false],
];
export const FX: [number, string, number][] = [
  [0.05, "airy", 0.18], [2.1, "softpop", 0.3], [2.38, "flick", 0.24], [2.25, "smooth", 0.24], [3.08, "mpop", 0.22], [4.2, "simple", 0.18],
  [4.85, "smooth", 0.24], [5.25, "whooshcon", 0.2], [6.06, "hit", 0.28], [6.5, "simple", 0.2], [7.39, "smooth", 0.24], [7.79, "select", 0.26],
  [9.19, "select", 0.26], [10.77, "select", 0.26], [11.83, "money", 0.24], [12.27, "smooth", 0.24], [12.66, "gear", 0.2], [13.17, "hit", 0.26],
  [14.07, "smooth", 0.24], [14.6, "airy", 0.2], [16.3, "simple", 0.2], [16.41, "cinclick", 0.28], [18.55, "cinclick", 0.32], [18.69, "smooth", 0.24],
  [19.1, "sweet", 0.2], [21.75, "whooshcon", 0.22], [23.17, "smooth", 0.24], [25.97, "money", 0.28], [26.45, "simple", 0.2], [28.15, "smooth", 0.24],
  [29.0, "data", 0.14], [33.0, "hit", 0.3], [33.95, "simple", 0.18], [34.37, "clickb", 0.34], [35.13, "smooth", 0.24], [35.2, "simple", 0.18],
  [36.6, "softpop", 0.2], [36.74, "softpop", 0.18], [36.88, "softpop", 0.18], [39.55, "sweet", 0.28],
];


export const Sound: React.FC = () => {
  let ni = 0, pi = 0;
  return (
    <>
      <Audio src={staticFile("voice.wav")} />
      {WORDS.map(([wt, key], i) => {
        const [n, v] = key ? PPOP[pi++ % 4] : NPOP[ni++ % 5];
        return <Sequence key={"w" + i} from={Math.round((wt + 0.02) * FPS)} layout="none"><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>;
      })}
      {FX.map(([ft, n, v], i) => <Sequence key={"f" + i} from={Math.round(ft * FPS)} layout="none"><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
    </>
  );
};
