# WordPress Post

This Visual Studio Code extension provides action that posts articles to WordPress.
This helps people to write WordPress articles in Markdown with Visual Studio Code.

## Features

This extension is simple.
The only Post action in the extension has the following features.

- uploads a featured image.
- convert Markdown to HTML.
    - uploads the image of the image link in the markdown.
    - modifies the URL of the image link to match the WordPress URL.
    - adds an a tag to the image link in the markdown.
- sets the attributes of the article.
    - changes category and tag slugs to IDs.
    - attributes are free if you know the WordPress API.
- reuse articles and images instead of uploading them every time..

## Sample

First, I will show markdown and a sample of the result.
I'll explain frontmatter and how to use it later.

### Sample of Markdown

````markdown
---
title: Sample documents of extention "WordPress Post"
status: publish
date: "2021-12-31T23:00:00"
categories: [vscode]
tags: [vscode, typescript]
---

This is sample document of extention "WordPress Post".
````

If you want to see all of the samples, go to the following URL

[https://raw.githubusercontent.com/crz33/vscode-wordpress-post/feature/change-frontmatter/sample/my-sample.md](https://raw.githubusercontent.com/crz33/vscode-wordpress-post/feature/change-frontmatter/sample/my-sample.md)

### Sample of WordPress Page

The following is a list of articles created with this extension.

[https://masa86.net/my-sample/](https://masa86.net/my-sample/)

## Usage

### Minimum settings

The minimum settings required are the following three.

* `wordpress-post.apiUrl`: URL of WordPress, used create relative url.
* `wordpress-post.authUser` : User of WordPress REST API.
* `wordpress-post.authPassword` : Password of WordPress REST API.

For the API URL(`wordpress-post.apiUrl`), 
https://yourdomain/wp-json/wp/v2/

For the password(`wordpress-post.authPassword`), refer to the following WordPress site to create one and then set it.
[Application Passwords: Integration Guide](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/)

For the user(`wordpress-post.authUser`), use the user who accessed wp-admin to get the Application Passsword.

### Simplest case

Create a file named "sample00-simplest.md".

````markdown
Body text in Markdown notation
````

If you run "WordPress Post: Post" in the command palette, it will be posted as a draft if the settings are correct.

- Since no slug is specified, the file name becomes the slug. (sample00-simplest)
- No frontmatter at all, so no title.

### How to set the title

Set the title as a simple case of frontmatter.

````markdown
---
title: Sample 01
---

This is sample.
````

Of course, you can set other titles as well.
For all information, please refer to the following sites.

[https://developer.wordpress.org/rest-api/reference/posts/](https://developer.wordpress.org/rest-api/reference/posts/)

### How set the featured image

There are three ways to set a Featured Image.

### 1. Set the ID in FrontMatter

You can set the ID to frontmatter as well as the title.

````markdown
---
title: Sample 02
featured_media : 90
---

This is Sample.
````

### 2. Put the image under the same slug as the Markdown file.

If you place an image file with the same name as the Markdown slug as shown in the following file structure, it will be uploaded and set to Feature Image.

```bash
sample                                       
├── sample03-featured-image-put.md
└── sample03-featured-image-put.png
```

This extension

- add the strings `wordpress-post.prefixFeaturedImageSlug` and `wordpress-post.suffixFeaturedImageSlug` before and after the slug of the feature image to upload
- search only for feature images with the extension declared as `wordpress-post.mediaTypes`.

### 3. Set `wordpress-post.defaultFeaturedImageId`

If neither 1 nor 2 is present, set the value of `wordpress-post.defaultFeaturedImageId`.
If `wordpress-post.defaultFeaturedImageId` is also -1, no Feature Image will be set.

### To include the image of attached images

Of course, attaching images is also supported.

Write a Markdown file that looks like this.

````markdown
---
title: Sample 04
---

This is sample.

![Sample](img/2021-12-31-231548.png)
```

If the image is located in the following file structure, find the image and upload it.

```bash
sample                      
├── sample04-attached-image.md
├── img
       └── 2021-12-31-231548.png                       
```

If `wordpress-post.typeAttachedImageSlug` is prefix, the Markdown slug will be appended to the front; if it is suffix, the Markdown slug will be appended to the back; if it is none, the image file name will be appended as is, but be careful not to duplicate it.

### To set the categories and tags

Categories and tags can be specified by slugs.

````markdown
---
title: Sample 05
categories: [vscode]
tags: [vscode, typescript]
---

This is sample.
````

If you want to specify IDs instead of slugs, remove `wordpress-post.slugKeys`.

### To set the others

There are other WordPress post attributes that can be specified in frontmatter that are not described here.

[https://developer.wordpress.org/rest-api/reference/posts/](https://developer.wordpress.org/rest-api/reference/posts/)

Please refer to my frontmatter.

````markdown
---
title: Sample documents of extention "WordPress Post"
status: publish
date: "2021-12-31T23:00:00"
categories: [vscode]
tags: [vscode, typescript]
---
````

I guess the two things I haven't explained are the following.

- `status` : If you want to publish, use `publish`.
- `date` : If you have not yet arrived, make a reservation.

## Extension Settings

This extension contributes the following settings:

* `wordpress-post.siteUrl`: URL of WordPress, used create image relative url.
* `wordpress-post.apiUrl`: URL of WordPress, used create relative url.
* `wordpress-post.authUser` : User of WordPress REST API.
* `wordpress-post.authPassword` : Password of WordPress REST API.
* `wordpress-post.slugKeys` : List of slug to ID conversions.
* `wordpress-post.defaultFeaturedImageId` : The ID of the featured image when there was no image.
* `wordpress-post.slugSepalator` : Separator for file names to be added.
* `wordpress-post.prefixFeaturedImageSlug` : Prefix of featured image slug.
* `wordpress-post.suffixFeaturedImageSlug` : Suffix of featured image slug.
* `wordpress-post.typeAttachedImageSlug` : Processing rules for attached image file names.
* `wordpress-post.mediaTypes` : File extensions and media types to enable.
* `wordpress-post.useLinkableImage` : Add a tag to img tag.
* `wordpress-post.debug` : Debug of this extension.

My setting.json is:

```json
{
    "wordpress-post.debug": true,
    "wordpress-post.siteUrl": "https://masa86.net",
    "wordpress-post.apiUrl": "https://masa86.net/wp-json/wp/v2",
    "wordpress-post.authUser": "myuser",
    "wordpress-post.authPassword": "xxxx xxxx xxxx xxxx xxxx xxxx",
    "wordpress-post.useLinkableImage": true
}
```

## Release Notes

### 0.0.1

Initial release of my use case.

### 0.0.2

Adjusting frontmatter priority
