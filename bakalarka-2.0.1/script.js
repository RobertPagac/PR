document.addEventListener('DOMContentLoaded', async function () {
  
  const loginForm = document.getElementById('loginForm');

if (sessionStorage.getItem('redirectionPerformed')) {
  void(0);
} else {
  chrome.storage.local.get(['isLoggedIn','foundWebsite'], function(result) {
    if (result.isLoggedIn) {
      sessionStorage.setItem('redirectionPerformed', 'true');
          if (result.foundWebsite) {
              window.location.href = 'detail.html';    
          }
          else if(window.location.href == 'settings.html'){
            void(0);
          }
          else{
            window.location.href = 'nextPage.html';
          }
    }
});
}

  chrome.storage.local.get(['isLightMode'], function(result) {
    var changeMode = document.getElementsByClassName('mode');
    for (var i = 0; i < changeMode.length; i++) {
        if (result.isLightMode) {
          if(changeMode[i].tagName.toLowerCase() != 'a') {
            changeMode[i].style.color = 'black';
          }
            changeMode[i].style.backgroundColor = 'white';
            if (changeMode[i].tagName.toLowerCase() === 'input') {
              changeMode[i].style.color = 'black';
            }
            else{
                changeMode[i].style.borderColor = 'white';
                if (changeMode[i].tagName.toLowerCase() == 'a') {
                    changeMode[i].addEventListener('mouseenter', function () {
                        this.style.backgroundColor = '#dcdad9';
                    });
                    changeMode[i].addEventListener('mouseleave', function () {
                        this.style.backgroundColor = 'white';
                    });
                }
            }

          }
        }
        const modebtn = document.getElementById('modebutton');
        if(result.isLightMode){
          modebtn.childNodes[1].textContent = ' Dark mode';
        }
      });
  if(document.getElementById('loginForm')!=null){
loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await sendDataToPHP(username, password);

  if (response.status === 'success') {

  
      window.location.href = 'nextPage.html';
      chrome.storage.local.set({ isLoggedIn: true })
      chrome.storage.local.set({ username: username })
  } else {
      const errorMessageElement = document.getElementById('error_message');
      errorMessageElement.textContent = 'Error: ' + response.message;
  }
});
async function sendDataToPHP(username, password) {
  const url = 'http://localhost/db1/script.php'; //https://passrem.000webhostapp.com/script.php
  const data = new FormData();
  data.append('username', username);
  data.append('password', password);

  const response = await fetch(url, {
      method: 'POST',
      body: data
  });

  return await response.json();
}

}
if(document.getElementById('registerForm') != null){
  const registerForm = document.getElementById('registerForm');

  registerForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const secondpassword = document.getElementById('secondpassword').value;
      const key = await generateKey();
      const keyExport = await window.crypto.subtle.exportKey('raw', key); 
      const help = document.getElementById('help').value; 

      if (password !== secondpassword) {
          const errorMessageElement = document.getElementById('error_message');
          errorMessageElement.textContent = 'Passwords must match!';
          return;
      }

      const response = await sendDataToPHP(username, email, password, keyExport, help);

      if (response.status === 'success') {
          window.location.href = 'index.html';
      } else {
          const errorMessageElement = document.getElementById('error_message');
          errorMessageElement.textContent = response.message;
      }
  });
}

if(document.getElementById('forgotForm') != null){
  const registerForm = document.getElementById('forgotForm');

  registerForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const username = document.getElementById('username').value;

      const response = await findEmail(username);
      if (response.status === 'success') {
          window.location.href = 'index.html';
      } else {
          const errorMessageElement = document.getElementById('error_message');
          errorMessageElement.textContent = response.message;
      }
  });
}


async function sendDataToPHP(username, email, password, key, help) {
  const url = 'http://localhost/db1/register.php'; //https://passrem.000webhostapp.com/register.php
  const data = new FormData();
  data.append('username', username);
  data.append('email', email);
  data.append('password', password);
  data.append('key', new Uint8Array(key));
  data.append('help', help);

  const response = await fetch(url, {
      method: 'POST',
      body: data
  });

  return await response.json();
}

