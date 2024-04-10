let showMore = false;

let savedResults = {
  totalEntries: 0,
  results: [],
};

function resetVariables() {
  removeSearchResults();
  showMore = false;
  savedResults = {
    totalEntries: 0,
    results: [],
  };

  document.getElementById("search-results").style.display = "none";
  document.getElementById("product-details").style.display = "none";
}

// Function to clear the result area and reset all the form fields
function clearButtonOnClick() {
  resetVariables();

  // extract the form fields
  const keywords = document.getElementById("keywords");
  const minimumPrice = document.getElementById("price-range-from");
  const maximumPrice = document.getElementById("price-range-to");
  const conditionNew = document.getElementById("new");
  const conditionUsed = document.getElementById("used");
  const conditionVeryGood = document.getElementById("very-good");
  const conditionGood = document.getElementById("good");
  const conditionAcceptable = document.getElementById("acceptable");
  const sellerReturnAccepted = document.getElementById("return-accepted");
  const shippingFree = document.getElementById("shipping-free");
  const shippingExpedited = document.getElementById("shipping-expedited");
  const sortBy = document.getElementById("sortby");

  // Reset Values
  keywords.value = "";
  minimumPrice.value = "";
  maximumPrice.value = "";
  conditionNew.checked = false;
  conditionUsed.checked = false;
  conditionVeryGood.checked = false;
  conditionGood.checked = false;
  conditionAcceptable.checked = false;
  sellerReturnAccepted.checked = false;
  shippingFree.checked = false;
  shippingExpedited.checked = false;
  sortBy.value = "BestMatch"; // default value
}

function formSubmit(event) {
  // Prevent auto form submission
  event.preventDefault();

  resetVariables();

  console.log(document.getElementById("price-range-from").value);

  // extract the form fields
  const keywords = document.getElementById("keywords").value;
  const minimumPrice = Number(document.getElementById("price-range-from").value);
  const maximumPrice = Number(document.getElementById("price-range-to").value);
  const conditionNew = document.getElementById("new").checked;
  const conditionUsed = document.getElementById("used").checked;
  const conditionVeryGood = document.getElementById("very-good").checked;
  const conditionGood = document.getElementById("good").checked;
  const conditionAcceptable = document.getElementById("acceptable").checked;
  const sellerReturnAccepted = document.getElementById("return-accepted").checked;
  const shippingFree = document.getElementById("shipping-free").checked;
  const shippingExpedited = document.getElementById("shipping-expedited").checked;
  const sortBy = document.getElementById("sortby").value;

  // VALIDATE FORM FIELDS

  // Keywords must exists
  // Validation automatically happens due to the "required" in the <input>
  // when the form is submitted and before this function runs.

  // Negative price range
  if (minimumPrice < 0.0 || maximumPrice < 0.0) {
    alert("Price Range values cannot be negative! Please try a value greater than or equal to 0.0");
    return;
  }

  // Invalid price range
  if (minimumPrice > maximumPrice) {
    alert("Oops! Lower price limit cannot be greater than upper price limit! Please try again.");
    return;
  }

  const minimumPrice2 = document.getElementById("price-range-from").value;
  const maximumPrice2 = document.getElementById("price-range-to").value;

  // Make AJAX Request
  const queryParams = [
    `keywords=${encodeURIComponent(keywords)}`,
    `minimumPrice=${encodeURIComponent(minimumPrice2)}`,
    `maximumPrice=${encodeURIComponent(maximumPrice2)}`,
    `conditionNew=${conditionNew}`,
    `conditionUsed=${conditionUsed}`,
    `conditionVeryGood=${conditionVeryGood}`,
    `conditionGood=${conditionGood}`,
    `conditionAcceptable=${conditionAcceptable}`,
    `sellerReturnAccepted=${sellerReturnAccepted}`,
    `shippingFree=${shippingFree}`,
    `shippingExpedited=${shippingExpedited}`,
    `sortBy=${encodeURIComponent(sortBy)}`,
  ];

  const queryString = queryParams.join("&");

  const xhr = new XMLHttpRequest();
  const url = `/search?${queryString}`;

  xhr.open("GET", url, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        json = JSON.parse(xhr.responseText);
        savedResults = json;
        processSearchResults(savedResults);
      } else {
        console.error("XHR Error:", xhr.status, xhr.statusText);
      }
    }
  };

  xhr.send();
}

