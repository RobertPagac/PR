document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('importButton').addEventListener('click', importCSV);

    const togglePasswordBtn = document.getElementById('toggle-password');
    const togglePasswordBtn2 = document.getElementById('toggle-password2');
    const togglePasswordBtn3 = document.getElementById('toggle-password3');
    const passwordInput = document.getElementById('oldPassword');
    const passwordInput2 = document.getElementById('newPassword');
    const passwordInput3 = document.getElementById('newPassword2');
    const modeCheckbox = document.getElementById("changeMode");
    togglePasswordBtn.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordBtn.textContent = 'Hide Password';
        } else {
            passwordInput.type = 'password';
            togglePasswordBtn.textContent = 'Show Password';
        }
    });
    togglePasswordBtn2.addEventListener('click', function() {
        if (passwordInput2.type === 'password') {
            passwordInput2.type = 'text';
            togglePasswordBtn2.textContent = 'Hide Password';
        } else {
            passwordInput2.type = 'password';
            togglePasswordBtn2.textContent = 'Show Password';
        }
    });
    togglePasswordBtn3.addEventListener('click', function() {
        if (passwordInput3.type === 'password') {
            passwordInput3.type = 'text';
            togglePasswordBtn3.textContent = 'Hide Password';
        } else {
            passwordInput3.type = 'password';
            togglePasswordBtn3.textContent = 'Show Password';
        }
    });
    modeCheckbox.addEventListener('click', function() {
        if(modeCheckbox.checked==true){
            chrome.storage.local.set({ isLightMode: false })
            document.getElementById("body").style.backgroundColor="#333030";
            document.getElementById("body").style.color="white";
            document.getElementById("passLength").style.borderColor="#ff4500";
            document.getElementById("passLength").style.backgroundColor="#333030";
            document.getElementById("passLength").style.color="white";
            const settings = document.getElementsByClassName("setting");
            for (var i = 0; i < settings.length; i++) {
                if(settings[i].childNodes[3]!=null && settings[i].childNodes[3].tagName.toLowerCase() == 'input'
                && settings[i].childNodes[3].type!="file"){
                    settings[i].childNodes[3].style.backgroundColor="#555";
                    settings[i].childNodes[3].style.color="white";
                    settings[i].childNodes[3].addEventListener('mouseenter', function () {
                        this.style.backgroundColor = '#777';
                    });
                    settings[i].childNodes[3].addEventListener('mouseleave', function () {
                        this.style.backgroundColor = '#555';
                    });
                }
            }
        }
        else{
            chrome.storage.local.set({ isLightMode: true })
            document.getElementById("body").style.backgroundColor="white";
            document.getElementById("body").style.color="black";
            document.getElementById("passLength").style.backgroundColor="white";
            document.getElementById("passLength").style.color="black";
            const settings = document.getElementsByClassName("setting");
            for (var i = 0; i < settings.length; i++) {
                if(settings[i].childNodes[3]!=null && settings[i].childNodes[3].tagName.toLowerCase() == 'input' && 
                settings[i].childNodes[3].type!="file"){
                    settings[i].childNodes[3].style.backgroundColor="#dadada";
                    settings[i].childNodes[3].style.color="black";
                    settings[i].childNodes[3].addEventListener('mouseenter', function () {
                        this.style.backgroundColor = '#ebebeb';
                    });
                    settings[i].childNodes[3].addEventListener('mouseleave', function () {
                        this.style.backgroundColor = '#dadada';
                    });
                }
            }
        }
    });
});
let user= "";
chrome.storage.local.get(['username'], async function(result) {
    if(result.username==""){
        window.alert("Please log in to access this page.");
        window.close();        
    }
    user = result.username;
    const settings = await findUserSettings(user);
    const usernameInput = document.getElementById('username');
    usernameInput.value = settings.table_data[0].username;

    const emailInput = document.getElementById('email');
    emailInput.value = settings.table_data[0].email;

    let oldusername= "";
    chrome.storage.local.get(['username'], async function(result) {
        oldusername = result.username;
    });
    let settingsAdvanced = settings.table_data[0].settings.split('|');
    document.getElementById("passLength").value = settingsAdvanced[1];
    if(settingsAdvanced[2]=="t"){
        document.getElementById("lc").checked = true;
    }
    if(settingsAdvanced[3]=="t"){
        document.getElementById("uc").checked = true;
    }
    if(settingsAdvanced[4]=="t"){
        document.getElementById("num").checked = true;
    }
    if(settingsAdvanced[5]=="t"){
        document.getElementById("special").checked = true;
    }
});

