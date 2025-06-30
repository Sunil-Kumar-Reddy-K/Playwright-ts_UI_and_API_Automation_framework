export class EmailHelpers {
  /**
   * Extract password reset link from email
   */
  static extractPasswordResetLink(emailBody: string): string | null {
    // Common patterns for password reset links
    const patterns = [
      /https?:\/\/[^\s<>"']*reset[^\s<>"']*/gi,
      /https?:\/\/[^\s<>"']*password[^\s<>"']*/gi,
      /https?:\/\/[^\s<>"']*token[^\s<>"']*/gi,
      /https?:\/\/[^\s<>"']*verify[^\s<>"']*/gi,
    ];

    for (const pattern of patterns) {
      const matches = emailBody.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].replace(/['"<>]$/, ''); // Clean trailing characters
      }
    }

    return null;
  }

  /**
   * Extract verification code/token from email
   */
  static extractVerificationCode(emailBody: string): string | null {
    const patterns = [
      /reset code[:\s]*([A-Z0-9]{4,8})/i,
      /verification code[:\s]*([A-Z0-9]{4,8})/i,
      /your code[:\s]*([A-Z0-9]{4,8})/i,
      /token[:\s]*([A-Z0-9]{6,32})/i,
      /([0-9]{4,8})/g
    ];

    for (const pattern of patterns) {
      const match = emailBody.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  }

  /**
   * Clean HTML and extract readable text
   */
  static extractTextFromHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract all links from email
   */
  static extractAllLinks(emailBody: string): string[] {
    const linkPattern = /https?:\/\/[^\s<>"']+/gi;
    const matches = emailBody.match(linkPattern) || [];
    return matches.map(link => link.replace(/['"<>]$/, ''));
  }
}