async function findEmail(username) {
  const url = 'http://localhost/db1/find_email.php'; //https://passrem.000webhostapp.com/find_email.php
  const data = new FormData();
  data.append('username', username);

  const response = await fetch(url, {
      method: 'POST',
      body: data
  });

  return await response.json();
}
if (document.getElementById('tableBody') != null) {
  chrome.storage.local.get(['username'], async function(result) {
    let notAll =true;
    let array = [];
    let count = 0;
    let numberOfexpired = 0;
    let totalNumer = 0;
    while (notAll){
        const response = await findUserData(result.username, count);
       if (response.status === 'success' && response.table_data.length > 0) {
            array.push(...response.table_data);
            count += 40;
            break;
        } else {
            notAll = false;
        }
    }
    if (true) {
      const tableData = array;
      const tableBody = document.getElementById('tableBody');
      for (const rowData of tableData) {
        totalNumer +=1;
        const row = document.createElement('tr');
        for (let key in rowData) {
          const cell = document.createElement('td');
          if (key === 'Expire_date') {
            const dateParts = rowData[key].split("-");
            const expireDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            const currentDate = new Date();

            if (expireDate < currentDate) {
                cell.textContent = dateParts[2] + "." + dateParts[1] + "." + dateParts[0];
                cell.style.color = "#ff4500";
                numberOfexpired+=1;
                console.log(numberOfexpired);
            } else {
                cell.textContent = dateParts[2] + "." + dateParts[1] + "." + dateParts[0];

            }
            }
            else if (key === 'iv') {
              continue;
            }
            else if (key === 'Password') {
            const passwordSpan = document.createElement('span');
            passwordSpan.id="ps";
            const userResult = await getKey(result.username);
            const userKey = userResult.key;
            const array = userKey.split(',').map(Number);
            const arraybuffer= Uint8Array.from(array).buffer;
            const newkey= await importKeyFromRaw(arraybuffer);
            
            const dataArray = rowData['iv'].split(',').map(Number); 
            const uint8Array = new Uint8Array(dataArray.slice(0, 12));
        
            const decrypted = await decryptPassword(base64ToArrayBuffer(rowData[key]), newkey, uint8Array);
            passwordSpan.textContent = '*'.repeat(decrypted.length);
            passwordSpan.style.textAlign = 'center';
            cell.appendChild(passwordSpan);
            
          } else {
            cell.textContent = rowData[key];
            if (cell.textContent.length > 25) {
              cell.classList.add('long-content');
            }
          }
          row.appendChild(cell);
          if(key === 'Password'){
            let cell = document.createElement('td');
            const togglePasswordImg = document.createElement('img');
            togglePasswordImg.id = "togglePasswordImg";
            togglePasswordImg.src = 'show.png';
            togglePasswordImg.alt = 'Toggle Password';
            togglePasswordImg.style.cursor = 'pointer';
            togglePasswordImg.style.width = '16px';
            togglePasswordImg.style.height = '16px';
            togglePasswordImg.style.float = 'right';
            togglePasswordImg.addEventListener('click', async function(event) {
              event.stopPropagation();
              const passwordSpan = event.target.closest('tr').querySelector('#ps');
              const userResult = await getKey(result.username);
              const userKey = userResult.key;
              const array = userKey.split(',').map(Number);
              const arraybuffer= Uint8Array.from(array).buffer;
              const newkey= await importKeyFromRaw(arraybuffer);
              
              const dataArray = rowData['iv'].split(',').map(Number); 
              const uint8Array = new Uint8Array(dataArray.slice(0, 12));
          
              const decrypted = await decryptPassword(base64ToArrayBuffer(rowData[key]), newkey, uint8Array);
              if (passwordSpan.textContent === decrypted) {
                passwordSpan.textContent = '*'.repeat(decrypted.length);
                togglePasswordImg.src = 'show.png';
              } else {
                passwordSpan.textContent = decrypted;
                togglePasswordImg.src = 'hide.png';
              }
            });
            cell.appendChild(togglePasswordImg);
            row.appendChild(cell);
          }
        }
        var optionsCell = document.createElement('td');
        optionsCell.style.textAlign = 'center';

        const optionsImg = document.createElement('img');
        optionsImg.src = 'settings.png';
        optionsImg.alt = 'Options';
        optionsImg.style.width = '16px';
        optionsImg.style.height = '16px';
        optionsImg.style.transition = 'transform 0.3s';
        optionsImg.style.cursor = 'pointer';
        optionsImg.addEventListener('mouseenter', function() {
            optionsImg.style.transform = 'rotate(90deg)';
        });
        optionsImg.addEventListener('mouseleave', function() {
            optionsImg.style.transform = 'rotate(0deg)';
        });
        optionsImg.addEventListener('click', function(event) {
          event.stopPropagation();
          const maskedPassword = '*'.repeat(row.cells[3].textContent.length);
          if(row.cells[3].textContent === maskedPassword){
            const currentRow = event.target.closest('tr');
            const togglePasswordImg = currentRow.querySelector('#togglePasswordImg');
            togglePasswordImg.click();
          }
          setTimeout(() => {
          const rowData = {
              'Website': row.cells[0].textContent,
              'Username': row.cells[1].textContent,
              'Email': row.cells[2].textContent,
              'Password': row.cells[3].textContent,
              'Expire_date': row.cells[5].textContent
          };
          const queryString = Object.keys(rowData).map(key => key + '=' + encodeURIComponent(rowData[key])).join('&');
          window.location.href = "edit.html?" + queryString;
          showDetails(rowData);
        }, 50); //1000
        });
      
        optionsCell.appendChild(optionsImg);
        row.appendChild(optionsCell);
        row.style.cursor = 'pointer';
        row.addEventListener('click', function() {
          const queryString = Object.keys(rowData).map(key => key + '=' + encodeURIComponent(rowData[key])).join('&');
          var url = row.cells[0].textContent;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            if (url) {
                window.open(url, '_blank');
            }
        });
        document.getElementById('tableBody').appendChild(row);
        
      };
    if(totalNumer == 0){
      var h3 = document.createElement("h3");
        h3.textContent = "It looks like you don't have any password saved or the database isn't loading correctly. Try adding one or check if you XAMPP is turned on.";
        var tbody = document.getElementById("tableBody");
        var newRow = document.createElement("tr");
        var newCell = document.createElement("td");
        newCell.colSpan = 7;
        newCell.appendChild(h3);
        newRow.appendChild(newCell);
        tbody.appendChild(newRow);
      }
    if(numberOfexpired>0){
      if(numberOfexpired==1){
          
      window.alert("You have " + numberOfexpired + " expired password!");
      }
    else{
      window.alert("You have " + numberOfexpired + " expired passwords!");
    }
    }
    }
  });
}


