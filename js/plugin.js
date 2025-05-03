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

eagle.onPluginCreate(async (plugin) => {
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
    <li>${plugin.manifest.name}</li>
    <li>path: ${plugin.path}</li>
  </ul>
  
  <div class="section">
    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
      <button id="getClipboardBtn">クリップボードのテキストを取得</button>
      <button id="generateMarkdownBtn">マークダウンを生成してコピー</button>
    </div>
  </div>
  <div class="section">
    <h3>AI画像ドキュメント生成</h3>
    <div>
      <label for="titleInput">タイトル:</label>
      <input type="text" id="titleInput" style="width: 100%; margin-bottom: 10px;">
    </div>
    <div>
      <label for="promptInput">プロンプト:</label>
      <textarea id="promptInput" style="width: 100%; height: 150px; margin-bottom: 10px;"></textarea>
    </div>
  </div>

  <div class="section">
    <button id="showSelectedBtn">選択されたアイテム情報を表示</button>
    <div id="selectedItemsContainer" class="content-box"></div>
  </div>
  <br>
  
  <div class="section">
    <button id="createImageTableBtn">選択した画像からテーブルを作成</button>
    <div id="imageTableContainer" class="content-box"></div>
  </div>
`;
  /**
   * HTML表とプロンプトからマークダウンを生成する
   * @param {string} title - タイトル
   * @param {string} html - 画像テーブルのHTML
   * @param {string} prompt - プロンプトテキスト
   * @returns {string} マークダウン形式のテキスト
   */
  function generateMarkdown(title, html, prompt) {
    let markdown = '';

    // タイトルの追加
    if (title) {
      markdown += `## ${title}\n\n`;
    }

    // HTMLテーブルの追加
    markdown += `${html}\n\n`;

    // プロンプトの追加
    if (prompt) {
      markdown += '```\n' + prompt + '\n```\n---\n';
    }

    return markdown;
  }
  // マークダウン生成ボタンのイベントリスナー
  document.getElementById('generateMarkdownBtn').addEventListener('click', async () => {
    try {
      // 必要なモジュールの確認
      if (!modules.clipboard || !modules.imageTable) {
        throw new Error('必要なモジュールが正しく読み込まれていません');
      }

      // 入力値の取得
      const title = document.getElementById('titleInput').value;
      const prompt = document.getElementById('promptInput').value;

      // 選択されたアイテムを取得
      const selectedItems = await eagle.item.getSelected();

      if (!selectedItems || selectedItems.length === 0) {
        alert('画像が選択されていません。Eagle で画像を選択してから試してください。');
        return;
      }

      // HTML生成（既存のgenerateHTML関数を使用）
      const html = modules.imageTable.generateHTML(selectedItems);

      // マークダウン生成
      const markdown = generateMarkdown(title, html, prompt);

      // クリップボードにコピー
      if (modules.clipboard.setClipboardText) {
        await modules.clipboard.setClipboardText(markdown);
        alert('マークダウンをクリップボードにコピーしました');
      } else {
        // clipboardモジュールが完全でない場合の対応
        // 一時的なテキストエリアを作成
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = markdown;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        alert('マークダウンをクリップボードにコピーしました');
      }
    } catch (error) {
      console.error('マークダウン生成に失敗:', error);
      alert('マークダウン生成に失敗しました: ' + error.message);
    }
  });

  // クリップボードボタンのイベントリスナー
  // クリップボードボタンのイベントリスナー
  document.getElementById('getClipboardBtn').addEventListener('click', async () => {
    try {
      if (!modules.clipboard) {
        throw new Error('クリップボードモジュールが正しく読み込まれていません');
      }

      const text = await modules.clipboard.getClipboardText();

      // クリップボードの内容をプロンプト入力欄に設定
      const promptInput = document.getElementById('promptInput');
      if (promptInput) {
        promptInput.value = text || '';
      }
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