chrome.storage.local.get(['isLightMode'], async function(result) {
    let is = result.isLightMode;
    if(!is){
        let modeCheckbox = document.getElementById("changeMode");
        modeCheckbox.checked = true;
    }
    else{
        document.getElementById("body").style.backgroundColor="white";
        document.getElementById("body").style.color="black";
        document.getElementById("passLength").style.backgroundColor="white";
        document.getElementById("passLength").style.color="black";
        let settings = document.getElementsByClassName("setting");
        for (var i = 0; i < settings.length; i++) {
            let children = settings[i].children;
            for (var j = 0; j < children.length; j++) {
                if (children[j].tagName.toLowerCase() === "input") {
                    if(children[j].type!="file"){
                        children[j].style.backgroundColor="#dadada";
                        children[j].style.color="black";
                        children[j].addEventListener('mouseenter', function () {
                            this.style.backgroundColor = '#ebebeb';
                        });
                        children[j].addEventListener('mouseleave', function () {
                            this.style.backgroundColor = '#dadada';
                        });
                    }
                
                }
            }
        }
    }
});
async function findUserSettings(username) {
    const url = 'http://localhost/db1/userSettings.php'; //https://passrem.000webhostapp.com/userSettings.php
    const data = new FormData();
    data.append('username', username);
  
    const response = await fetch(url, {
        method: 'POST',
        body: data
    });
  
    return await response.json();
  }

  const saveBtn = document.getElementById("save");