function showDetails(rowData) {

function getQueryStringParams() {
    const queryString = window.location.search.substring(1);
    const params = {};
    queryString.split('&').forEach(param => {
        const parts = param.split('=');
        const key = decodeURIComponent(parts[0]);
        const value = decodeURIComponent(parts[1]);
        params[key] = value;
    });
    return params;
}
const params = getQueryStringParams();

document.getElementById('website').value = params['Website'] || '';
document.getElementById('username').value = params['Username'] || '';
document.getElementById('email').value = params['Email'] || '';
document.getElementById('password').value = params['Password'] || '';

}


async function findUserData(username, offset) {
  let url = 'http://localhost/db1/userData.php'; //https://passrem.000webhostapp.com/userData.php
  let data = new FormData();
  data.append('username', username);
  data.append('offset', offset);
  let response = await fetch(url, {
      method: 'POST',
      body: data
  });
  return response.json();
  } 

  if(document.getElementById('backbutton')!=null){
    chrome.storage.local.set({ foundWebsite: false });
    const backbtn = document.getElementById('backbutton');
          if(document.getElementById('addForm')!=null || document.getElementById('detailForm')!=null || document.getElementById('editForm')!=null){
            backbtn.onclick = function () {
              window.location.href= 'nextPage.html';
          };
          }
          else{
          backbtn.onclick = function () {
              window.location.href= 'index.html';
          };
        }
        }

  if(document.getElementById('registrationLink')!=null){
  const registrationLink = document.getElementById('registrationLink');

  registrationLink.addEventListener('click', function () {
    window.location.href = 'register.html';
  });
}
if(document.getElementById('forgotLink')!=null){
  const registrationLink = document.getElementById('forgotLink');

  registrationLink.addEventListener('click', function () {
    window.location.href = 'forgot.html';
  });
}



});

