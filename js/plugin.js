// plugin.js
// メインプラグインファイル
// モジュールを格納するグローバルオブジェクト
const modules = {};
/**
 * プラグインのパスを基準にモジュールを読み込む関数
 * @param {Object} plugin - プラグインオブジェクト
 * @param {string} relativePath - 読み込むモジュールの相対パス
 * @param {string} moduleName - モジュールを格納する名前
 * @returns {Object|null} - 読み込んだモジュール、またはエラー時はnull
 */
function loadModule(plugin, relativePath, moduleName) {
  const path = require('path');
  const fullPath = path.join(plugin.path, relativePath);
  try {
    const moduleObj = require(fullPath);
    console.log(`Module ${moduleName} loaded successfully from ${relativePath}`);
    // グローバルオブジェクトに格納
    modules[moduleName] = moduleObj;
    return moduleObj;
  } catch (error) {
    console.error(`Failed to load module ${moduleName} from ${relativePath}:`, error);
    modules[moduleName] = null;
    return null;
  }
}
eagle.onPluginCreate((plugin) => {
  console.log('Plugin path:', plugin.path);
  // 複数のモジュールを読み込む
  loadModule(plugin, 'js/clipboard.js', 'clipboard');
  // loadModule(plugin, 'js/imageProcessor.js', 'imageProcessor'); // 将来的に追加するかもしれないモジュール
  // loadModule(plugin, 'js/fileUtils.js', 'fileUtils'); // 将来的に追加するかもしれないモジュール
  console.log('eagle.onPluginCreate');
  console.log(plugin);
  document.querySelector('#message').innerHTML = `
  <ul>
    <li>id: ${plugin.manifest.id}</li>
    <li>version: ${plugin.manifest.version}</li>
    <li>name: ${plugin.manifest.name}</li>
    <li>logo: ${plugin.manifest.logo}</li>
    <li>path: ${plugin.path}</li>
  </ul>
  <button id="getClipboardBtn">クリップボードのテキストを取得</button>
  <div id="clipboardContent"></div>
  `;
  // ボタンにクリックイベントを追加
  document.getElementById('getClipboardBtn').addEventListener('click', async () => {
    try {
      // clipboardモジュールが存在するか確認
      if (!modules.clipboard) {
        throw new Error('クリップボードモジュールが正しく読み込まれていません');
      }
      // モジュールのメソッドを使用
      const text = await modules.clipboard.getClipboardText();
      document.getElementById('clipboardContent').textContent = 
        text || 'クリップボードにテキストがありません';
    } catch (error) {
      console.error('クリップボードからのテキスト取得に失敗:', error);
      document.getElementById('clipboardContent').textContent = 
        'エラーが発生しました: ' + error.message;
    }
  });
});
eagle.onPluginRun(() => {
  console.log('eagle.onPluginRun');
});
eagle.onPluginShow(() => {
  console.log('eagle.onPluginShow');
});
eagle.onPluginHide(() => {
  console.log('eagle.onPluginHide');
});
eagle.onPluginBeforeExit((event) => {
  console.log('eagle.onPluginBeforeExit');
});
