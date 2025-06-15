export default class PreviewModal {
  constructor(data) {
    this.content = data.content;
    this.type = data.type;
    this.timestamp = new Date();
  }

  // Add any methods you need
  getPreview() {
    return {
      content: this.content,
      type: this.type,
      timestamp: this.timestamp
    };
  }
}
