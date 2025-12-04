// eslint.config.js
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
// 注意：需要检查你项目中是否实际安装了以下包
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'
import typescriptParser from '@typescript-eslint/parser'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'

export default [
  // 1. 定义需要忽略的文件（替代 .eslintignore）
  {
    ignores: ['node_modules/', 'dist/', 'out/', '*.config.*']
  },

  // 2. 应用 ESLint 推荐规则（对应旧配置中的 'eslint:recommended'）
  js.configs.recommended,

  // 3. 应用 Vue 3 推荐规则（对应旧配置中的 'plugin:vue/vue3-recommended'）
  // ...pluginVue.configs['flat/recommended'],

  // 4. 应用 TypeScript 相关规则（对应旧配置中的 '@vue/eslint-config-typescript/recommended'）
  // 注意：新配置中，你需要明确导入并展开 TypeScript 的推荐配置
  // 请确保已安装：npm install --save-dev typescript-eslint
  ...tseslint.configs.recommended,

  // 5. 针对 Vue 文件的特定配置
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: {
        // 关键：指定 TypeScript 解析器
        parser: typescriptParser,
        sourceType: 'module',
        ecmaVersion: 'latest'
      },
      // 关键：在这里配置环境
      globals: {
        // 使用扩展运算符合并所有浏览器全局变量
        ...globals.browser,
        // 如果你的项目也混合了Node.js环境，可以加上这个
        ...globals.node
      }
    },
    // 应用 TypeScript 插件
    plugins: {
      '@typescript-eslint': typescriptPlugin
    }
  },

  // 6. 应用 Prettier 配置以禁用冲突的格式规则（对应旧配置中的 '@vue/eslint-config-prettier'）
  // 注意：新版本中，`eslint-config-prettier` 导出的规则可以直接展开使用[citation:5]
  prettier,

  // 7. 应用你的自定义规则（覆盖之前的所有规则）
  {
    rules: {
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      semi: [1, 'never'],
      // 定义后不使用
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
]
