# shikoko.github.io

This is a responsive minimal résumé template made by Crisp, powered by [Jekyll](http://jekyllrb.com/).
The project can be found at https://github.com/crispgm/resume


## Usage

### Local Mode

1. Clone the repo

    ```shell
    git clone https://github.com/crispgm/resume.git
    ```

2. Install Jekyll

    ```shell
    gem install jekyll
    ```

3. Config your résumé data

    The `baseurl` is required in `_config.yml` if you serve this page as part of your website. And your contact information, __EDUCATION__, __SKILLS__, __EXPERIENCE__, and __PROJECTS__ data will be set in `_data/resume.yml`.

4. Run and Debug

    ```shell
    jekyll serve
    ```

5. Build

    ```shell
    jekyll build
    ```
    
    
## Data Format

### Contact

```yaml
contact:
  - icon: fa-envelope
    text: youremail@example.com
  - icon: fa-phone-square
    text: your-phone-num
  - icon: fa-globe
    text: your-website.com
    link: https://crispgm.github.io/resume/resume.html
```

FontAwesome iconfont is embedded, so use the `fa-` class name as icon. `link` is optional, present if you want a link for your web version.

## Colors

There are a set of colorscheme. `color` may be specified in `_config.yml`. The default colorscheme is gray.

```yaml
color: gray
```

Colors powered by [Open-Color](https://yeun.github.io/open-color/):

- red
- pink
- grape
- violet
- indigo
- blue
- cyan
- teal
- green
- lime
- yellow
- orange

Colors powered by [Nord](https://www.nordtheme.com/):

- nord


## Extending Sections

1. Add new section in `_data/resume.yml`

  ```yaml
  languages:
    - name: English
      proficiency: Professional working proficiency
    - name: Mandarin Chinese
      proficiency: Native or bilingual proficiency
  ```

2. Add section to `_layouts/resume.html`:

  ```html
  <section id="languages">
    <div class="section-title">
      Language
    </div>
    <div class="section-content">
      {% for lang in site.data.resume.languages %}
      <div class="block">
        <div class="block-title">
          {{ lang.name }}
        </div>
        <div class="block-content">
          {{ lang.proficiency }}
        </div>
      </div>
      {% endfor %}
    </div>
  </section>
  ```
