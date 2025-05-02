// selectedItems.js
// 選択されたアイテムの情報を取得・表示するモジュール

/**
 * 選択されたアイテムから指定されたプロパティを取得して表示
 * @param {HTMLElement} containerElement - 表示先の要素
 * @returns {Promise<void>}
 */
async function displaySelectedItems(containerElement) {
  try {
    // 選択されたアイテムを取得
    const selectedItems = await eagle.item.getSelected();
    
    if (!selectedItems || selectedItems.length === 0) {
      containerElement.innerHTML = '<p>アイテムが選択されていません</p>';
      return;
    }
    
    // 選択されたアイテムの数を表示
    let htmlContent = `<h3>選択されたアイテム (${selectedItems.length}件)</h3>`;
    htmlContent += '<table><thead><tr><th>ID</th><th>ファイル名</th><th>拡張子</th></tr></thead><tbody>';
    
    // 各アイテムの情報を表に追加
    selectedItems.forEach(item => {
      htmlContent += `
        <tr>
          <td>${item.id || 'N/A'}</td>
          <td>${item.name || 'N/A'}</td>
          <td>${item.ext || 'N/A'}</td>
        </tr>
      `;
    });
    
    htmlContent += '</tbody></table>';
    
    // コンテナに表示
    containerElement.innerHTML = htmlContent;
  } catch (error) {
    console.error('選択されたアイテムの取得に失敗:', error);
    containerElement.innerHTML = `<p>エラーが発生しました: ${error.message}</p>`;
  }
}

/**
 * 選択されたアイテムの詳細情報を取得
 * @returns {Promise<Array>} 選択されたアイテムの配列
 */
async function getSelectedItemsInfo() {
  try {
    const selectedItems = await eagle.item.getSelected();
    return selectedItems || [];
  } catch (error) {
    console.error('選択されたアイテムの取得に失敗:', error);
    return [];
  }
}

module.exports = {
  displaySelectedItems,
  getSelectedItemsInfo
};
