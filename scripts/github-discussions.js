const axios = require('axios');
const fs = require('fs');
const path = require('path');

// GitHub API配置
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN'; // 替换为你的GitHub Token
const REPO_OWNER = 'Yizakl'; // 替换为你的GitHub用户名
const REPO_NAME = 'blog'; // 替换为你的GitHub仓库名
const CATEGORY_ID = 'DIC_kwDOR0tCzc4C5nix'; // 替换为你的GitHub Discussions分类ID

// 从GitHub Discussions获取帖子
async function fetchDiscussions() {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/discussions`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          category_id: CATEGORY_ID
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return [];
  }
}

// 将讨论转换为Hexo文章
function convertToHexoPost(discussion) {
  // 生成文章标题
  const title = discussion.title;
  
  // 生成文章文件名
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const fileName = `${slug}.md`;
  
  // 生成文章内容 - GitHub Discussions的body已经是Markdown格式
  const content = `---
title: ${title}
date: ${new Date(discussion.created_at).toISOString()}
tags:
- GitHub Discussions
comments: true
---

${discussion.body}
`;
  
  return { fileName, content };
}

// 保存文章到source/_posts目录
function savePost(post) {
  const postsDir = path.join(__dirname, '..', 'source', '_posts');
  
  // 确保目录存在
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
  
  // 保存文章
  const filePath = path.join(postsDir, post.fileName);
  fs.writeFileSync(filePath, post.content);
  console.log(`Saved post: ${post.fileName}`);
}

// 主函数
async function main() {
  console.log('Fetching discussions from GitHub...');
  const discussions = await fetchDiscussions();
  
  console.log(`Found ${discussions.length} discussions`);
  
  for (const discussion of discussions) {
    const post = convertToHexoPost(discussion);
    savePost(post);
  }
  
  console.log('Done!');
}

// 运行主函数
main();
