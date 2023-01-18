chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const product_name = document.querySelector(
    '#module_product_title_1 > div > div > span'
  )?.textContent;
  const product_price = document.querySelector(
    '#module_product_price_1 > div > div > span'
  )?.textContent;
  if (message.message === 'productName') {
    console.log('Got Response' + product_name);
    chrome.runtime.sendMessage({
      data: {
        product_name,
        product_price: product_price.replace(/Rs\./g, '').replace(',', ''),
      },
      to: 'background',
    });
    sendResponse({ msg: 'Data Sent' });
  }
});
