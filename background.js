const GITHUB_TOKEN = "xxxxx";
const REPO_OWNER = "xxxxx";
const REPO_NAME = "xxx";
const FILE_PATH = "xxxx";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveArticle") {~̀
    saveArticleToGitHub(request.article)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Indicates that the response is sent asynchronously
  }
});

async function saveArticleToGitHub(article) {
  // Get the current file content
  const fileContent = await getFileContent();

  // Append the new article
  const updatedContent = appendArticle(fileContent, article);

  // Update the file on GitHub
  await updateFile(updatedContent);
}

function appendArticle(content, article) {
  const lines = content.split("\n");
  const tableStartIndex = lines.findIndex((line) =>
    line.startsWith("| Description"),
  );

  if (tableStartIndex === -1) {
    throw new Error("Table not found in the markdown file");
  }

  // Insert the new article just after the table header and separator
  lines.splice(
    tableStartIndex + 2,
    0,
    `| ${article.title} | [${article.url}](${article.url}) |`,
  );

  return lines.join("\n");
}

async function getFileContent() {
  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(FILE_PATH)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch file content");
  }

  const data = await response.json();
  return atob(data.content);
}

async function updateFile(content) {
  const fileInfo = await getFileInfo();
  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(FILE_PATH)}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Add new article",
        content: btoa(content),
        sha: fileInfo.sha,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update file");
  }
}

async function getFileInfo() {
  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(FILE_PATH)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch file info");
  }

  return response.json();
}
