import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
// 假设你已经有了这个工具
// import { saveToLocal } from '../utils/db';

const SOCKET_URL = 'http://localhost:3000';

export function useTTS(userId) {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    // 初始化 Socket
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    // --- 关键修改 3: 连接后立即加入房间 ---
    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('join', userId);
    });

    socket.on('tts-finished', async (data) => {
      const { jobId, mp3Url, srtUrl } = data;
      console.log('Task finished:', jobId);

      try {
        const [audioRes, srtRes] = await Promise.all([
          fetch(mp3Url),
          fetch(srtUrl)
        ]);

        const audioBlob = await audioRes.blob();
        const srtText = await srtRes.text();

        // 存储到本地 (IndexedDB)
        // await saveToLocal(jobId, audioBlob, srtText);
        console.log('Saved to local storage:', jobId);

        setTasks(prev => ({ ...prev, [jobId]: 'ready' }));
        setLoading(false);
      } catch (err) {
        console.error("File download or storage failed:", err);
      }
    });

    socket.on('tts-failed', (data) => {
      console.error("Task failed:", data.error);
      setTasks(prev => ({ ...prev, [data.jobId]: 'failed' }));
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const submitText = async (text) => {
    setLoading(true);
    try {
      const res = await fetch(`${SOCKET_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userId })
      });
      const { jobId } = await res.json();
      setTasks(prev => ({ ...prev, [jobId]: 'processing' }));
      return jobId;
    } catch (err) {
      console.error("Submission failed:", err);
      setLoading(false);
    }
  };

  return { submitText, tasks, loading };
}
