document.addEventListener('DOMContentLoaded', function() {
  const saveButton = document.getElementById('saveButton');
  const titleInput = document.getElementById('title');

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    titleInput.value = currentTab.title;
  });

  saveButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      const articleInfo = {
        title: titleInput.value,
        url: currentTab.url
      };
      
      chrome.runtime.sendMessage({action: "saveArticle", article: articleInfo}, function(response) {
        if (response.success) {
          alert('Article saved successfully!');
        } else {
          alert('Error saving article: ' + response.error);
        }
      });
    });
  });
});
