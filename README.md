# PostCSS Drupal Breakpoints [![Build Status][ci-img]][ci]

[PostCSS] plugin to get drupal theme breakpoints in css variables.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/iberdinsky-skilld/postcss-drupal-breakpoints.svg
[ci]:      https://travis-ci.org/iberdinsky-skilld/postcss-drupal-breakpoints

## Input

css
```css
@drupal-breakpoint wide_1x {
  .pager {
    display: none;
  }
}
```

THEMENAME.breakpoints.yml
```yml
THEMENAME.mobile:
  label: mobile
  mediaQuery: '(min-width: 0em)'
  weight: 0
  multipliers:
    - 1x
THEMENAME.wide:
  label: wide
  mediaQuery: 'screen and (min-width: 40em)'
  weight: 1
  multipliers:
    - 1x
```

postcss.config.js
```js
module.exports = ctx => ({
  plugins: [
    require('postcss-drupal-breakpoints')({
      importFrom: './THEMENAME.breakpoints.yml',
      themeName: 'THEMENAME'
    }),
  ]
});

```

## Output

```css
@media screen and (min-width: 40em) {
  .pager {
    display: none;
  }
}
```