function showProductDetails(itemOriginal, itemDetails) {
  let photo = itemOriginal.galleryURL;
  let ebayLink = "";
  const keys = [];
  const values = [];

  if (itemDetails?.Item) {
    const item = itemDetails.Item;

    ebayLink = item.ViewItemURLForNaturalSearch ?? "";

    // column 0
    keys.push("Title");
    keys.push("SubTitle");
    keys.push("Price");
    keys.push("Location");
    keys.push("Seller");
    keys.push("Return Policy (US)");

    // column 1
    values.push(item.Title ?? "");
    values.push(item.SubTitle ?? "");

    if (item.CurrentPrice) {
      values.push(`${item.CurrentPrice.Value} ${item.CurrentPrice.CurrencyID}`);
    }
    values.push("");
    values.push(item.Seller?.UserID ?? "");
    values.push("");

    const nameValues = item.ItemSpecifics?.NameValueList ?? [];

    // Values from keys and values will be column 0 and column 1
    for (let i = 0; i < nameValues.length; i++) {
      keys.push(nameValues[i].Name);
      values.push(nameValues[i].Value[0]);
    }
  }

  const ul = document.getElementById("product-details-table");
  // clear the table rows
  const imgLi = ul.querySelector("li:first-child");
  const linkLi = ul.querySelector("li:nth-child(2)");
  ul.innerHTML = "";
  ul.appendChild(imgLi);
  ul.appendChild(linkLi);

  // Update img in ul[0]
  const productImage = document.getElementById("product-details-img");
  productImage.src = photo;

  // set ebay link
  if (ebayLink) {
    const ebayLinkRow = document.getElementById("product-details-link-row");
    const ebayLinkRowValue = document.getElementById("product-details-ebay-link");

    ebayLinkRow.style.display = "flex";
    ebayLinkRowValue.href = ebayLink;
  } else {
    const ebayLinkRow = document.getElementById("product-details-link-row");
    ebayLinkRow.style.display = "none";
  }

  for (let i = 0; i < keys.length; i++) {
    if (values[i].length == 0) {
      continue;
    }
    const li = document.createElement("li");
    li.className = "product-details-table-row";
    const keyDiv = document.createElement("div");
    keyDiv.className = "product-details-key";
    keyDiv.textContent = keys[i];
    const valueDiv = document.createElement("div");
    valueDiv.className = "product-details-value";
    valueDiv.textContent = values[i];
    li.appendChild(keyDiv);
    li.appendChild(valueDiv);
    ul.appendChild(li);
  }

  // Show product-details-table
  document.getElementById("product-details-table").style.display = "block";
}

function processSearchResults(data) {
  const empty = document.getElementById("search-results-empty");
  const found = document.getElementById("search-results-found");
  const title = document.getElementById("found-title");
  const keywords = document.getElementById("keywords").value;
  const list = document.getElementById("found-results");
  const showMoreButton = document.getElementById("show-more");

  document.getElementById("search-results").style.display = "block";
  document.getElementById("product-details").style.display = "none";

  totalEntries = data.totalEntries;
  results = data.results;

  if (results.length === 0) {
    empty.style.display = "block";
    found.style.display = "none";
  } else {
    found.style.display = "block";
    empty.style.display = "none";
    title.innerHTML = `${totalEntries} Results found for <i>${keywords}</i>`;

    let howMany = 3;
    if (showMore) {
      howMany = 10;
      showMoreButton.innerHTML = "Show Less";
    } else {
      showMoreButton.innerHTML = "Show More";
    }

    for (let i = 0; i < results.length && i < howMany; i++) {
      const li = createSearchResultLi(results[i]);
      list.appendChild(li);
      li.addEventListener("click", function () {
        itemOnClick(results[i]);
      });
    }

    if (results.length > 3) {
      showMoreButton.style.display = "block";
    } else {
      showMoreButton.style.display = "none";
    }

    if (showMore) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth", // Smooth scrolling
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }
}

