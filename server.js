import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import ttsProcessor from './src/ttsProcessor.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // 允许前端跨域连接
});

app.use(cors());
app.use(express.json());

// --- 关键修改 1: 确保存储目录存在并静态化 ---
const storagePath = path.join(process.cwd(), 'storage');
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath);
}
// 将 /download 路由映射到 storage 物理目录
app.use('/download', express.static(storagePath));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // --- 关键修改 2: 监听 join 事件 ---
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their channel.`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.post('/api/tts', async (req, res) => {
  const { text, userId } = req.body;

  if (!text || !userId) {
    return res.status(400).json({ error: 'Missing text or userId' });
  }

  const jobId = `task_${Date.now()}`;

  // 1. 立即返回响应
  res.json({ jobId, status: 'processing' });

  // 2. 异步执行处理器逻辑 (IIFE 模式防止未捕获异常)
  (async () => {
    try {
      // 模拟生成过程
      const files = await ttsProcessor.generate(text, jobId);

      // 3. 任务完成后通过 WS 推送
      // 这里的路径要和 app.use('/download') 对应
      io.to(userId).emit('tts-finished', {
        jobId,
        mp3Url: `http://localhost:3000/download/${files.mp3File}`,
        srtUrl: `http://localhost:3000/download/${files.srtFile}`
      });
    } catch (err) {
      console.error('TTS Processing Error:', err);
      io.to(userId).emit('tts-failed', { jobId, error: err.message });
    }
  })();
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