saveBtn.addEventListener('click', async function() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("oldPassword").value;
    let newpassword = document.getElementById("newPassword").value;
    let newpassword2 = document.getElementById("newPassword2").value;
    let email = document.getElementById("email").value;
    let settings = "";
    if(document.getElementById("changeMode").checked == true){
        settings+="t|";
    }
    else{
        settings+="f|";
    }
    settings+=document.getElementById("passLength").value+"|";
    let num = 0;
    if(document.getElementById("lc").checked == true){
        settings+="t|";
        num+=1;
    }
    else{
        settings+="f|";
    }
    if(document.getElementById("uc").checked == true){
        settings+="t|";
        num+=1;
    }
    else{
        settings+="f|";
    }
    if(document.getElementById("num").checked == true){
        settings+="t|";
        num+=1;
    }
    else{
        settings+="f|";
    }
    if(document.getElementById("special").checked == true){
        settings+="t|";
        num+=1;
    }
    else{
        settings+="f|";
    }
    if(password!="" || newpassword!="" || newpassword2!=""){
        const response = await sendDataToPHP(user, password);
        if (response.status === 'success') {
            const errorMessageElement = document.getElementById('error_message');
            if(newpassword!=newpassword2){
                errorMessageElement.textContent = 'Error: New Master password does not match!';
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            else if(password==newpassword){
                errorMessageElement.textContent = 'Error: New Master password cannot be the same as old one!';
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            else if(newpassword.length<6){
                errorMessageElement.textContent = 'Error: New Master password must be at least 6 characters long!';
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            else if(num==0){
                errorMessageElement.textContent = 'Error: At least one of password characters must be checked!';
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            else if(document.getElementById("passLength").value<6 || document.getElementById("passLength").value>99){
                errorMessageElement.textContent = 'Password length must be between 6 - 99 long!';
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            else{
            errorMessageElement.textContent = "";
            const response = await saveSettings(user,username,email,newpassword,settings);
            
            if (response.status === 'success') {
                
                location.reload();
            } else {
                errorMessageElement.textContent = 'Error: ' + response.message;
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
        } else {
            const errorMessageElement = document.getElementById('error_message');
            errorMessageElement.textContent = 'Error: ' + response.message;
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    
    }
    else{
        const errorMessageElement = document.getElementById('error_message');
        if(num==0){
            errorMessageElement.textContent = 'Error: At least one of password characters must be checked!';
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        else if(document.getElementById("passLength").value<6 || document.getElementById("passLength").value>99){
            errorMessageElement.textContent = 'Password length must be betwwen 6 - 99 long!';
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        else{
    const response = await saveSettings(user,username,email,"",settings);
    if (response.status === 'success') {
        location.reload();
    } else {
        const errorMessageElement = document.getElementById('error_message');
        errorMessageElement.textContent = 'Error: ' + response.message;
    }
}
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

async function saveSettings(olduser, newuser, email, password, settings) {
    const databaseurl = 'http://localhost/db1/saveSettings.php'; //https://passrem.000webhostapp.com/saveSettings.php
    const data = new FormData();
    data.append('olduser', olduser);
    data.append('newuser', newuser);
    data.append('email', email);
    data.append('password', password);
    data.append('settings', settings);
  
    const response = await fetch(databaseurl, {
        method: 'POST',
        body: data
    });
  
    return await response.json();
  }


  function importCSV() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file.');
        return;
    }
    
    if (file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const csvData = event.target.result;
            processCSV(csvData);
        };
        reader.readAsText(file);
    } else {
        alert('Please select a CSV file.');
    }
}

function processCSV(csvData) {
    let user = "";
      let totalNumber=0;
      let passedNumber=0;
      chrome.storage.local.get(['username'], async function(result) {
        document.getElementById('statusMessage').innerText = "Import process is in progress. Please wait...";

        user = result.username;

      const key = await getKey(user);
      const array = key.key.split(',').map(Number);
      const arraybuffer= Uint8Array.from(array).buffer;
      const newkey= await importKeyFromRaw(arraybuffer);
      const csvArray = csvData.split('\n');
      for (var i = 1; i < csvArray.length; i++) {
        let help = csvArray[i].split(',');
        if(help.length!=5){
        console.log(help);
        }
        else{
        let url = help[1];
        let suremail = help[2];
        let password= help[3];
        const encrypted= await encryptPassword(password, newkey);
        let encPassword = arrayBufferToBase64(encrypted.encryptedData);
        let iv = encrypted.iv;
        let username = "";
        let email = "";
        if(suremail!='' && suremail!=null){
        if (suremail.includes("@")) {
            email= suremail;
        } else {
            username=suremail
        }
    
        let domain;
        try {
            domain = new URL(url).hostname;
        } catch (error) {
            continue;
        }

        const response = await addPassword(user, domain, username, email, encPassword, iv);
        totalNumber+=1;
        if (response.status == 'success') {
            passedNumber+=1;
        }
    }
    }
      }
      document.getElementById('statusMessage').innerText = "";
      const successRatio = passedNumber + ' of ' + totalNumber;
      window.alert("Successfully imported " + successRatio + " passwords.");
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
    const databaseurl = 'https://passrem.000webhostapp.com/getKey.php'; //https://passrem.000webhostapp.com/getKey.php
    const data = new FormData();
    data.append('user', user);
  
    const response = await fetch(databaseurl, {
        method: 'POST',
        body: data
    });
  
    return await response.json();
  }
  
  async function addPassword(user, url, username, email, password, iv) {
    const databaseurl = 'https://passrem.000webhostapp.com/add.php'; //https://passrem.000webhostapp.com/add.php
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
