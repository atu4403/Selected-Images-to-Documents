// imageTable.js
// 選択されたアイテムから画像テーブルを生成するモジュール

/**
 * Eagleのローカルサーバーから画像URLを生成
 * @param {Object} item - Eagleアイテムオブジェクト
 * @returns {string} 画像のURL
 */
function generateImageUrl(item) {
  if (!item || !item.id || !item.name || !item.ext) {
    return '';
  }

  // URLを構築: http://localhost:8593/[アイテムID].info/[ファイル名].[拡張子]
  return `http://localhost:8593/${item.id}.info/${item.name}.${item.ext}`;
}

/**
 * 選択されたアイテムから画像テーブルを生成
 * @param {HTMLElement} containerElement - 表示先の要素
 * @param {number} columns - 一行あたりの列数（デフォルト3）
 * @returns {Promise<void>}
 */
async function createImageTable(containerElement, columns = 3) {
  try {
    // 選択されたアイテムを取得
    const selectedItems = await eagle.item.getSelected();

    if (!selectedItems || selectedItems.length === 0) {
      containerElement.innerHTML = '<p>アイテムが選択されていません</p>';
      return;
    }

    // テーブル開始タグ
    let htmlContent = `
      <h3>選択された画像 (${selectedItems.length}件)</h3>
      <table style="width: 100%; table-layout: fixed; text-align: center;">
    `;

    // 行の開始
    for (let i = 0; i < selectedItems.length; i++) {
      // 新しい行の開始
      if (i % columns === 0) {
        htmlContent += '<tr>';
      }

      const item = selectedItems[i];
      const imageUrl = generateImageUrl(item);

      // 画像セル
      htmlContent += `
        <td>
          <img src="${imageUrl}" style="width: 100%; height: auto;" title="${item.name}.${item.ext}">
          <div style="margin-top: 5px; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${item.name}.${item.ext}
          </div>
        </td>
      `;

      // 行の終了
      if (i % columns === columns - 1 || i === selectedItems.length - 1) {
        // 足りないセルを埋める
        if (i === selectedItems.length - 1 && i % columns !== columns - 1) {
          const emptyCells = columns - (i % columns + 1);
          for (let j = 0; j < emptyCells; j++) {
            htmlContent += '<td></td>';
          }
        }
        htmlContent += '</tr>';
      }
    }

    // テーブル終了タグ
    htmlContent += '</table>';

    // テーブルHTMLの生成
    const htmlContent2 = generateHTML(selectedItems);

    // コンテナに表示
    containerElement.innerHTML = htmlContent + '<hr>' +
      '<h3>HTML出力</h3>' +
      '<textarea style="width: 100%; height: 200px; font-family: monospace;">' +
      htmlContent2 +
      '</textarea>' +
      '<button id="copyHtmlBtn" style="margin-top: 10px;">HTMLをクリップボードにコピー</button>';

    // HTMLコピーボタンのイベントリスナーを追加
    document.getElementById('copyHtmlBtn').addEventListener('click', async () => {
      try {
        const textArea = containerElement.querySelector('textarea');
        const clipboardModule = modules.clipboard;

        if (clipboardModule && clipboardModule.setClipboardText) {
          await clipboardModule.setClipboardText(textArea.value);
          alert('HTMLをクリップボードにコピーしました');
        } else {
          // clipboardモジュールが使えない場合は、標準のAPIを使用
          textArea.select();
          document.execCommand('copy');
          alert('HTMLをクリップボードにコピーしました');
        }
      } catch (error) {
        console.error('HTMLのコピーに失敗:', error);
        alert('HTMLのコピーに失敗しました: ' + error.message);
      }
    });

  } catch (error) {
    console.error('画像テーブルの生成に失敗:', error);
    containerElement.innerHTML = `<p>エラーが発生しました: ${error.message}</p>`;
  }
}

/**
 * コピー可能なHTML出力を生成
 * @param {Array} items - アイテムの配列
 * @returns {string} HTML文字列
 */
function generateHTML(items) {
  if (!items || items.length === 0) {
    return '';
  }

  let html = '<table style="width: 100%; table-layout: fixed; text-align: center;">\n';
  html += '<tr>\n';

  items.forEach((item, index) => {
    const imageUrl = generateImageUrl(item);
    html += `    <td><img src="${imageUrl}" style="width: 100%; height: auto;"></td>\n`;

    // 3つごとに行を閉じて新しい行を開始（最後の行を除く）
    if ((index + 1) % 3 === 0 && index < items.length - 1) {
      html += '</tr>\n<tr>\n';
    }
  });

  html += '</tr>\n</table>';
  return html;
}

module.exports = {
  createImageTable,
  generateImageUrl,
  generateHTML
};