function removeSearchResults() {
  // Clear the results section
  // i.e., remove all the search results
  const resultsList = document.getElementById("found-results");
  resultsList.innerHTML = "";
}

function createSearchResultLi(result) {
  // Create an <li> element
  const listItem = document.createElement("li");
  listItem.classList.add("found-result");

  const imageElement = document.createElement("img");
  imageElement.classList.add("found-result-image");
  imageElement.src = result.galleryURL;
  listItem.appendChild(imageElement);

  const resultData = document.createElement("div");
  resultData.classList.add("found-result-data");

  const titleParagraph = document.createElement("p");
  titleParagraph.classList.add("found-result-title");
  titleParagraph.textContent = result.title;
  resultData.appendChild(titleParagraph);

  const categoryParagraph = document.createElement("p");
  categoryParagraph.classList.add("found-result-category");
  categoryParagraph.innerHTML = `Category: <i>${result.categoryName}</i>`;
  const categoryImage = document.createElement("img");
  categoryImage.addEventListener("click", function (event) {
    event.stopPropagation();
    window.open(result.viewItemURL, "_blank");
  });
  categoryImage.classList.add("found-result-redirect");
  categoryImage.src = "images/redirect.png";
  categoryParagraph.appendChild(categoryImage);
  resultData.appendChild(categoryParagraph);

  const conditionParagraph = document.createElement("p");
  conditionParagraph.classList.add("found-result-condition");
  conditionParagraph.textContent = `Condition: ${result.conditionDisplayName}`;

  // Create an <img> element for the top-rated icon (if topRatedListing is true)
  if (result.topRatedListing === "true") {
    const topRatedIcon = document.createElement("img");
    topRatedIcon.classList.add("found-result-toprated");
    topRatedIcon.src = "images/topRatedImage.png"; // Replace with the actual image URL
    conditionParagraph.appendChild(topRatedIcon); // Append the icon to the condition paragraph
  }

  resultData.appendChild(conditionParagraph);

  // Create a <p> element for the result price
  const sellingPrice = Number(result.convertedCurrentPrice);
  const shipingPrice = Number(result.shippingServiceCost);
  let priceString = "";
  if (shipingPrice >= 0.01)
    priceString = `Price: $${sellingPrice} (+ $${shipingPrice} for shipping)`;
  else priceString = `Price: $${sellingPrice}`;

  const priceParagraph = document.createElement("p");
  priceParagraph.classList.add("found-result-price");
  priceParagraph.textContent = priceString;
  resultData.appendChild(priceParagraph);

  // Append the result data <div> to the <li>
  listItem.appendChild(resultData);

  return listItem;
}

function showMoreLessOnClick() {
  showMore = !showMore;
  removeSearchResults();
  processSearchResults(savedResults);
}

function backToSearchResults() {
  // Hide product-details
  // Show search-results
  document.getElementById("product-details").style.display = "none";
  document.getElementById("search-results").style.display = "block";
}

function itemOnClick(itemOriginal) {
  // Hide search-results
  // Show product-details
  // Hide product-details-table

  document.getElementById("search-results").style.display = "none";
  document.getElementById("product-details").style.display = "block";
  document.getElementById("product-details-table").style.display = "none";

  // Make request to get product details
  const xhr = new XMLHttpRequest();
  const url = `/detailed/${itemOriginal.itemId}`;
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        json = JSON.parse(xhr.responseText);
        showProductDetails(itemOriginal, json);
      }
    }
  };

  xhr.send();
}

function main() {
  console.log("OKAY main Running !!");

  let keywordsInput = document.getElementById("keywords");

  keywordsInput.setAttribute("title", "incorrect value");

  document.getElementById("clearButton").addEventListener("click", clearButtonOnClick);
  document.getElementById("show-more").addEventListener("click", showMoreLessOnClick);
  document.getElementById("ebay-search-form").addEventListener("submit", formSubmit);
  document.getElementById("product-details-back").addEventListener("click", backToSearchResults);
}

document.addEventListener("DOMContentLoaded", main);
