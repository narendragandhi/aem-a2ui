export class ImsAuth {
  constructor() {
    this.imsClientId = process.env.IMS_CLIENT_ID;
    this.imsOrgId = process.env.IMS_ORG_ID;
  }

  async getToken() {
    const token = new URLSearchParams(window.location.search).get('imsToken');
    if (!token) {
      throw new Error('No IMS token found in URL. Run inside Universal Editor.');
    }
    return token;
  }

  async getHeaders() {
    const token = await this.getToken();
    return {
      Authorization: `Bearer ${token}`,
      'X-GW-IMS-Org-Id': this.imsOrgId,
    };
  }
}
