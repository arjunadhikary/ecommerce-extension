// Get the fetch button
const fetchButton = document.getElementById('get-data');
const productList = document.getElementById('product-list');
const errorElement = document.getElementById('product-error');
const loadingElement = document.getElementById('loading');

const aTag = document.getElementsByTagName('a');
for (let index = 0; index < aTag.length; index++) {
  const element = aTag[index];
  element.onclick = function () {
    chrome.tabs.create({ active: true, url: element.href });
  };
}

/**
 * Helper function to change the button state
 */
const changeButtonState = (data, status) => {
  if (true) {
  }
  fetchButton.textContent = data;
  fetchButton.disabled = status;
};

chrome.storage.session
  .get(['productList', 'originalProductPrice'])
  .then((result) => {
    console.log('Trying to get from storage');
    console.log(result);
    if (!result?.productList) {
      console.log('No Product in cache, fetching from server');
      return;
    }
    createList(result.productList, result.originalProductPrice);
  });

chrome.runtime.onMessage.addListener(function (
  request,
  _sender,
  _sendResponse
) {
  if (request.error) {
    errorElement.textContent = request.error;
    errorElement.style.fontSize = '17px';
    loadingElement.style.display = 'none';
    changeButtonState('Fetch', false);
  }
});
fetchButton.addEventListener('click', (_ev) => {
  //remove all li items
  productList.innerHTML = '';
  errorElement.textContent = '';
  changeButtonState('Fetching....', true);
  loadingElement.style.display = 'flex';
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0]?.id,
      {
        message: 'productName',
      },
      function (response) {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
          errorElement.textContent = chrome.runtime.lastError.message.includes(
            'end does not exist'
          )
            ? `move to Daraz's Product section or refresh the page`
            : chrome.runtime.lastError.message;
          changeButtonState('Fetch', false);
        }
      }
    );
  });
});

chrome.runtime.onMessage.addListener(async function (
  request,
  _sender,
  _sendResponse
) {
  if (request.to === 'popup') {
    console.log('Got Response From Background');

    createList(request.data, request.originalProduct.product_price);
  }
});

const covertToNumber = (string) => {
  const regex = /Rs\. /g;
  const match = string.replace(regex);
  console.log(match);
  return match;
};
const createList = (products, originalProductPrice) => {
  if (products.length === 0) {
    console.log('No Products');
    return;
  }
  chrome.storage.session.remove(['productList', 'originalProductPrice']);
  productList.innerHTML = '';

  // Loop through the products array
  for (const product of products) {
    if (!product) return;
    // Create a new list item for the product
    const productItem = document.createElement('li');
    productItem.setAttribute('href', product.productUrl);

    // Add the product image
    const productImage = document.createElement('img');
    productImage.classList.add('product-image');
    productImage.src = product.imageUrl;
    productItem.appendChild(productImage);
    // Add the product name
    const productName = document.createElement('div');
    productName.classList.add('product-name');
    productName.textContent = product.productName;
    productItem.appendChild(productName);

    // Add the product price
    const productPrice = document.createElement('div');
    productPrice.classList.add('product-price');
    productPrice.textContent = `Rs ${product.price}`;

    console.log(parseInt(product.price), originalProductPrice);
    parseInt(product.price) > originalProductPrice
      ? (productItem.style.color = '#d94e4e')
      : (productItem.style.color = 'green');

    productItem.appendChild(productPrice);

    // Add the product site
    const productSite = document.createElement('div');
    productSite.classList.add('product-site');
    productSite.textContent = product.site;
    productItem.appendChild(productSite);
    productList.appendChild(productItem);
    errorElement.textContent = '';
    const liTag = document.getElementsByTagName('li');
    for (let index = 0; index < liTag.length; index++) {
      const element = liTag[index];
      element.onclick = function () {
        chrome.tabs.create({
          active: true,
          url: element.getAttribute('href'),
        });
      };
    }
    loadingElement.style.display = 'none';

    changeButtonState('Fetch', false);
    chrome.storage.session.set({
      productList: products,
      originalProductPrice,
    });
  }
};
