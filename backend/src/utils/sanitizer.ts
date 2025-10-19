export class Sanitizer {
  static sanitizeFilename(filename: string): string {
    // Remove any path separators and special characters
    return filename
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static sanitizeArray(arr: any[]): any[] {
    return arr.filter((item) => item !== null && item !== undefined);
  }
}
