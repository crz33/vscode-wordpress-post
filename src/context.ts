import * as vscode from "vscode";

export class Context {
  public static readonly appId = "wordpress-post";
  public static readonly appName = "WordPress Post";
  public readonly prefixOfSettings = Context.appId;
  private outputChannel: vscode.OutputChannel | undefined = undefined;

  constructor(public vscodeContext: vscode.ExtensionContext) {
    this.outputChannel = this.getConf("debug")
      ? vscode.window.createOutputChannel(Context.appName)
      : undefined;
  }

  /**
   * Auth of REST API
   */
  getAuth(): any {
    return {
      username: this.getConf("authUser"),
      password: this.getConf("authPassword"),
    };
  }

  /**
   * URL of REST API
   */
  getUrl(label: string): string {
    return `${this.getConf("apiUrl")}/${label}`;
  }

  /**
   * Keys of Slug to ID
   */
  getSlugKeys(): string[] {
    const keys: string[] = this.getConf("slugKeys").split(",");
    return keys.map((key) => key.trim());
  }

  /**
   * ID of deafult featured image
   */
  getDefaultFeaturedImageId(): number {
    return this.getConf("defaultFeaturedImageId");
  }

  /**
   * Slug of featured image
   */
  getFeaturedImageSlug(documentSlug: string): string {
    const prefix: string = this.getConf("prefixFeaturedImageSlug");
    const suffix: string = this.getConf("suffixFeaturedImageSlug");
    const sep: string = this.getConf("slugSepalator");
    let result = documentSlug;
    if (prefix.trim() !== "") {
      result = prefix + sep + result;
    }
    if (suffix.trim() !== "") {
      result = result + sep + suffix;
    }
    return result;
  }

  /**
   * Slug of attached image
   */
  getAttachedImageSlug(originalSlug: string, documentSlug: string): string {
    const typeSlug: string = this.getConf("typeAttachedImageSlug");
    const sep: string = this.getConf("slugSepalator");
    if (typeSlug === "prefix") {
      return documentSlug + sep + originalSlug;
    } else if (typeSlug === "suffix") {
      return originalSlug + sep + documentSlug;
    } else {
      return originalSlug;
    }
  }

  /**
   * Media extensions
   */
  getMediaExtensions(): string[] {
    const mediaTypesStr: string = this.getConf("mediaTypes");
    const mediaTypes = mediaTypesStr.split(";");
    return mediaTypes.map((mType) => mType.split(",")[0].trim());
  }

  /**
   * Media type
   */
  getMediaType(extension: string): string {
    const mediaTypesStr: string = this.getConf("mediaTypes");
    const mediaTypes = mediaTypesStr.split(";");
    for (const mediaType of mediaTypes) {
      const kv = mediaType.split(",");
      if (kv[0].trim() === extension) {
        return kv[1].trim();
      }
    }
    throw new Error(`Not support media type : ${extension}`);
  }

  /**
   * Create relative Url
   */
  replaceAttachedImageUrl(imgSrc: string): string {
    const siteUrl: string = this.getConf("siteUrl");
    return imgSrc.replace(siteUrl, "");
  }

  useLinkableImage(): boolean {
    return this.getConf("useLinkableImage");
  }

  /**
   * Code Block
   */
  getCodeBlockStartTag(lang: string) : string {
    const prefix:string = this.getConf("codeBlockLanguagePrefix");
    const tag:string = this.getConf("codeBlockTag");
    if ( tag === "pre" ) {
      return "<pre class=\"" + prefix + lang + "\"><code>";
    } else {
      return "<pre><code class=\"" + prefix + lang + "\">";
    }
  }
  getCodeBlockEndTag() : string {
    return "</code></pre>";
  }

  getConf(id: string): any {
    return vscode.workspace.getConfiguration(this.prefixOfSettings).get(id);
  }

  debug(text: string) {
    if (this.outputChannel) {
      const now = new Date();
      this.outputChannel.appendLine(
        now.toLocaleTimeString("en", { hour12: false }) +
          "." +
          String(now.getMilliseconds()).padStart(3, "0") +
          " " +
          text
      );
    }
  }
}