if(document.getElementById('options')!=null){
  const optionsbtn = document.getElementById('options');
    
      optionsbtn.onclick = function () {          
        var dropdown = document.getElementById("myDropdown");
        dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
  };
}
if (document.getElementById('modebutton') != null) {
  const modebtn = document.getElementById('modebutton');

  modebtn.onclick = function () {
      chrome.storage.local.get(['isLightMode'], function(result) {
          var newvalue = !result.isLightMode;

          chrome.storage.local.set({ isLightMode: newvalue })

          var changeMode = document.getElementsByClassName('mode');
        for (var i = 0; i < changeMode.length; i++) {
            if (newvalue) {
                changeMode[i].style.backgroundColor = 'white';
                if (changeMode[i].tagName.toLowerCase() == 'tbody') {
                    for (var j = 0; j < changeMode[i].childNodes.length; j++) {
                        var row = changeMode[i].childNodes[j];
                        if (row.tagName && row.tagName.toLowerCase() == 'tr') {
                            row.addEventListener('mouseenter', function () {
                                this.style.backgroundColor = '#dcdad9';
                            });
                            row.addEventListener('mouseleave', function () {
                                this.style.backgroundColor = 'white';
                            });
                            for (var k = 0; k < row.childNodes.length; k++) {
                                var cell = row.childNodes[k];
                                if (cell.tagName && cell.tagName.toLowerCase() == 'td') {
                                    cell.style.backgroundColor = newvalue ? 'white' : '#333030';
                                    cell.style.color = newvalue ? 'black' : 'white';
                                }
                            }
                        }
                    }
              
                  
                  }
                  else{
                    changeMode[i].style.borderColor = 'white';
                      if (changeMode[i].tagName.toLowerCase() == 'a') {
                          changeMode[i].addEventListener('mouseenter', function () {
                              this.style.backgroundColor = '#dcdad9';
                          });
                          changeMode[i].addEventListener('mouseleave', function () {
                              this.style.backgroundColor = 'white';
                          });
                      }
                  }
              } else {
                changeMode[i].style.backgroundColor = '#333030';
                if (changeMode[i].tagName.toLowerCase() == 'input') {
                  changeMode[i].style.color = 'white';
                }
                if (changeMode[i].tagName.toLowerCase() == 'tbody') {
                  for (var j = 0; j < changeMode[i].childNodes.length; j++) {
                    var row = changeMode[i].childNodes[j];
                    if (row.tagName && row.tagName.toLowerCase() == 'tr') {
                      for (var k = 0; k < row.childNodes.length; k++) {
                        var cell = row.childNodes[k];
                        if (cell.tagName && cell.tagName.toLowerCase() == 'td') {
                          cell.style.backgroundColor = newvalue ? '#dcdad9' : '#333030';
                          cell.style.color = newvalue ? 'black' : 'white';
                        }
                      }
                    }
                  }
                }
                else{
                    changeMode[i].style.borderColor = '#333030';
                    if (changeMode[i].tagName.toLowerCase() == 'a') {
                        changeMode[i].addEventListener('mouseenter', function () {
                            this.style.backgroundColor = '#363434';
                        });
                        changeMode[i].addEventListener('mouseleave', function () {
                            this.style.backgroundColor = '#333030';
                        });
                    }
                }
              }
          }
          modebtn.childNodes[1].textContent = newvalue ? ' Dark mode' : ' Light mode';
      });
  };
}

window.onclick = function(event) {
  if (!event.target.matches('.options') && !event.target.matches('.option-image')) {
      var dropdown = document.getElementById("myDropdown");
      if(dropdown!=null){
      if (dropdown.style.display === 'block') {
          dropdown.style.display = 'none';
      }
    }
  
  }
}

if(document.getElementById('logoutbutton')!=null){
  const logoutbutton = document.getElementById('logoutbutton');

  logoutbutton.addEventListener('click', function () {
    window.location.href = 'index.html';
    chrome.storage.local.set({ isLoggedIn: false })
      chrome.storage.local.set({ username: "" })
  });
}



