import React, { useState, useEffect } from "react";
import { db, ref, push, onValue } from "./firebase";

const SINGLE_MODE = "single";
const MULTI_MODE = "multi";
const TARGET_COUNT = 3; // 多目标模式的方块数量
const PENALTY_TIME = 200; // 误点惩罚时间 (ms)

const App: React.FC = () => {
  const [playerName, setPlayerName] = useState("");
  const [mode, setMode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targets, setTargets] = useState<{ id: number; x: number; y: number }[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ name: string; time: number }[]>([]);

  useEffect(() => {
    if (mode) {
      const scoresRef = ref(db, `scores/${mode}`);
      onValue(scoresRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const sortedScores = Object.values(data).sort((a: any, b: any) => a.time - b.time);
          setLeaderboard(sortedScores);
        }
      });
    }
  }, [mode]);

  const startGame = () => {
    if (!playerName) return alert("请输入名字！");
    if (!mode) return alert("请选择模式！");

    setIsPlaying(true);
    setReactionTime(null);

    // 随机延迟后显示目标
    const delay = Math.floor(Math.random() * 3000) + 1000;
    setTimeout(() => {
      setStartTime(performance.now());
      setTargets(
        Array.from({ length: mode === MULTI_MODE ? TARGET_COUNT : 1 }, (_, id) => ({
          id,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
        }))
      );
    }, delay);
  };

  const handleClick = (id: number) => {
    if (startTime !== null) {
      const endTime = performance.now();
      let time = endTime - startTime;

      const newTargets = targets.filter((target) => target.id !== id);
      setTargets(newTargets);

      if (newTargets.length === 0) {
        setReactionTime(time);
        push(ref(db, `scores/${mode}`), { name: playerName, time });
      }

      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const handleMissClick = () => {
    if (startTime !== null && mode === MULTI_MODE) {
      setReactionTime((prev) => (prev !== null ? prev + PENALTY_TIME : PENALTY_TIME));
    }
  };

  return (
    <div className="game-container" onClick={handleMissClick}>
      {!isPlaying ? (
        <div>
          <h1>反应测试</h1>
          <input
            type="text"
            placeholder="输入名字"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <h3>选择模式</h3>
          <button onClick={() => setMode(SINGLE_MODE)}>单目标模式</button>
          <button onClick={() => setMode(MULTI_MODE)}>多目标模式</button>
          <p>当前模式: {mode === SINGLE_MODE ? "单目标" : mode === MULTI_MODE ? "多目标" : "未选择"}</p>
          <button onClick={startGame} disabled={!mode}>
            开始游戏
          </button>
        </div>
      ) : (
        <>
          <p>{mode === MULTI_MODE ? "尽快点击所有目标！误点会有惩罚！" : "尽快点击目标！"}</p>
          {targets.map((target) => (
            <div
              key={target.id}
              className="reaction-box"
              style={{ left: `${target.x}%`, top: `${target.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick(target.id);
              }}
            ></div>
          ))}
          {reactionTime !== null && <p>最终反应时间: {reactionTime.toFixed(2)} ms</p>}
        </>
      )}

      <h2>{mode === SINGLE_MODE ? "单目标模式" : "多目标模式"} - 排行榜</h2>
      <ul>
        {leaderboard.map((entry, index) => (
          <li key={index}>
            {entry.name}: {entry.time.toFixed(2)} ms
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;