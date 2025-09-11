import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // You'll need to add this to your environment variables
});

const GITHUB_OWNER = 'Deankann2023';
const GITHUB_REPO = 'sitehub-customer-sites';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { siteId } = req.query;

  if (req.method === 'POST') {
    try {
      const { htmlContent, siteName, commitMessage } = req.body;

      // Map site ID to folder name
      const siteFolderMap: { [key: string]: string } = {
        '8471936c-3bb6-48d4-81e1-3791fc089938': 'buykit-fixed',
        '8d38af38-c39a-4c5d-9a0a-72ef18f75129': 'natalie-photography'
      };

      const siteFolder = siteFolderMap[siteId as string];
      if (!siteFolder) {
        return res.status(400).json({ 
          success: false, 
          error: 'Site not configured for GitHub deployment' 
        });
      }

      // Get current file to get SHA for update
      let currentFileSha: string | undefined;
      try {
        const currentFile = await octokit.rest.repos.getContent({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: `sites/${siteFolder}/index.html`,
        });

        if ('sha' in currentFile.data) {
          currentFileSha = currentFile.data.sha;
        }
      } catch (error) {
        // File doesn't exist yet, will create new file
        console.log('File does not exist, creating new file');
      }

      // Prepare the file content
      const content = Buffer.from(htmlContent).toString('base64');

      // Create or update the file
      const response = await octokit.rest.repos.createOrUpdateFileContents({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: `sites/${siteFolder}/index.html`,
        message: commitMessage || `Update ${siteName || siteFolder} via SiteHub Editor`,
        content: content,
        sha: currentFileSha, // Required for updates
        author: {
          name: 'SiteHub Editor',
          email: 'editor@sitehub.co.za'
        },
        committer: {
          name: 'SiteHub Editor',
          email: 'editor@sitehub.co.za'
        }
      });

      // Return the commit info
      return res.status(200).json({
        success: true,
        message: 'Site deployed to GitHub successfully',
        commitSha: response.data.commit.sha,
        commitUrl: response.data.commit.html_url,
        siteUrl: `https://dean-sitehub.github.io/dean-sitehub/sites/${siteFolder}/`,
        deploymentStatus: 'pending' // GitHub Pages deployment takes a few minutes
      });

    } catch (error: any) {
      console.error('GitHub deployment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to deploy to GitHub',
        details: error.message
      });
    }
  }

  if (req.method === 'GET') {
    try {
      // Get deployment status and site info
      const siteFolderMap: { [key: string]: string } = {
        '8471936c-3bb6-48d4-81e1-3791fc089938': 'buykit-fixed',
        '8d38af38-c39a-4c5d-9a0a-72ef18f75129': 'natalie-photography'
      };

      const siteFolder = siteFolderMap[siteId as string];
      if (!siteFolder) {
        return res.status(400).json({ 
          success: false, 
          error: 'Site not configured for GitHub deployment' 
        });
      }

      // Get recent commits for this site
      const commits = await octokit.rest.repos.listCommits({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: `sites/${siteFolder}`,
        per_page: 5
      });

      // Get deployment status
      const deployments = await octokit.rest.repos.listDeployments({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        environment: 'github-pages',
        per_page: 1
      });

      let deploymentStatus = 'unknown';
      if (deployments.data.length > 0) {
        const latestDeployment = deployments.data[0];
        const statuses = await octokit.rest.repos.listDeploymentStatuses({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          deployment_id: latestDeployment.id,
          per_page: 1
        });

        if (statuses.data.length > 0) {
          deploymentStatus = statuses.data[0].state;
        }
      }

      return res.status(200).json({
        success: true,
        siteFolder,
        siteUrl: `https://dean-sitehub.github.io/dean-sitehub/sites/${siteFolder}/`,
        repoUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/tree/main/sites/${siteFolder}`,
        deploymentStatus,
        recentCommits: commits.data.map(commit => ({
          sha: commit.sha.substring(0, 7),
          message: commit.commit.message,
          author: commit.commit.author?.name,
          date: commit.commit.author?.date,
          url: commit.html_url
        }))
      });

    } catch (error: any) {
      console.error('GitHub info error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get GitHub info',
        details: error.message
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