if(document.getElementById('addButton')!=null){
  const registrationLink = document.getElementById('addButton');

  registrationLink.addEventListener('click', function () {
    window.location.href = 'add_form.html';
  });
};

if(document.getElementById('addForm') != null){
  checkPasswordStrength("");
  const addForm = document.getElementById('addForm');
  document.getElementById('password').addEventListener('input', function() {
    var password = this.value;
    checkPasswordStrength(password);
});
  addForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      let user = "";

      chrome.storage.local.get(['username'], async function(result) {
          user = result.username;
          
      const url = document.getElementById('url').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const key = await getKey(user);
      const array = key.key.split(',').map(Number);
      const arraybuffer= Uint8Array.from(array).buffer;
      const newkey= await importKeyFromRaw(arraybuffer);
      const encrypted= await encryptPassword(password, newkey);
      let encPassword = arrayBufferToBase64(encrypted.encryptedData);
      let iv = encrypted.iv;
      const response = await addPassword(user, url, username, email, encPassword, iv);

      if (response.status === 'success') {
          window.location.href = 'nextPage.html';
      } else {
          const errorMessageElement = document.getElementById('error_message');
          errorMessageElement.textContent = response.message;
      }
  });
});
}
function arrayBufferToBase64(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  return btoa(binaryString);
}
function base64ToArrayBuffer(base64String) {
  const binaryString = atob(base64String);
  const length = binaryString.length;
  const uint8Array = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return uint8Array.buffer;
}

async function getKey(user) {
  const databaseurl = 'http://localhost/db1/getKey.php'; //https://passrem.000webhostapp.com/getKey.php
  const data = new FormData();
  data.append('user', user);

  const response = await fetch(databaseurl, {
      method: 'POST',
      body: data
  });

  return await response.json();
}

async function addPassword(user, url, username, email, password, iv) {
  const databaseurl = 'http://localhost/db1/add.php'; //https://passrem.000webhostapp.com/add.php
  const data = new FormData();
  data.append('user', user);
  data.append('url', url);
  data.append('username', username);
  data.append('email', email);
  data.append('password', password);
  data.append('iv', iv);

  const response = await fetch(databaseurl, {
      method: 'POST',
      body: data
  });

  return await response.json();
}

if(document.getElementById('delete') != null){
  const deleteButton = document.getElementById('delete');
  deleteButton.addEventListener('click', function () {
    const website = document.getElementById('website').value;
    let user = "";
    const isConfirmed = confirm("Are you sure you want to delete " + website + " password?");
    if (isConfirmed) {
      chrome.storage.local.get(['username'], async function(result) {
        user = result.username;
      const response = await deletePassword(user, website);
      if (response.status === 'success') {
        window.location.href = 'nextPage.html';
    } else {
        const errorMessageElement = document.getElementById('error_message');
        errorMessageElement.textContent = response.message;
    }
      });
  } else {
      void(0);
  }
  });
}

async function deletePassword(user, url) {
  const databaseurl = 'http://localhost/db1/delete.php'; //https://passrem.000webhostapp.com/delete.php
  const data = new FormData();
  data.append('user', user);
  data.append('url', url);

  const response = await fetch(databaseurl, {
      method: 'POST',
      body: data
  });

  return await response.json();
}


if(document.getElementById('detailForm') != null){
function getQueryStringParams() {
  const queryString = window.location.search.substring(1);
  const params = {};
  queryString.split('&').forEach(param => {
      const parts = param.split('=');
      const key = decodeURIComponent(parts[0]);
      const value = decodeURIComponent(parts[1]);
      params[key] = value;
  });
  return params;
}

const params = getQueryStringParams();
document.getElementById('username').value = params['Username'] || '';
document.getElementById('email').value = params['Email'] || '';
document.getElementById('password').value = params['Password'] || '';

chrome.storage.local.get(['isLoggedIn','username','foundWebsite', 'ws', 'un', 'em', 'ps', 'iv'], async function(result) {
  if (result.foundWebsite) {
    document.querySelector('h1').innerText = `${result.ws.length > 16 ? result.ws.substring(0, 16) + '...' : result.ws}` || '';
    document.getElementById('username').value = result.un || '';
    document.getElementById('email').value = result.em || '';
    const userResult = await getKey(result.username);
    const userKey = userResult.key;
    const array = userKey.split(',').map(Number);
    const arraybuffer= Uint8Array.from(array).buffer;
    const newkey= await importKeyFromRaw(arraybuffer);   
    const dataArray = result.iv.split(',').map(Number); 
    const uint8Array = new Uint8Array(dataArray.slice(0, 12));  
    const decrypted = await decryptPassword(base64ToArrayBuffer(result.ps), newkey, uint8Array);
    document.getElementById('password').value = decrypted || '';
  }
  });
}

