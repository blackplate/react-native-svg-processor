const fs = require('fs');
const path = require('path');
const camelCase = require('camelcase');
const svgr = require('@svgr/core').transform;
const prettier = require('prettier');
const glob = require('glob');

const fileTemplate = ({imports, componentName, props, jsx, exports}, {tpl}) => {
  // TODO: Use imports instead of Manual, imports need to be sorted though.
  return tpl`
    import React from 'react';
    import Svg, { Path, SvgProps } from 'react-native-svg';
    const ${componentName} = (${props}) => ${jsx};
    ${exports}
  `;
};

function processFiles(srcFiles, outputPath) {
  glob(`${srcFiles.toString()}/**/*.svg`, function (err, files) {
    if (err) {
      return;
    }

    files.map(file => {
      const basename = path.basename(file);
      const [name] = basename.split('.');
      const componentName = camelCase(name, {pascalCase: true});
      const svgCode = fs.readFileSync(file, 'utf8');

      svgr(
        svgCode,
        {
          plugins: [
            '@svgr/plugin-svgo',
            '@svgr/plugin-jsx',
            '@svgr/plugin-prettier',
          ],
          template: fileTemplate,
          native: true,
          typescript: true,
          replaceAttrValues: {'#000': 'currentColor'},
          prettierConfig: {
            useTabs: false,
          },
          svgoConfig: {
            multipass: true,
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
              'removeXMLNS',
            ],
          },
        },
        {componentName},
      ).then(jsCode => {
        const filePath = `${outputPath.toString()}/${componentName}.tsx`;

        fs.writeFile(filePath, jsCode, 'utf8', () =>
          console.log(`processed ${filePath}`),
        );
      });
    });
  });
}

function saveIndexFile(outputPath) {
  const indexFilePath = path.join(outputPath, 'index.ts');

  const files = fs
    .readdirSync(outputPath)
    .filter(file => {
      return /\.(tsx)$/i.test(file);
    })
    .map(file => {
      const [name] = file.split('.');
      return camelCase(name, {pascalCase: true});
    });

  const indexFile = `
    ${files.map(file => `import ${file} from './${file}';`).join('\n')}
    export { ${files.map(file => `${file}`).join(', ')} };
    `;

  const prettyJSCode = prettier.format(indexFile, {
    singleQuote: true,
    trailingComma: 'es5',
  });

  fs.writeFile(indexFilePath, prettyJSCode, 'utf8', () =>
    console.log('index saved'),
  );
}

function process(src, out) {
  // TODO: race condition, index may get saved before files have been processed
  processFiles(src, out);
  saveIndexFile(out);
}

module.exports = {
  process,
};
