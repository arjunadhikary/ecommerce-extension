chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.to === 'background') {
    fetch(
      `https://puzzled-erin-petticoat.cyclic.app/search?q=${message.data.product_name}`
    )
      .then((response) => response.json())
      .then((data) => {
        // Display the response in the response element
        if (data?.length === 0) {
          chrome.runtime.sendMessage({ error: 'Error Fetching' });
        }
        chrome.storage.session.set({
          productList: data.length !== 0 ? data : [],
        });
        chrome.runtime.sendMessage({
          to: 'popup',
          data,
          originalProduct: message.data,
        });
        return true;
      })
      .catch((error) => {
        // Display the error in the response element
        console.log(error);
        chrome.runtime.sendMessage({ error: error.message });
      });
  }
});