if(document.getElementById('editForm') != null){
  function getQueryStringParams() {
    const queryString = window.location.search.substring(1);
    const params = {};
    queryString.split('&').forEach(param => {
        const parts = param.split('=');
        const key = decodeURIComponent(parts[0]);
        const value = decodeURIComponent(parts[1]);
        params[key] = value;
    });
    return params;
  }
  
  const params = getQueryStringParams();
  
  const website = params['Website']
  document.querySelector('h1').innerText = `${website.length > 16 ? website.substring(0, 16) + '...' : website}`;
  document.getElementById('website').value = params['Website'] || '';
  document.getElementById('username').value = params['Username'] || '';
  document.getElementById('email').value = params['Email'] || '';
  document.getElementById('password').value = params['Password'] || '';
  let expireDate= params['Expire_date'].split(".");
  document.getElementById('expire_date').value = expireDate[2]+"-"+expireDate[1]+"-"+expireDate[0];

  checkPasswordStrength(params['Password'] || "");
  document.getElementById('password').addEventListener('input', function() {
    var password = this.value;
    checkPasswordStrength(password);
});

  editForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    let user = "";

    chrome.storage.local.get(['username'], async function(result) {
        user = result.username;
        const urlParams = new URLSearchParams(window.location.search);
    const oldurl = urlParams.get('Website');
    const url = document.getElementById('website').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const userResult = await getKey(result.username);
    const userKey = userResult.key;
    const array = userKey.split(',').map(Number);
    const arraybuffer= Uint8Array.from(array).buffer;
    const newkey= await importKeyFromRaw(arraybuffer);
    
    const encrypted= await encryptPassword(document.getElementById('password').value, newkey);
      let encPassword = arrayBufferToBase64(encrypted.encryptedData);
      let iv = encrypted.iv;
    const expire_date = document.getElementById('expire_date').value;

    const response = await editPassword(user, oldurl, url, username, email, encPassword, expire_date, iv);

    if (response.status === 'success') {
        window.location.href = 'nextPage.html';
    } else {
        const errorMessageElement = document.getElementById('error_message');
        errorMessageElement.textContent = response.message;
    }
});
});
}
async function editPassword(user, oldurl, url, username, email, password, expire_date, iv) {
  const databaseurl = 'http://localhost/db1/edit.php'; //https://passrem.000webhostapp.com/edit.php
  const data = new FormData();
  data.append('user', user);
  data.append('oldurl', oldurl);
  data.append('url', url);
  data.append('username', username);
  data.append('email', email);
  data.append('password', password);
  data.append('expire_date', expire_date);
  data.append('iv', iv);

  const response = await fetch(databaseurl, {
      method: 'POST',
      body: data
  });

  return await response.json();
}

if(document.getElementById('togglePassword')!=null){
document.getElementById('togglePassword').addEventListener('click', function() {
  var passwordInput = document.getElementById('password');
  if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleImage.src = 'hidew.png';
  } else {
      passwordInput.type = 'password';
      toggleImage.src = 'showw.png';
  }
});
}

async function generateKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}

async function encryptPassword(message, key) {
  const encodedMessage = new TextEncoder().encode(message);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    encodedMessage
  );

  return {
    iv: iv,
    encryptedData: encryptedData
  };
}

async function decryptPassword(encryptedData, key, iv) {
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    encryptedData
  );

  return new TextDecoder().decode(decryptedData);
}


