import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Github, 
  Upload,
  RefreshCw
} from 'lucide-react';

interface GitHubDeploymentProps {
  siteId: string;
  siteName: string;
  htmlContent: string;
  onDeploymentSuccess?: (deploymentInfo: any) => void;
}

interface DeploymentInfo {
  siteFolder: string;
  siteUrl: string;
  repoUrl: string;
  deploymentStatus: string;
  recentCommits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
  }>;
}

const GitHubDeployment: React.FC<GitHubDeploymentProps> = ({
  siteId,
  siteName,
  htmlContent,
  onDeploymentSuccess
}) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadDeploymentInfo();
  }, [siteId]);

  const loadDeploymentInfo = async () => {
    try {
      const response = await fetch(`/api/github/deploy-site/${siteId}`);
      const data = await response.json();
      
      if (data.success) {
        setDeploymentInfo(data);
      }
    } catch (error) {
      console.error('Failed to load deployment info:', error);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setSuccess(null);

    try {
      const commitMessage = `Update ${siteName} via SiteHub Editor - ${new Date().toLocaleString()}`;
      
      const response = await fetch(`/api/github/deploy-site/${siteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlContent,
          siteName,
          commitMessage
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Site deployed successfully! GitHub Pages will update in a few minutes.');
        if (onDeploymentSuccess) {
          onDeploymentSuccess(result);
        }
        // Refresh deployment info
        setTimeout(() => {
          loadDeploymentInfo();
        }, 2000);
      } else {
        setError(result.error || 'Deployment failed');
      }
    } catch (error: any) {
      setError(error.message || 'Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Live</Badge>;
      case 'pending':
      case 'in_progress':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Deploying</Badge>;
      case 'failure':
      case 'error':
        return <Badge className="bg-red-500"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-gray-500"><RefreshCw className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          <h3 className="text-lg font-semibold">GitHub Deployment</h3>
          {deploymentInfo && getStatusBadge(deploymentInfo.deploymentStatus)}
        </div>
        
        <Button
          onClick={loadDeploymentInfo}
          variant="outline"
          size="sm"
          disabled={isDeploying}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleDeploy}
          disabled={isDeploying || !htmlContent}
          className="w-full"
          size="lg"
        >
          {isDeploying ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Deploying to GitHub...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Deploy Site to GitHub
            </>
          )}
        </Button>

        {deploymentInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Live URL:</span>
                <a 
                  href={deploymentInfo.siteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1"
                >
                  {deploymentInfo.siteUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Repository:</span>
                <a 
                  href={deploymentInfo.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1"
                >
                  View on GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Recent Changes:</span>
                <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                  {deploymentInfo.recentCommits.map((commit) => (
                    <div key={commit.sha} className="text-xs">
                      <a 
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-mono"
                      >
                        {commit.sha}
                      </a>
                      <span className="text-gray-500 ml-2">
                        {commit.message.length > 30 ? 
                          commit.message.substring(0, 30) + '...' : 
                          commit.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded p-3 text-xs text-gray-600">
        <p className="font-medium mb-1">About GitHub Deployment:</p>
        <ul className="space-y-1">
          <li>• Changes are committed to your GitHub repository</li>
          <li>• GitHub Pages automatically builds and deploys your site</li>
          <li>• Updates typically go live within 2-5 minutes</li>
          <li>• All changes are version controlled and backed up</li>
        </ul>
      </div>
    </div>
  );
};

export default GitHubDeployment;
