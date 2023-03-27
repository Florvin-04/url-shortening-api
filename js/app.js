const hamburgerBtn = document.querySelector("[mobile-navigation-btn]");
const headerNav = document.querySelector("[header-navigation]");
const form = document.querySelector("[form-link]");
const inputLink = document.querySelector("[input-link]");

const invalidText = form.querySelector("p");

const linksParent = document.querySelector("[links-parent]");

hamburgerBtn.addEventListener("click", () => {
  headerNav.classList.toggle("active-mobile-nav");
  hamburgerBtn.classList.toggle("open-nav");
});

let urlStorage = JSON.parse(localStorage.getItem("urlstorage")) || [];

function submitForm(e) {
  e.preventDefault();
  let inputVal = inputLink.value;

  // const dup = urlStorage.some((item) => item.inputValue === `${inputVal}`);

  // if (inputVal.trim() == "" || dup) {
  //   return;
  // }

  if (validation(inputVal) || shortenLink(inputVal)) {
    return;
  }
  shortenLink(inputVal);

  inputLink.value = "";
}

function displayLink() {
  linksParent.innerHTML = "";

  urlStorage.forEach((url) => {
    renderShortenLink(url);
  });
}
displayLink();

let error;

function validation(inputVal) {
  const dup = urlStorage.some((item) => item.inputValue === `${inputVal}`);

  if (inputVal.trim() == "") {
    error = 1;
    invalidText.classList.add("invalid-text");
    // invalidText.textContent = "please add link...";
    inputLink.classList.add("invalid");
    setTimeout(() => {
      inputLink.classList.remove("invalid");
    }, 1000);
  } else {
    error = 0;
  }

  if (dup) {
    error = 1;
    invalidText.classList.add("invalid-text");
    invalidText.textContent = "please add different url...";
    inputLink.classList.add("invalid");
    setTimeout(() => {
      inputLink.classList.remove("invalid");
    }, 1000);
  } else {
    error = 0;
  }

  return error;
}

async function shortenLink(inputVal) {
  try {
    const res = await fetch(`https://api.shrtco.de/v2/shorten?url=${inputVal}`);
    const data = await res.json();
    const storageData = {
      newUrl: data.result.short_link,
      oldUrl: data.result.original_link,
      linkCode: data.result.code,
      inputValue: inputVal,
    };
    if (data.ok) {
      urlStorage.push(storageData);
      localStorage.setItem("urlstorage", JSON.stringify(urlStorage));
      invalidText.classList.remove("invalid-text");

      displayLink();
    }
  } catch (error) {
    invalidText.classList.add("invalid-text");
    invalidText.textContent = "please enter a valid url...";
    inputLink.classList.add("invalid");
    setTimeout(() => {
      inputLink.classList.remove("invalid");
    }, 1000);
  }

  //
  // const res = await fetch(`https://api.shrtco.de/v2/shorten?url=${inputVal}`);
  // const data = await res.json();
  // // console.log(data);
  // const storageData = {
  //   newUrl: data.result.short_link,
  //   oldUrl: data.result.original_link,
  //   linkCode: data.result.code,
  //   inputValue: inputVal,
  // };
  // if (data.ok) {
  //   urlStorage.push(storageData);
  //   localStorage.setItem("urlstorage", JSON.stringify(urlStorage));
  //   displayLink();
  // }
}

function renderShortenLink(url) {
  let documentFragment = new DocumentFragment();

  const linkItem = document.createElement("li");
  linkItem.className = "short__links--item";
  linkItem.setAttribute("link-item", "");
  linkItem.setAttribute("data-link-code", `${url.linkCode}`);

  const oldLink = document.createElement("p");
  oldLink.className = "old-link";
  oldLink.textContent = `${url.oldUrl}`; // rename

  const div = document.createElement("div");

  const newLink = document.createElement("p");
  newLink.className = "new-link";
  newLink.textContent = `${url.newUrl}`; // rename

  const copyLinkBtn = document.createElement("button");
  copyLinkBtn.className = "blue-btn copy-link";
  copyLinkBtn.textContent = "Copy";
  copyLinkBtn.setAttribute("data-copy-link-btn", "");

  div.appendChild(newLink);
  div.appendChild(copyLinkBtn);
  let newDiv = documentFragment.appendChild(div);

  linkItem.appendChild(oldLink);
  linkItem.appendChild(newDiv);

  documentFragment.appendChild(linkItem);

  linksParent.appendChild(documentFragment);

  // copyLinkBtn.addEventListener("click", () => {
  //   console.log(this);
  // });

  copyLink();
}

function copyLink() {
  const linkItem = linksParent.querySelectorAll("[link-item]");
  const copiedBtn = linksParent.querySelectorAll("[data-copy-link-btn]");

  linkItem.forEach((link) => {
    link.onclick = function (e) {
      const target = e.target;
      const btnCopy = target.matches("[data-copy-link-btn]");
      const getCode = this.dataset.linkCode;

      urlStorage.forEach((item) => {
        if (getCode == item.linkCode) {
          navigator.clipboard.writeText(item.newUrl);

          copiedBtn.forEach((button) => {
            button.dataset.copyLinkBtn = false;
            button.textContent = "copy";
          });

          if (btnCopy) {
            target.textContent = "copied!";
            target.dataset.copyLinkBtn = true;
          }
        }
        // console.log(urlStorage);
      });
    };
  });
}

form.addEventListener("submit", (e) => submitForm(e));
