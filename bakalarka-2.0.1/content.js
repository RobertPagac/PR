document.addEventListener('click', function(e) {
        chrome.storage.local.get(['username'], async function(result) {
            if(result.username!="")
                var currentUrl = window.location.href;
                const response = await findWebsite(result.username, currentUrl);
                
                if (response.status === 'success') {
                  chrome.runtime.sendMessage({ action: 'showPasswordDetail', password: response.password,
                    username: response.username, email: response.email, website: response.website, iv: response.iv});
                  function isUsernameField(target) {
                    const usernameFieldIdentifiers = ['username', 'user', 'login', 'login-', '-login'];
                    return usernameFieldIdentifiers.some(id => target.name?.toLowerCase().includes(id) || target.id?.toLowerCase().includes(id) || target.className?.toLowerCase().includes(id) || target.placeholder?.toLowerCase().includes(id));
                  }
                    if (e.target.type === 'password') {
                        console.log(result.username);
                        const userResult = await getKey(result.username);
                        console.log(userResult);
                        const userKey = userResult.key;
                        const array = userKey.split(',').map(Number);
                        const arraybuffer= Uint8Array.from(array).buffer;
                        const newkey= await importKeyFromRaw(arraybuffer);
                        
                        const dataArray = response.iv.split(',').map(Number); 
                        const uint8Array = new Uint8Array(dataArray.slice(0, 12));
                    
                        const decrypted = await decryptPassword(base64ToArrayBuffer(response.password), newkey, uint8Array);
                        e.target.value=decrypted;
                        console.log(decrypted);
                        const inputEvent = new Event('input', { bubbles: true });
                        e.target.dispatchEvent(inputEvent);
                        return;

                    }
                    else if (e.target.type === 'email') {
                        e.target.value=response.email;
                        const inputEvent = new Event('input', { bubbles: true });
                        e.target.dispatchEvent(inputEvent);
                        return;
                    }
              
                    else if (isUsernameField(e.target)) {
                      if(response.username==""){
                        e.target.value=response.email;
                      

                      }
                      else{
                        e.target.value=response.username;
                      }
                        const inputEvent = new Event('input', { bubbles: true });
                        e.target.dispatchEvent(inputEvent);
                        return;

                    }
                  
                  
                }
        });
    }
);
async function findWebsite(user, url) {
    const databaseurl = 'http://localhost/db1/findurl.php'; //https://passrem.000webhostapp.com/findurl.php
    const data = new FormData();
    data.append('user', user);
    data.append('url', url);
  
    const response = await fetch(databaseurl, {
        method: 'POST',
        body: data
    });
  
    return await response.json();
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
  function base64ToArrayBuffer(base64String) {
    const binaryString = atob(base64String);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array.buffer;
  }