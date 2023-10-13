var submitButton;

document.addEventListener('DOMContentLoaded', function () {
  submitButton = document.getElementById('submit')
  
  submitButton.addEventListener('click', async function () {
    submitButton.disabled = true;

    const saveToValue = document.getElementById('save-to-input').value;
    const linkValue = document.getElementById('link-input').value;

    const data = {
      saveTo: saveToValue,
      link: linkValue,
    };

    await sendToBacked(data);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const inputElement = document.getElementById('save-to-input');

  fetch('../../../config.ini')
  .then(response => response.text())
  .then(data => {
    const lines = data.split('\n');
    let path = '';

    for (const line of lines) {
      if (line.startsWith('path')) {
        path = line.split('=')[1].trim();
        break;
      }
    }

    if (path && path.trim() !== '') {
      inputElement.value = path;
    }
  })
  .catch(error => {
    console.error('Error reading config.ini:', error);
  });
});

async function sendToBacked(data) {
  return new Promise((resolve, reject) => {
    ipcRenderer.send('data-to-backend', data);

    ipcRenderer.on('backend-to-frontend', (event, message) => {
      if (message === 'Task completed') {
        submitButton.disabled = false;
      }

      resolve(message);
    });
  });
}