/**
 * AEM Deployment Service
 * Real deployment of content to AEM via Sling POST Servlet
 */

import { ContentSuggestion } from '../lib/types.js';
import { contentToJcr } from '../lib/aem-content-structure.js';
import { logger } from './logger.js';

export interface AemCredentials {
  username: string;
  password: string;
}

export interface DeployResult {
  success: boolean;
  path?: string;
  message: string;
  changes?: string[];
}

export interface DeployOptions {
  path: string;
  resourceType?: string;
  template?: string;
  createPage?: boolean;
}

/**
 * AEM Deploy Service
 */
export class AemDeployService {
  private baseUrl: string;
  private credentials: AemCredentials;

  constructor(baseUrl: string, credentials: AemCredentials) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.credentials = credentials;
  }

  /**
   * Get authorization header
   */
  private getAuthHeader(): string {
    const auth = btoa(`${this.credentials.username}:${this.credentials.password}`);
    return `Basic ${auth}`;
  }

  /**
   * Check AEM connection
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/libs/granite/core/content/login.html`, {
        method: 'HEAD',
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });
      return response.ok || response.status === 302;
    } catch (error) {
      logger.error('AEM connection check failed', 'Deploy', error);
      return false;
    }
  }

  /**
   * Deploy content to AEM using Sling POST Servlet
   */
  async deployContent(content: ContentSuggestion, options: DeployOptions): Promise<DeployResult> {
    try {
      const jcrContent = contentToJcr(content, {
        path: options.path,
        resourceType: options.resourceType || `aem-component-factory/components/${content.componentType || 'teaser'}`,
      });

      // Flatten JCR structure to form data
      const formData = new FormData();
      this.flattenToFormData(jcrContent, formData, '');

      // Add operation
      formData.append(':operation', 'import');
      formData.append(':contentType', 'json');
      formData.append(':content', JSON.stringify(jcrContent));
      formData.append(':replace', 'true');
      formData.append(':replaceProperties', 'true');

      const response = await fetch(`${this.baseUrl}${options.path}`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Deploy failed: ${response.status} - ${text}`);
      }

      const result = await response.json().catch(() => ({}));

      logger.info(`Content deployed to ${options.path}`, 'Deploy');

      return {
        success: true,
        path: options.path,
        message: `Successfully deployed to ${options.path}`,
        changes: result.changes || [],
      };
    } catch (error) {
      logger.error('Deploy failed', 'Deploy', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Deploy failed',
      };
    }
  }

  /**
   * Create a new AEM page with content
   */
  async createPage(
    content: ContentSuggestion,
    parentPath: string,
    pageName: string,
    template: string = '/conf/aem-component-factory/settings/wcm/templates/content-page',
  ): Promise<DeployResult> {
    try {
      const pagePath = `${parentPath}/${pageName}`;

      // Create page using WCM command
      const formData = new FormData();
      formData.append('cmd', 'createPage');
      formData.append('parentPath', parentPath);
      formData.append('title', content.title);
      formData.append('label', pageName);
      formData.append('template', template);

      const createResponse = await fetch(`${this.baseUrl}/bin/wcmcommand`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
        },
        body: formData,
      });

      if (!createResponse.ok) {
        // Try alternative: direct node creation
        return await this.createPageDirect(content, parentPath, pageName, template);
      }

      // Now add the content to the page
      const contentPath = `${pagePath}/jcr:content/root/container/component_0`;
      const deployResult = await this.deployContent(content, { path: contentPath });

      if (!deployResult.success) {
        return deployResult;
      }

      return {
        success: true,
        path: pagePath,
        message: `Page created at ${pagePath}`,
      };
    } catch (error) {
      logger.error('Page creation failed', 'Deploy', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Page creation failed',
      };
    }
  }

  /**
   * Create page using direct Sling POST
   */
  private async createPageDirect(
    content: ContentSuggestion,
    parentPath: string,
    pageName: string,
    template: string,
  ): Promise<DeployResult> {
    const pagePath = `${parentPath}/${pageName}`;

    const pageStructure = {
      'jcr:primaryType': 'cq:Page',
      'jcr:content': {
        'jcr:primaryType': 'cq:PageContent',
        'jcr:title': content.title,
        'sling:resourceType': 'aem-component-factory/components/page',
        'cq:template': template,
        root: {
          'jcr:primaryType': 'nt:unstructured',
          'sling:resourceType': 'wcm/foundation/components/responsivegrid',
          container: {
            'jcr:primaryType': 'nt:unstructured',
            'sling:resourceType': 'wcm/foundation/components/responsivegrid',
            component_0: contentToJcr(content, {
              path: `${pagePath}/jcr:content/root/container/component_0`,
              resourceType: `core/wcm/components/${content.componentType || 'teaser'}/v2/${content.componentType || 'teaser'}`,
            }),
          },
        },
      },
    };

    const formData = new FormData();
    formData.append(':operation', 'import');
    formData.append(':contentType', 'json');
    formData.append(':content', JSON.stringify(pageStructure));

    const response = await fetch(`${this.baseUrl}${pagePath}`, {
      method: 'POST',
      headers: {
        Authorization: this.getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Page creation failed: ${response.status} - ${text}`);
    }

    return {
      success: true,
      path: pagePath,
      message: `Page created at ${pagePath}`,
    };
  }

  /**
   * Deploy Content Fragment
   */
  async deployContentFragment(
    fragmentData: Record<string, unknown>,
    path: string,
    modelPath: string,
  ): Promise<DeployResult> {
    try {
      const formData = new FormData();
      formData.append(':operation', 'import');
      formData.append(':contentType', 'json');
      formData.append(
        ':content',
        JSON.stringify({
          'jcr:primaryType': 'dam:Asset',
          'jcr:content': {
            'jcr:primaryType': 'dam:AssetContent',
            data: {
              'jcr:primaryType': 'nt:unstructured',
              'cq:model': modelPath,
              ...fragmentData,
            },
          },
        }),
      );

      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Content Fragment deploy failed: ${response.status}`);
      }

      return {
        success: true,
        path,
        message: `Content Fragment deployed to ${path}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Deploy failed',
      };
    }
  }

  /**
   * Upload asset to DAM
   */
  async uploadAsset(file: File | Blob, path: string, filename: string): Promise<DeployResult> {
    try {
      const formData = new FormData();
      formData.append('file', file, filename);
      formData.append('fileName', filename);

      const response = await fetch(`${this.baseUrl}${path}.createasset.html`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Asset upload failed: ${response.status}`);
      }

      return {
        success: true,
        path: `${path}/${filename}`,
        message: `Asset uploaded to ${path}/${filename}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Activate/publish content
   */
  async activateContent(paths: string[]): Promise<DeployResult> {
    try {
      const formData = new FormData();
      formData.append('cmd', 'Activate');
      paths.forEach((path) => formData.append('path', path));

      const response = await fetch(`${this.baseUrl}/bin/replicate.json`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Activation failed: ${response.status}`);
      }

      return {
        success: true,
        message: `Activated ${paths.length} item(s)`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Activation failed',
      };
    }
  }

  /**
   * Flatten nested object to FormData
   */
  private flattenToFormData(obj: Record<string, unknown>, formData: FormData, prefix: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const fieldName = prefix ? `${prefix}/${key}` : key;

      if (value === null || value === undefined) {
        continue;
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        this.flattenToFormData(value as Record<string, unknown>, formData, fieldName);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            this.flattenToFormData(item as Record<string, unknown>, formData, `${fieldName}/${index}`);
          } else {
            formData.append(fieldName, String(item));
          }
        });
      } else {
        formData.append(fieldName, String(value));
      }
    }
  }
}

/**
 * Create deploy service instance
 */
export function createDeployService(
  baseUrl: string,
  username: string = 'admin',
  password: string = 'admin',
): AemDeployService {
  return new AemDeployService(baseUrl, { username, password });
}
