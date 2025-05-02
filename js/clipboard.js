// clipboard.js
// クリップボード機能を提供するモジュール

/**
 * クリップボードからテキストを取得する
 * @returns {Promise<string>} クリップボードのテキスト
 */
function getClipboardText() {
  return new Promise((resolve, reject) => {
    try {
      // Eagleの環境ではNode.jsのclipboardモジュールが使える可能性があります
      const { clipboard } = require('electron');
      const text = clipboard.readText();
      resolve(text);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * クリップボードから画像を取得する
 * @returns {Promise<Buffer|null>} 画像データ（Buffer形式）
 */
function getClipboardImage() {
  return new Promise((resolve, reject) => {
    try {
      const { clipboard } = require('electron');
      const image = clipboard.readImage();
      
      if (image.isEmpty()) {
        resolve(null);
      } else {
        // PNGフォーマットでBufferとして取得
        const pngData = image.toPNG();
        resolve(pngData);
      }
    } catch (error) {
      reject(error);
    }
  });
}

// モジュールのエクスポート（CommonJSスタイル）
module.exports = {
  getClipboardText,
  getClipboardImage
};
