import tts from './ttsProcessor.js'// 引入你的组件

async function main() {
  try {
    // 调用 generate 方法
    const result = await tts.generate("Hello world", "test123");
    console.log("生成文件成功：", result);
  } catch (err) {
    console.error("生成失败：", err);
  }
}

main();