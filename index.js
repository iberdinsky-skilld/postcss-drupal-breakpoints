const fs = require('fs');
const postcss = require('postcss')
const yaml = require('js-yaml')


function checkMultipliers(multipliers) {
  if (typeof multipliers === 'undefined') {
    multipliers = ['1x'];
  } else if (!multipliers.includes('1x')) {
    multipliers.unshift('1x');
  }
  return multipliers;
}

function getMappedGroupsList(fileContent, themeName) {
  const items = Object.keys(fileContent);
  const allGroups = items.map(item => {
    if (typeof fileContent[item].group === 'undefined') {
      return themeName;
    }

    return fileContent[item].group;
  });
  const uniqueGroups = [...new Set(allGroups)];

  const groups = new Map();

  uniqueGroups.forEach(group => {
    let queriesByGroup;
    if (group === themeName) {
      queriesByGroup = items.filter(item => {
        return (
          typeof fileContent[item].group === 'undefined' ||
          fileContent[item].group === themeName
        );
      });
    } else {
      queriesByGroup = items.filter(item => fileContent[item].group === group);
    }

    groups.set(group, queriesByGroup);
  });

  return groups;
}

function getBreakpointsByGroupsList(groups, fileContent) {
  const output = {};
  groups.forEach((breakpoints, group) => {
    group = group.replace('.', '_');
    output[group] = {};
    breakpoints.forEach(bp => {
      const breakpoint = fileContent[bp];
      const multipliers = checkMultipliers(breakpoint.multipliers);
      const breakpointLabel = breakpoint.label
        .replace(/\s+/g, '_')
        .toLowerCase();

      multipliers.forEach(mp => {
        const multiplier = mp ? `_${mp}` : '';
        output[group][breakpointLabel + multiplier] = generateQuery(
          breakpoint,
          mp === '1x' ? null : mp,
        );
      });
    });
  });
  return output;
}

function generateQuery(breakpoint, multiplier) {
  const resQuery = multiplier ? xToResolution(multiplier) : '';
  return breakpoint.mediaQuery + resQuery;
}

function xToResolution(mp) {
  return ` and (min-resolution: ${parseInt(mp)}dppx)`;
}

module.exports = postcss.plugin('postcss-drupal-breakpoints', function (opts) {
  opts = opts || {}

  const importFrom = opts.importFrom
  const themeName = opts.themeName

  try {
    const doc = yaml.safeLoad(fs.readFileSync(importFrom))
    const groups = getMappedGroupsList(doc, themeName)
    const breakpoints = getBreakpointsByGroupsList(groups, doc);

    return function (root) {

      root.walkAtRules(atRule => {
        if (atRule.name === 'drupal-breakpoint') {
          const media = breakpoints[themeName][atRule.params]
          atRule.name = 'media'
          atRule.params = media
        }
      })
    }

  } catch (e) {
    console.log(e);
  }
})
