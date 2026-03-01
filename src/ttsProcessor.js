import fs from 'fs/promises';
import path from 'path';

class TTSProcessor {
  async generate(text, jobId) {
    // 模拟耗时操作 (例如 2 秒)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟数据
    const mp3Content = Buffer.from("mock-mp3-data");
    const srtContent = "1\n00:00:00,000 --> 00:00:02,000\n" + text;

    const storagePath = path.join(process.cwd(), 'storage');
    const mp3File = `${jobId}.mp3`;
    const srtFile = `${jobId}.srt`;

    // 存储文件到物理目录
    await fs.writeFile(path.join(storagePath, mp3File), mp3Content);
    await fs.writeFile(path.join(storagePath, srtFile), srtContent);

    return { mp3File, srtFile };
  }
}

export default new TTSProcessor();
