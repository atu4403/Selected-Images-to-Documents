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
  loadModule(plugin, 'js/selectedItems.js', 'selectedItems');
  loadModule(plugin, 'js/imageTable.js', 'imageTable');
  
  console.log('eagle.onPluginCreate');
  console.log(plugin);
  
  // HTMLコンテンツを追加
  document.querySelector('#message').innerHTML = `
  <ul>
    <li>id: ${plugin.manifest.id}</li>
    <li>version: ${plugin.manifest.version}</li>
    <li>name: ${plugin.manifest.name}</li>
    <li>logo: ${plugin.manifest.logo}</li>
    <li>path: ${plugin.path}</li>
  </ul>
  
  <div class="section">
    <button id="getClipboardBtn">クリップボードのテキストを取得</button>
    <div id="clipboardContent" class="content-box"></div>
  </div>
  
  <div class="section">
    <button id="showSelectedBtn">選択されたアイテム情報を表示</button>
    <div id="selectedItemsContainer" class="content-box"></div>
  </div>
  
  <div class="section">
    <button id="createImageTableBtn">選択した画像からテーブルを作成</button>
    <div id="imageTableContainer" class="content-box"></div>
  </div>
  `;
  
  // クリップボードボタンのイベントリスナー
  document.getElementById('getClipboardBtn').addEventListener('click', async () => {
    try {
      if (!modules.clipboard) {
        throw new Error('クリップボードモジュールが正しく読み込まれていません');
      }
      
      const text = await modules.clipboard.getClipboardText();
      document.getElementById('clipboardContent').textContent = 
        text || 'クリップボードにテキストがありません';
    } catch (error) {
      console.error('クリップボードからのテキスト取得に失敗:', error);
      document.getElementById('clipboardContent').textContent = 
        'エラーが発生しました: ' + error.message;
    }
  });
  
  // 選択アイテム表示ボタンのイベントリスナー
  document.getElementById('showSelectedBtn').addEventListener('click', async () => {
    try {
      if (!modules.selectedItems) {
        throw new Error('選択アイテムモジュールが正しく読み込まれていません');
      }
      
      const containerElement = document.getElementById('selectedItemsContainer');
      await modules.selectedItems.displaySelectedItems(containerElement);
    } catch (error) {
      console.error('選択アイテムの表示に失敗:', error);
      document.getElementById('selectedItemsContainer').innerHTML = 
        `<p>エラーが発生しました: ${error.message}</p>`;
    }
  });
  
  // 画像テーブル作成ボタンのイベントリスナー
  document.getElementById('createImageTableBtn').addEventListener('click', async () => {
    try {
      if (!modules.imageTable) {
        throw new Error('画像テーブルモジュールが正しく読み込まれていません');
      }
      
      const containerElement = document.getElementById('imageTableContainer');
      await modules.imageTable.createImageTable(containerElement, 3); // 3列のテーブルを作成
    } catch (error) {
      console.error('画像テーブルの作成に失敗:', error);
      document.getElementById('imageTableContainer').innerHTML = 
        `<p>エラーが発生しました: ${error.message}</p>`;
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