async function saveKey(user, key) {
  const databaseurl = 'http://localhost/db1/putKey.php'; //https://passrem.000webhostapp.com/putKey.php
  const data = new FormData();
  data.append('user', user);
  data.append('key', Array.from(new Uint8Array(key)).join(','));

  const response = await fetch(databaseurl, {
    method: 'POST',
    body: data
  });

  return await response.json();
}
async function importKeyFromRaw(rawKey) {


  const importedKey = await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );

  return importedKey;
}
function generatePassword(length = 12, includeLowercase = true, includeUppercase = true, includeNumbers = true, includeSpecial = true) {
  let charset = '';
  let password = '';

  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) charset += '0123456789';
  if (includeSpecial) charset += '!@#$%&?';

  function hasRequiredChars(pwd) {
    return (!includeLowercase || /[a-z]/.test(pwd)) &&
           (!includeUppercase || /[A-Z]/.test(pwd)) &&
           (!includeNumbers || /\d/.test(pwd)) &&
           (!includeSpecial || /[!@#$%&?]/.test(pwd));
  }

  do {
    password = '';
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      const randomIndex = randomValues[i] % charset.length;
      password += charset[randomIndex];
    }
  } while (!hasRequiredChars(password));

  checkPasswordStrength(password);
  return password;
}

if(document.getElementById('generateLink')!=null){
  const generateLink = document.getElementById('generateLink');

  generateLink.addEventListener('click', async function () {
    let user= "";
    chrome.storage.local.get(['username'], async function(result) {
        user=result.username;
    const settings = await findUserSettings(user);
    let settingsAdvanced = settings.table_data[0].settings.split('|');
    const includeLowercase = settingsAdvanced[2] === "t";
    const includeUppercase = settingsAdvanced[3] === "t";
    const includeNumbers = settingsAdvanced[4] === "t";
    const includeSpecial = settingsAdvanced[5] === "t";
    let length = settingsAdvanced[1];

    let randomPassword= generatePassword(length, includeLowercase, includeUppercase, includeNumbers, includeSpecial);

    document.getElementById('password').value = randomPassword;
  });
  });
}
document.addEventListener('click', function(event) {
  if (event.target.matches('#settingsbutton')) {
    chrome.tabs.create({ url: 'settings.html' });
  }
});

function checkPasswordStrength(password) {
  const strengthMeter = document.getElementById('password-strength');
  const strengthText = document.createElement('p');
  let strength = 0;

  if (password.length >= 8) {
      strength += 1;
  }

  if (/[A-Z]/.test(password)) {
      strength += 1;
  }

  if (/[a-z]/.test(password)) {
      strength += 1;
  }
  if (/\d/.test(password)) {
      strength += 1;
  }

  if (/[!@#$%^&*()_+{}\[\]:;<>,.?/~\\-]/.test(password)) {
      strength += 1;
  }

  switch (strength) {
      case 0:
      case 1:
      case 2:
          strengthText.textContent = "Weak";
          strengthText.style.color = "black";
          strengthMeter.style.backgroundColor="red";
          strengthMeter.style.marginRight="80%";
          break;
      case 3:
          strengthText.textContent = "Moderate";
          strengthText.style.color = "black";
          strengthMeter.style.backgroundColor="orange";
          strengthMeter.style.marginRight="54%";

          break;
      case 4:
          strengthText.textContent = "Strong";
          strengthText.style.color = "black";
          strengthMeter.style.backgroundColor="yellowgreen";
          strengthMeter.style.marginRight="28%";
          break;
      case 5:
          strengthText.textContent = "Very Strong";
          strengthText.style.color = "black";
          strengthMeter.style.backgroundColor="green";
          strengthMeter.style.marginRight="0%";
          break;
  }

  strengthMeter.style.transition = "margin-right 0.5s ease";
  strengthMeter.innerHTML = '';
  strengthText.style.marginLeft = "10px";
  strengthMeter.appendChild(strengthText);
  strengthMeter.style.borderRadius = "5px";
}

async function findUserSettings(username) {
  const url = 'http://localhost/db1/userSettings.php'; //https://passrem.000webhostapp.com/userSettings.php.php
  const data = new FormData();
  data.append('username', username);

  const response = await fetch(url, {
      method: 'POST',
      body: data
  });

  return await response.json();
}